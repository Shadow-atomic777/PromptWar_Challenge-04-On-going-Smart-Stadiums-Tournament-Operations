import aiosqlite
from pathlib import Path

DB_PATH = Path(__file__).parent.parent.parent / "omnistadium.db"


async def get_db() -> aiosqlite.Connection:
    """Get an async database connection optimized with WAL mode."""
    db = await aiosqlite.connect(str(DB_PATH))
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA journal_mode=WAL;")
    await db.execute("PRAGMA synchronous=NORMAL;")
    return db


async def init_db():
    """Initialize database tables."""
    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS incidents (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL,
                severity TEXT NOT NULL,
                sector TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'active',
                responders_assigned INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved_at TIMESTAMP
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS agent_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                agent_name TEXT NOT NULL,
                action TEXT NOT NULL,
                input_data TEXT,
                output_data TEXT,
                duration_ms REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS fan_sessions (
                fan_id TEXT PRIMARY KEY,
                sector TEXT,
                last_query TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS staff (
                staff_id TEXT PRIMARY KEY,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT DEFAULT 'ops',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS fans (
                ticket_id TEXT PRIMARY KEY,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.commit()
        print("[Database] initialized successfully")


async def close_db():
    """Cleanup - remove db file if needed."""
    pass
