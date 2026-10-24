import json
from typing import Dict, Set, Optional
from fastapi import WebSocket

class ConnectionManager:
    """
    In-memory WebSocket Room Manager for zero-overhead in-app notifications.
    Groups active clients by propertyId to deliver sub-50ms real-time alerts.
    """
    def __init__(self):
        # Maps property_id -> set of active WebSockets
        self.active_rooms: Dict[str, Set[WebSocket]] = {}

    async def connect(self, property_id: str, websocket: WebSocket):
        await websocket.accept()
        if property_id not in self.active_rooms:
            self.active_rooms[property_id] = set()
        self.active_rooms[property_id].add(websocket)
        print(f"[WS Room] Client connected to property {property_id} (active in room: {len(self.active_rooms[property_id])})")

    def disconnect(self, property_id: str, websocket: WebSocket):
        if property_id in self.active_rooms:
            self.active_rooms[property_id].discard(websocket)
            if not self.active_rooms[property_id]:
                del self.active_rooms[property_id]
        print(f"[WS Room] Client disconnected from property {property_id}")

    async def broadcast_to_property(
        self,
        property_id: str,
        message: dict,
        exclude_socket: Optional[WebSocket] = None,
    ):
        if not property_id or property_id not in self.active_rooms:
            return

        dead_sockets = set()
        payload = json.dumps(message)

        for ws in self.active_rooms[property_id]:
            if ws is exclude_socket:
                continue
            try:
                await ws.send_text(payload)
            except Exception as e:
                # Mark failed or closed socket for cleanup
                dead_sockets.add(ws)

        # Prune dead sockets cleanly
        for ws in dead_sockets:
            self.disconnect(property_id, ws)

realtime_manager = ConnectionManager()
