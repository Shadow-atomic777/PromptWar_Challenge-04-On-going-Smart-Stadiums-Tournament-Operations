import asyncio
import sys
import os

# Ensure backend directory is in path so 'app' can be imported
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import init_db

async def main():
    print("Initializing Database...")
    await init_db()
    print("Done!")

if __name__ == "__main__":
    asyncio.run(main())
