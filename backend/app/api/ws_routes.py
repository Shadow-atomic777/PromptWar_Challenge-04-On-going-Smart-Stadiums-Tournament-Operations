"""WebSocket endpoints for real-time data streaming."""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.ws_manager import manager

router = APIRouter()


@router.websocket("/ws/ops")
async def ops_websocket(websocket: WebSocket):
    """Real-time ops dashboard feed — receives full state updates every tick."""
    await manager.connect_ops(websocket)
    try:
        while True:
            # Keep connection alive, listen for any commands from ops
            data = await websocket.receive_text()
            # Could handle ops commands here (e.g., trigger emergency)
            if data == "ping":
                await websocket.send_text('{"type": "pong"}')
    except WebSocketDisconnect:
        await manager.disconnect_ops(websocket)
    except Exception:
        await manager.disconnect_ops(websocket)


@router.websocket("/ws/fan/{fan_id}")
async def fan_websocket(fan_id: str, websocket: WebSocket):
    """Personalized fan notifications — receives targeted alerts."""
    await manager.connect_fan(fan_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text('{"type": "pong"}')
    except WebSocketDisconnect:
        await manager.disconnect_fan(fan_id)
    except Exception:
        await manager.disconnect_fan(fan_id)
