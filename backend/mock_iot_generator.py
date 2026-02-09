import time
import json
import random
import paho.mqtt.client as mqtt
import requests
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

BROKER = os.getenv("MQTT_BROKER", "localhost")
PORT = int(os.getenv("MQTT_PORT", 1883))
TOPIC = "expertise_bodhon/cranes/vibration"

# ESP32 Configuration
ESP32_IP = os.getenv("ESP32_IP", "192.168.1.100")
ESP32_PORT = int(os.getenv("ESP32_PORT", 8080))
ESP32_ENDPOINT = f"http://{ESP32_IP}:{ESP32_PORT}/api/sensors"
ESP32_TIMEOUT = 5  # seconds
ESP32_RETRY_INTERVAL = 30  # seconds

# Mock Asset IDs matching the frontend
ASSET_IDS = [f"CRN-{1000 + i}" for i in range(15)]

# Track ESP32 availability
esp32_available = False
last_esp32_attempt = 0

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"✓ Connected to MQTT Broker @ {BROKER}:{PORT}")
    else:
        print(f"✗ Failed to connect to MQTT, return code {rc}")

def get_esp32_sensor_data(asset_id):
    """
    Try to fetch real sensor data from ESP32 NodeMCU
    Expected ESP32 response format:
    {
        "vibration_rms": 0.8,
        "humidity": 65,
        "temperature": 72  (optional - falls back to mock)
    }
    """
    global esp32_available, last_esp32_attempt
    
    current_time = time.time()
    
    # Skip if we just tried and failed
    if not esp32_available and (current_time - last_esp32_attempt) < ESP32_RETRY_INTERVAL:
        return None
    
    try:
        last_esp32_attempt = current_time
        response = requests.get(
            ESP32_ENDPOINT,
            params={"device_id": asset_id},
            timeout=ESP32_TIMEOUT
        )
        
        if response.status_code == 200:
            data = response.json()
            esp32_available = True
            print(f"✓ ESP32 data received for {asset_id}: Vib={data.get('vibration_rms')}, Hum={data.get('humidity')}%")
            return data
        else:
            esp32_available = False
            return None
            
    except requests.exceptions.Timeout:
        esp32_available = False
        print(f"✗ ESP32 connection timeout (will retry in {ESP32_RETRY_INTERVAL}s)")
        return None
    except requests.exceptions.ConnectionError:
        esp32_available = False
        # Silently fail for connection errors (device may be offline)
        return None
    except Exception as e:
        esp32_available = False
        print(f"✗ Error fetching ESP32 data: {e}")
        return None

def generate_payload(asset_id):
    """
    Generate sensor payload:
    - Try to get vibration + humidity from ESP32
    - Fall back to mock data if ESP32 unavailable
    - Always use mock temperature (can be enhanced later)
    """
    esp32_data = get_esp32_sensor_data(asset_id)
    
    if esp32_data:
        # Real data from ESP32
        vibration_rms = esp32_data.get('vibration_rms', 0.7)
        humidity = esp32_data.get('humidity', 60)
        temperature = esp32_data.get('temperature', 72)  # Optional
        source = "esp32"
    else:
        # Mock data fallback
        is_abnormal = random.random() > 0.95
        
        if is_abnormal:
            vibration_rms = 2.5 + random.uniform(0, 3.0)  # High vibration
        else:
            vibration_rms = 0.5 + random.uniform(0, 1.0)  # Normal vibration
        
        humidity = 40 + random.uniform(0, 40)  # 40-80%
        temperature = 65 + random.uniform(-5, 15)
        source = "mock"
    
    # Determine status based on vibration
    if vibration_rms > 2.5:
        status = "WARNING"
    else:
        status = "NORMAL"
    
    payload = {
        "machine_id": asset_id,
        "timestamp": datetime.now().isoformat(),
        "vibration_rms": round(vibration_rms, 2),
        "temperature": round(temperature, 1),
        "humidity": round(humidity, 1),
        "status": status,
        "data_source": source,
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
        
        print(f"Mock IoT Generator Started")
        print(f"  MQTT Broker: {BROKER}:{PORT}")
        print(f"  ESP32 Endpoint: {ESP32_ENDPOINT} (fallback in {ESP32_RETRY_INTERVAL}s)")
        print("  Press Ctrl+C to stop.\n")
        
        while True:
            for asset_id in ASSET_IDS:
                # Randomly skip some to simulate different reporting intervals
                if random.random() > 0.7:
                    continue
                
                payload = generate_payload(asset_id)
                client.publish(TOPIC, json.dumps(payload))
                
            time.sleep(1)  # Publish burst every second
            
    except KeyboardInterrupt:
        print("\n✓ Stopping Mock Generator...")
        client.loop_stop()
        client.disconnect()
    except Exception as e:
        print(f"✗ Error: {e}")

if __name__ == "__main__":
    main()