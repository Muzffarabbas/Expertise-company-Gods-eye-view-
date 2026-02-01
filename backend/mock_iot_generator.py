import time
import json
import random
import paho.mqtt.client as mqtt
from datetime import datetime

BROKER = "localhost"
PORT = 1883
TOPIC = "expertise_bodhon/cranes/vibration"

# Mock Asset IDs matching the frontend
ASSET_IDS = [f"CRN-{1000 + i}" for i in range(15)]

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"Connected to MQTT Broker @ {BROKER}")
    else:
        print(f"Failed to connect, return code {rc}")

def generate_payload(asset_id):
    # Simulate normal vs abnormal behavior
    is_abnormal = random.random() > 0.95
    
    if is_abnormal:
        rms = 2.5 + random.uniform(0, 3.0)  # High vibration
        status = "WARNING"
    else:
        rms = 0.5 + random.uniform(0, 1.0)  # Normal vibration
        status = "NORMAL"

    payload = {
        "machine_id": asset_id,
        "timestamp": datetime.now().isoformat(),
        "vibration_rms": round(rms, 2),
        "temperature": round(65 + random.uniform(-5, 15), 1),
        "status": status,
        "location": {
            "lat": 27.0 + random.uniform(-0.1, 0.1),
            "lng": 49.6 + random.uniform(-0.1, 0.1)
        }
    }
    return payload

def main():
    client = mqtt.Client()
    client.on_connect = on_connect
    
    try:
        client.connect(BROKER, PORT, 60)
        client.loop_start()
        
        print("Mock IoT Generator Started... Press Ctrl+C to stop.")
        
        while True:
            for asset_id in ASSET_IDS:
                # Randomly skip some to simulate different reporting intervals
                if random.random() > 0.7:
                    continue
                
                payload = generate_payload(asset_id)
                client.publish(TOPIC, json.dumps(payload))
                # print(f"Published to {TOPIC}: {payload['machine_id']} - RMS: {payload['vibration_rms']}")
                
            time.sleep(1) # Publish burst every second
            
    except KeyboardInterrupt:
        print("\nStopping Mock Generator...")
        client.loop_stop()
        client.disconnect()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
