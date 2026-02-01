import json
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import paho.mqtt.client as mqtt
from .ml_model import model

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MQTT Config
MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_TOPIC = "expertise_bodhon/cranes/vibration"

# Store active websocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error sending to WS: {e}")

manager = ConnectionManager()

# MQTT Client Setup
def on_mqtt_connect(client, userdata, flags, rc):
    print(f"Connected to MQTT Broker with result code {rc}")
    client.subscribe(MQTT_TOPIC)

def on_mqtt_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        # print(f"Received MQTT: {payload['machine_id']}")
        
        # Run ML Prediction
        rul = model.predict(payload['vibration_rms'], payload['temperature'])
        payload['predicted_rul'] = rul
        
        # Broadcast to WebSockets (Main loop needs to handle this async)
        # Since paho-mqtt runs in a separate thread, we can't await directly.
        # We'll push to an asyncio queue or run_coroutine_threadsafe if we had the loop,
        # but for simplicity in this mock, let's use a queue or just print for now.
        # IMPROVEMENT: Use simple global queue used by a background task.
        asyncio.run_coroutine_threadsafe(manager.broadcast(payload), loop)
    except Exception as e:
        print(f"Error processing MQTT message: {e}")

# Global Event Loop
loop = None

@app.on_event("startup")
async def startup_event():
    global loop
    loop = asyncio.get_running_loop()
    
    # Start MQTT Client
    client = mqtt.Client()
    client.on_connect = on_mqtt_connect
    client.on_message = on_mqtt_message
    
    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_start()
    except Exception as e:
        print(f"Failed to connect to MQTT: {e}")

@app.get("/")
def read_root():
    return {"status": "Bodhon Industrial Nervous System Online"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
