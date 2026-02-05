import json
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Kafka Config
KAFKA_BROKER = "localhost:9092"
KAFKA_TOPIC = "sensor_enriched"

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

# Kafka Consumer Background Task
async def consume_kafka():
    from aiokafka import AIOKafkaConsumer
    import json
    
    print("Starting Kafka Consumer...")
    # Retry connection
    while True:
        try:
            consumer = AIOKafkaConsumer(
                KAFKA_TOPIC,
                bootstrap_servers=KAFKA_BROKER,
                group_id="backend_dashboard_group",
                value_deserializer=lambda x: json.loads(x.decode('utf-8'))
            )
            await consumer.start()
            break
        except Exception as e:
            print(f"Waiting for Kafka... ({e})")
            await asyncio.sleep(5)
            
    try:
        async for msg in consumer:
            payload = msg.value
            # Broadcast to WebSockets
            await manager.broadcast(payload)
    except Exception as e:
        print(f"Kafka Consumer Error: {e}")
    finally:
        await consumer.stop()

@app.on_event("startup")
async def startup_event():
    # Start Kafka Consumer in background
    asyncio.create_task(consume_kafka())

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
