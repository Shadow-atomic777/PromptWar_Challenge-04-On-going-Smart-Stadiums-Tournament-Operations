"""WebSocket connection manager for real-time broadcasting."""
from fastapi import WebSocket
import json
import asyncio
from typing import Any
import logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


class ConnectionManager:
    """Manages WebSocket connections for ops dashboard and fan clients."""

    def __init__(self):
        # Ops dashboard connections
        self.ops_connections: list[WebSocket] = []
        # Fan connections keyed by fan_id
        self.fan_connections: dict[str, WebSocket] = {}
        self._lock = asyncio.Lock()

    async def connect_ops(self, websocket: WebSocket):
        """Accept an ops dashboard WebSocket connection."""
        await websocket.accept()
        async with self._lock:
            self.ops_connections.append(websocket)
        logger.info(f"[WS] Ops client connected. Total: {len(self.ops_connections)}")

    async def disconnect_ops(self, websocket: WebSocket):
        """Remove an ops dashboard connection."""
        async with self._lock:
            if websocket in self.ops_connections:
                self.ops_connections.remove(websocket)
        logger.info(f"[WS] Ops client disconnected. Total: {len(self.ops_connections)}")

    async def connect_fan(self, fan_id: str, websocket: WebSocket):
        """Accept a fan WebSocket connection."""
        await websocket.accept()
        async with self._lock:
            self.fan_connections[fan_id] = websocket
        logger.info(f"[WS] Fan {fan_id} connected. Total fans: {len(self.fan_connections)}")

    async def disconnect_fan(self, fan_id: str):
        """Remove a fan connection."""
        async with self._lock:
            self.fan_connections.pop(fan_id, None)
        logger.info(f"[WS] Fan {fan_id} disconnected. Total fans: {len(self.fan_connections)}")

    async def broadcast_ops(self, data: dict[str, Any]):
        """Broadcast data to all ops dashboard clients."""
        if not self.ops_connections:
            return
        message = json.dumps(data, default=str)
        disconnected = []
        # Snapshot the list to avoid iteration-mutation issues
        async with self._lock:
            connections = list(self.ops_connections)
        for connection in connections:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.append(connection)

        # Clean up disconnected clients (modify list under lock)
        if disconnected:
            async with self._lock:
                for conn in disconnected:
                    if conn in self.ops_connections:
                        self.ops_connections.remove(conn)

    async def send_to_fan(self, fan_id: str, data: dict[str, Any]):
        """Send a message to a specific fan."""
        websocket = self.fan_connections.get(fan_id)
        if websocket:
            try:
                await websocket.send_text(json.dumps(data, default=str))
            except Exception:
                await self.disconnect_fan(fan_id)

    async def broadcast_fans(self, data: dict[str, Any]):
        """Broadcast to all connected fans."""
        message = json.dumps(data, default=str)
        disconnected = []
        # Snapshot to avoid iteration-mutation issues
        async with self._lock:
            fan_items = list(self.fan_connections.items())
        for fan_id, connection in fan_items:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.append(fan_id)

        if disconnected:
            async with self._lock:
                for fan_id in disconnected:
                    self.fan_connections.pop(fan_id, None)

    @property
    def ops_count(self) -> int:
        return len(self.ops_connections)

    @property
    def fan_count(self) -> int:
        return len(self.fan_connections)


# Singleton instance
manager = ConnectionManager()
