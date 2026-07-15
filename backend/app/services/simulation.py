"""Stadium simulation engine — generates realistic live data for all stadium systems."""
import asyncio
import random
import uuid
from datetime import datetime, timezone
from typing import Any

from app.core.config import get_settings
from app.services.ws_manager import manager
from app.models.crowd import SectorDensity, CrowdSnapshot, DensityStatus
from app.models.queue import QueueInfo, QueueSnapshot, QueueType, QueueStatus
from app.models.parking import ParkingLot, ParkingSnapshot, ParkingStatus
from app.models.medical import MedicalIncident, MedicalSnapshot, IncidentSeverity, IncidentType, IncidentStatus
from app.models.weather import WeatherSnapshot, WeatherCondition, WeatherAlert, WeatherAlertLevel
from app.models.stadium import Gate, MatchInfo, StadiumSnapshot, GateStatus, MatchPhase
import logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

settings = get_settings()

# Stadium sector definitions
SECTORS = [
    {"id": "north_lower", "name": "North Stand - Lower", "capacity": 12000},
    {"id": "north_upper", "name": "North Stand - Upper", "capacity": 10000},
    {"id": "south_lower", "name": "South Stand - Lower", "capacity": 12000},
    {"id": "south_upper", "name": "South Stand - Upper", "capacity": 10000},
    {"id": "east_lower", "name": "East Stand - Lower", "capacity": 8000},
    {"id": "east_upper", "name": "East Stand - Upper", "capacity": 6000},
    {"id": "west_lower", "name": "West Stand - Lower", "capacity": 8000},
    {"id": "west_upper", "name": "West Stand - Upper", "capacity": 6000},
    {"id": "vip", "name": "VIP Suites", "capacity": 4000},
    {"id": "concourse", "name": "Main Concourse", "capacity": 4000},
]

# Queue definitions
QUEUES = [
    {"id": "food_north", "name": "Burger Stand - North", "type": QueueType.FOOD, "sector": "north_lower"},
    {"id": "food_south", "name": "Pizza Corner - South", "type": QueueType.FOOD, "sector": "south_lower"},
    {"id": "food_east", "name": "Taco Bar - East", "type": QueueType.FOOD, "sector": "east_lower"},
    {"id": "food_west", "name": "Hot Dog Stand - West", "type": QueueType.FOOD, "sector": "west_lower"},
    {"id": "food_vip", "name": "VIP Dining - Suites", "type": QueueType.FOOD, "sector": "vip"},
    {"id": "rest_north", "name": "Restrooms - North", "type": QueueType.RESTROOM, "sector": "north_lower"},
    {"id": "rest_south", "name": "Restrooms - South", "type": QueueType.RESTROOM, "sector": "south_lower"},
    {"id": "rest_east", "name": "Restrooms - East", "type": QueueType.RESTROOM, "sector": "east_lower"},
    {"id": "rest_west", "name": "Restrooms - West", "type": QueueType.RESTROOM, "sector": "west_lower"},
    {"id": "merch_main", "name": "Official Merch Store", "type": QueueType.MERCHANDISE, "sector": "concourse"},
    {"id": "merch_south", "name": "Fan Shop - South", "type": QueueType.MERCHANDISE, "sector": "south_lower"},
]

# Parking lot definitions
PARKING_LOTS = [
    {"id": "lot_a", "name": "Lot A - Main", "total": 5000, "distance": 100},
    {"id": "lot_b", "name": "Lot B - East", "total": 3000, "distance": 250},
    {"id": "lot_c", "name": "Lot C - West", "total": 3000, "distance": 300},
    {"id": "lot_d", "name": "Lot D - Remote", "total": 4000, "distance": 600},
    {"id": "lot_vip", "name": "VIP Parking", "total": 500, "distance": 50},
]

# Gate definitions
GATES = [
    {"id": "gate_a", "name": "Gate A - North", "sector": "north_lower"},
    {"id": "gate_b", "name": "Gate B - South", "sector": "south_lower"},
    {"id": "gate_c", "name": "Gate C - East", "sector": "east_lower"},
    {"id": "gate_d", "name": "Gate D - West", "sector": "west_lower"},
    {"id": "gate_vip", "name": "VIP Entrance", "sector": "vip"},
]


class SimulationEngine:
    """Generates realistic stadium simulation data and broadcasts via WebSocket."""

    def __init__(self):
        self.running = False
        self.tick_count = 0

        # Match state
        self.match_minute = 0
        self.match_phase = MatchPhase.PRE_MATCH
        self.home_score = 0
        self.away_score = 0

        # State trackers (smoothly varying values)
        self._sector_counts: dict[str, int] = {}
        self._queue_lengths: dict[str, int] = {}
        self._parking_occupied: dict[str, int] = {}
        self._incidents: list[MedicalIncident] = []
        self._resolved_count = 0

        # Weather state
        self._temperature = 32.0
        self._humidity = 65.0
        self._wind_speed = 12.0
        self._weather_condition = WeatherCondition.SUNNY

        self._initialize_state()

    def _initialize_state(self):
        """Set initial state values."""
        # Start with ~70% attendance filling in
        for sector in SECTORS:
            self._sector_counts[sector["id"]] = int(sector["capacity"] * random.uniform(0.5, 0.75))

        # Initialize queues with moderate wait
        for q in QUEUES:
            self._queue_lengths[q["id"]] = random.randint(5, 25)

        # Parking starts ~80% full (people already arrived)
        for lot in PARKING_LOTS:
            self._parking_occupied[lot["id"]] = int(lot["total"] * random.uniform(0.7, 0.9))

    def _now(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    def _get_density_status(self, pct: float) -> DensityStatus:
        if pct < 50:
            return DensityStatus.LOW
        elif pct < 75:
            return DensityStatus.NORMAL
        elif pct < 90:
            return DensityStatus.WARNING
        return DensityStatus.CRITICAL

    def _get_queue_status(self, wait: float) -> QueueStatus:
        if wait < 5:
            return QueueStatus.SHORT
        elif wait < 12:
            return QueueStatus.MODERATE
        elif wait < 20:
            return QueueStatus.LONG
        return QueueStatus.VERY_LONG

    def _get_parking_status(self, pct: float) -> ParkingStatus:
        if pct < 60:
            return ParkingStatus.AVAILABLE
        elif pct < 80:
            return ParkingStatus.FILLING
        elif pct < 95:
            return ParkingStatus.ALMOST_FULL
        return ParkingStatus.FULL

    def _advance_match(self):
        """Advance the match clock."""
        if self.match_phase == MatchPhase.PRE_MATCH:
            if self.tick_count > 12:  # ~60s, move to first half
                self.match_phase = MatchPhase.FIRST_HALF
                self.match_minute = 1
        elif self.match_phase == MatchPhase.FIRST_HALF:
            self.match_minute += 1
            if random.random() < 0.02:  # ~2% chance of goal per tick
                if random.random() < 0.5:
                    self.home_score += 1
                else:
                    self.away_score += 1
            if self.match_minute >= 45:
                self.match_phase = MatchPhase.HALFTIME
        elif self.match_phase == MatchPhase.HALFTIME:
            if self.tick_count % 36 == 0:  # ~3 min halftime
                self.match_phase = MatchPhase.SECOND_HALF
                self.match_minute = 46
        elif self.match_phase == MatchPhase.SECOND_HALF:
            self.match_minute += 1
            if random.random() < 0.02:
                if random.random() < 0.5:
                    self.home_score += 1
                else:
                    self.away_score += 1
            if self.match_minute >= 90:
                self.match_phase = MatchPhase.POST_MATCH

    def _tick_crowds(self):
        """Update crowd density with smooth variations."""
        for sector in SECTORS:
            sid = sector["id"]
            current = self._sector_counts[sid]
            cap = sector["capacity"]

            # Halftime: people move to concourse and food areas
            if self.match_phase == MatchPhase.HALFTIME:
                if sid == "concourse":
                    delta = random.randint(50, 200)
                else:
                    delta = random.randint(-150, -20)
            elif self.match_phase == MatchPhase.POST_MATCH:
                delta = random.randint(-200, -50)
            else:
                delta = random.randint(-80, 80)

            new_count = max(0, min(cap, current + delta))
            self._sector_counts[sid] = new_count

    def _tick_queues(self):
        """Update queue lengths."""
        for q in QUEUES:
            qid = q["id"]
            current = self._queue_lengths[qid]

            # Halftime: queues get much longer
            if self.match_phase == MatchPhase.HALFTIME:
                delta = random.randint(2, 15)
            elif self.match_phase in (MatchPhase.FIRST_HALF, MatchPhase.SECOND_HALF):
                delta = random.randint(-5, 3)
            else:
                delta = random.randint(-3, 5)

            new_length = max(0, min(80, current + delta))
            self._queue_lengths[qid] = new_length

    def _tick_parking(self):
        """Update parking lot occupancy."""
        for lot in PARKING_LOTS:
            lid = lot["id"]
            current = self._parking_occupied[lid]
            total = lot["total"]

            if self.match_phase == MatchPhase.PRE_MATCH:
                delta = random.randint(5, 30)  # Cars arriving
            elif self.match_phase == MatchPhase.POST_MATCH:
                delta = random.randint(-40, -10)  # Cars leaving
            else:
                delta = random.randint(-3, 3)

            new_occ = max(0, min(total, current + delta))
            self._parking_occupied[lid] = new_occ

    def _tick_incidents(self):
        """Randomly generate or resolve medical incidents."""
        # Small chance of new incident each tick
        if random.random() < 0.08:
            sectors = [s["id"] for s in SECTORS]
            incident = MedicalIncident(
                incident_id=str(uuid.uuid4())[:8],
                incident_type=random.choice(list(IncidentType)),
                severity=random.choices(
                    list(IncidentSeverity),
                    weights=[40, 35, 20, 5]
                )[0],
                sector=random.choice(sectors),
                description=self._generate_incident_description(),
                status=IncidentStatus.ACTIVE,
                responders_assigned=0,
                created_at=self._now(),
            )
            self._incidents.append(incident)

        # Progress existing incidents
        still_active = []
        for incident in self._incidents:
            if incident.status == IncidentStatus.ACTIVE:
                if random.random() < 0.3:
                    incident.status = IncidentStatus.RESPONDING
                    incident.responders_assigned = random.randint(1, 3)
                still_active.append(incident)
            elif incident.status == IncidentStatus.RESPONDING:
                if random.random() < 0.2:
                    incident.status = IncidentStatus.RESOLVED
                    incident.resolved_at = self._now()
                    self._resolved_count += 1
                else:
                    still_active.append(incident)

        self._incidents = still_active

    def _generate_incident_description(self) -> str:
        descriptions = [
            "Fan reporting dizziness and nausea near concession stand",
            "Minor fall on wet stairs, possible sprained ankle",
            "Heat-related symptoms, fan requesting medical assistance",
            "Child separated from parent, security notified",
            "Dehydration symptoms in upper deck, high sun exposure area",
            "Fan with allergic reaction after consuming stadium food",
            "Elderly attendee reporting chest discomfort",
            "Slip and fall near restroom area, minor injury",
        ]
        return random.choice(descriptions)

    def _tick_weather(self):
        """Update weather with small variations."""
        self._temperature += random.uniform(-0.3, 0.3)
        self._temperature = max(25.0, min(42.0, self._temperature))

        self._humidity += random.uniform(-1, 1)
        self._humidity = max(30.0, min(90.0, self._humidity))

        self._wind_speed += random.uniform(-0.5, 0.5)
        self._wind_speed = max(0.0, min(40.0, self._wind_speed))

        # Occasionally change condition
        if random.random() < 0.05:
            self._weather_condition = random.choice(list(WeatherCondition))

    # ---- Snapshot builders ----

    def get_crowd_snapshot(self) -> CrowdSnapshot:
        sectors = []
        total = 0
        hotspots = []

        for sector_def in SECTORS:
            sid = sector_def["id"]
            count = self._sector_counts[sid]
            cap = sector_def["capacity"]
            pct = (count / cap * 100) if cap > 0 else 0
            status = self._get_density_status(pct)

            if status == DensityStatus.CRITICAL:
                hotspots.append(sector_def["name"])

            sectors.append(SectorDensity(
                sector_id=sid,
                sector_name=sector_def["name"],
                capacity=cap,
                current_count=count,
                density_percentage=round(pct, 1),
                status=status,
                trend=random.choice(["rising", "falling", "stable"]),
            ))
            total += count

        overall = (total / settings.STADIUM_CAPACITY * 100) if settings.STADIUM_CAPACITY > 0 else 0

        return CrowdSnapshot(
            timestamp=self._now(),
            total_attendance=total,
            stadium_capacity=settings.STADIUM_CAPACITY,
            overall_density=round(overall, 1),
            sectors=sectors,
            hotspots=hotspots,
        )

    def get_queue_snapshot(self) -> QueueSnapshot:
        queues = []
        total_wait = 0.0
        busiest = None
        max_wait = 0.0

        for q_def in QUEUES:
            qid = q_def["id"]
            length = self._queue_lengths[qid]
            service_rate = 2.5 if q_def["type"] == QueueType.RESTROOM else 2.0
            wait = length / service_rate if service_rate > 0 else 0
            status = self._get_queue_status(wait)

            if wait > max_wait:
                max_wait = wait
                busiest = q_def["name"]

            queues.append(QueueInfo(
                queue_id=qid,
                name=q_def["name"],
                queue_type=q_def["type"],
                sector=q_def["sector"],
                current_wait_minutes=round(wait, 1),
                queue_length=length,
                status=status,
                estimated_service_rate=service_rate,
            ))
            total_wait += wait

        avg_wait = total_wait / len(queues) if queues else 0

        return QueueSnapshot(
            timestamp=self._now(),
            queues=queues,
            average_wait_minutes=round(avg_wait, 1),
            busiest_queue=busiest,
        )

    def get_parking_snapshot(self) -> ParkingSnapshot:
        lots = []
        total_spaces = 0
        total_occupied = 0

        for lot_def in PARKING_LOTS:
            lid = lot_def["id"]
            occ = self._parking_occupied[lid]
            total = lot_def["total"]
            avail = total - occ
            pct = (occ / total * 100) if total > 0 else 0

            lots.append(ParkingLot(
                lot_id=lid,
                name=lot_def["name"],
                total_spaces=total,
                occupied=occ,
                available=avail,
                percentage_full=round(pct, 1),
                status=self._get_parking_status(pct),
                distance_to_gate_meters=lot_def["distance"],
            ))
            total_spaces += total
            total_occupied += occ

        return ParkingSnapshot(
            timestamp=self._now(),
            lots=lots,
            total_spaces=total_spaces,
            total_occupied=total_occupied,
            overall_percentage=round((total_occupied / total_spaces * 100) if total_spaces > 0 else 0, 1),
        )

    def get_medical_snapshot(self) -> MedicalSnapshot:
        active = [i for i in self._incidents if i.status != IncidentStatus.RESOLVED]
        return MedicalSnapshot(
            timestamp=self._now(),
            active_incidents=active,
            total_active=len(active),
            total_resolved_today=self._resolved_count,
            medical_stations_available=random.randint(3, 6),
            ambulances_on_standby=random.randint(2, 4),
        )

    def get_weather_snapshot(self) -> WeatherSnapshot:
        alerts = []
        if self._temperature > 38:
            alerts.append(WeatherAlert(
                alert_type="Extreme Heat",
                level=WeatherAlertLevel.WARNING,
                message=f"Temperature at {self._temperature:.1f}°C. Hydration stations activated.",
                issued_at=self._now(),
            ))
        if self._wind_speed > 30:
            alerts.append(WeatherAlert(
                alert_type="High Wind",
                level=WeatherAlertLevel.ADVISORY,
                message=f"Wind speeds at {self._wind_speed:.1f} km/h. Temporary structures secured.",
                issued_at=self._now(),
            ))
        if self._weather_condition == WeatherCondition.STORMY:
            alerts.append(WeatherAlert(
                alert_type="Storm Warning",
                level=WeatherAlertLevel.SEVERE,
                message="Thunderstorm approaching. Consider shelter protocols.",
                issued_at=self._now(),
            ))

        feels_like = self._temperature + (self._humidity - 50) * 0.1
        heat_index = self._temperature + 0.5 * (self._humidity - 50) * 0.05
        roof = "closed" if self._weather_condition in (WeatherCondition.RAINY, WeatherCondition.STORMY) else "open"

        return WeatherSnapshot(
            timestamp=self._now(),
            temperature_celsius=round(self._temperature, 1),
            feels_like_celsius=round(feels_like, 1),
            humidity_percent=round(self._humidity, 1),
            wind_speed_kmh=round(self._wind_speed, 1),
            condition=self._weather_condition,
            uv_index=round(random.uniform(5.0, 11.0), 1),
            heat_index=round(heat_index, 1),
            alerts=alerts,
            roof_status=roof,
        )

    def get_stadium_snapshot(self) -> StadiumSnapshot:
        gates = []
        for gate_def in GATES:
            status = GateStatus.OPEN
            if self.match_phase == MatchPhase.POST_MATCH:
                status = GateStatus.OPEN
            elif self.match_phase in (MatchPhase.FIRST_HALF, MatchPhase.SECOND_HALF):
                status = random.choice([GateStatus.OPEN, GateStatus.RESTRICTED])

            gates.append(Gate(
                gate_id=gate_def["id"],
                name=gate_def["name"],
                status=status,
                flow_rate=random.randint(20, 120),
                sector=gate_def["sector"],
            ))

        announcements = []
        if self.match_phase == MatchPhase.HALFTIME:
            announcements.append("Halftime — concessions and restrooms available.")
        if self._temperature > 35:
            announcements.append("Heat advisory: Free water available at all hydration stations.")

        return StadiumSnapshot(
            timestamp=self._now(),
            stadium_name=settings.STADIUM_NAME,
            gates=gates,
            match=MatchInfo(
                home_team="USA",
                away_team="Brazil",
                home_score=self.home_score,
                away_score=self.away_score,
                phase=self.match_phase,
                current_minute=self.match_minute,
            ),
            announcements=announcements,
        )

    def get_full_state(self) -> dict[str, Any]:
        """Get all simulation data as a single payload."""
        return {
            "type": "state_update",
            "tick": self.tick_count,
            "crowd": self.get_crowd_snapshot().model_dump(),
            "queues": self.get_queue_snapshot().model_dump(),
            "parking": self.get_parking_snapshot().model_dump(),
            "medical": self.get_medical_snapshot().model_dump(),
            "weather": self.get_weather_snapshot().model_dump(),
            "stadium": self.get_stadium_snapshot().model_dump(),
        }

    def trigger_emergency(self, sector: str = "north_lower") -> dict:
        """Manually trigger an emergency scenario for demo purposes."""
        # Create a critical incident
        incident = MedicalIncident(
            incident_id=str(uuid.uuid4())[:8],
            incident_type=IncidentType.CROWD_CRUSH,
            severity=IncidentSeverity.CRITICAL,
            sector=sector,
            description=f"EMERGENCY: Critical crowd density detected in {sector}. Immediate evacuation recommended.",
            status=IncidentStatus.ACTIVE,
            responders_assigned=0,
            created_at=self._now(),
        )
        self._incidents.append(incident)

        # Spike crowd density in affected sector
        for s in SECTORS:
            if s["id"] == sector:
                self._sector_counts[sector] = int(s["capacity"] * 0.98)
                break

        return {
            "status": "emergency_triggered",
            "incident": incident.model_dump(),
            "sector": sector,
        }

    def stop(self):
        """Stop the simulation loop."""
        self.running = False

    async def run(self):
        """Main simulation loop — ticks every N seconds and broadcasts state."""
        self.running = True
        logger.info("[Simulation] engine running...")

        while self.running:
            try:
                # Update all systems
                self._advance_match()
                self._tick_crowds()
                self._tick_queues()
                self._tick_parking()
                self._tick_incidents()
                self._tick_weather()

                self.tick_count += 1

                # Broadcast full state to all ops clients
                state = self.get_full_state()
                await manager.broadcast_ops(state)

                # Wait for next tick
                await asyncio.sleep(settings.SIMULATION_TICK_SECONDS)

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"[Simulation error]: {e}")
                await asyncio.sleep(settings.SIMULATION_TICK_SECONDS)

        logger.info("[Simulation] engine stopped.")
