# Live Collaborative Editor

This project is a real-time collaborative editor built with **FastAPI** and **WebSockets** on the backend, and a frontend (e.g., React) running on `localhost:3000`.

## 🧠 Features

- Real-time collaboration using WebSocket connections
- Unique client identification with UUIDs
- Live updates broadcasted to all connected users
- CORS configured to allow development with a separate frontend

---

## 🚀 Getting Started

### Backend (FastAPI)

#### Requirements

- Python 3.8+
- pip

#### Install Dependencies

```bash
pip install fastapi uvicorn


Run the Server
bash
Copy
Edit
uvicorn main:app --reload --host 0.0.0.0 --port 8000
By default, this will start the WebSocket server at ws://localhost:8000/ws.

Frontend (React)
Make sure your frontend connects to the backend WebSocket:

javascript
Copy
Edit
const socket = new WebSocket('ws://localhost:8000/ws');
Ensure your frontend runs on http://localhost:3000, which is already whitelisted in the backend CORS policy.

📁 File Structure
bash
Copy
Edit
├── main.py           # FastAPI WebSocket server
├── README.md         # This file
⚙️ How It Works
When a user connects via WebSocket, a unique client ID is generated.

Each edit (or "note") is broadcasted to all connected clients.

Upon connection, users receive the current state and the list of all connected users.

✅ To Do
Add persistent storage for notes

Implement user names or avatars

Add authentication

Add typing indicators

🛡️ CORS Policy
In main.py, CORS is configured to only allow:

python
Copy
Edit
origins = ["http://localhost:3000"]
You can update this list to allow other domains in production.

