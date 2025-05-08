from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from uuid import uuid4
from typing import List
from fastapi.middleware.cors import CORSMiddleware
import datetime

app = FastAPI()

origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],  # ✅ fixed: was `allow_header`
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.client_ids = {}  
        self.current_note : List[dict] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        client_id = str(uuid4())
        self.active_connections.append(websocket)
        self.client_ids[websocket] = client_id  
        await websocket.send_json({"type": "init", "client_id": client_id})
        await websocket.send_json({"type": "update", "note": self.current_note})
        await self.broadcast_users()
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        del self.client_ids[websocket]
    
    async def broadcast(self, message: dict): 
        for connection in self.active_connections:
            await connection.send_json(message)
    
    async def broadcast_users(self):
        user_ids = list(self.client_ids.values())
        await self.broadcast({"type": "users", "users": user_ids})

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            timestamp = datetime.datetime.now().isoformat()
            data = await websocket.receive_json()
            if data["type"] == "update":
                note_line = {
                    "client_id":manager.client_ids[websocket],
                    "content": data["note"],
                    "timestamp":timestamp
                }
                manager.current_note.append(note_line)
                manager.current_note = manager.current_note[-1000:]
                await manager.broadcast({"type":"update","note":manager.current_note})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast_users()
