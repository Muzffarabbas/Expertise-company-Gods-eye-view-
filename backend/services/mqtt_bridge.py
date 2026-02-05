import json
import time
import os
import paho.mqtt.client as mqtt
from kafka import KafkaProducer

# Configuration
MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_TOPIC = "expertise_bodhon/cranes/vibration"

KAFKA_BROKER = "localhost:9092"
KAFKA_TOPIC = "sensor_raw"

# Initialize Kafka Producer
producer = None

def get_kafka_producer():
    global producer
    if producer is None:
        try:
            producer = KafkaProducer(
                bootstrap_servers=[KAFKA_BROKER],
                value_serializer=lambda x: json.dumps(x).encode('utf-8')
            )
            print("Connected to Kafka Broker")
        except Exception as e:
            print(f"Failed to connect to Kafka: {e}")
    return producer

def on_connect(client, userdata, flags, rc):
    print(f"Connected to MQTT Broker with result code {rc}")
    client.subscribe(MQTT_TOPIC)

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        # print(f"Received from MQTT: {payload['machine_id']}")
        
        prod = get_kafka_producer()
        if prod:
            prod.send(KAFKA_TOPIC, value=payload)
            # print(f"Sent to Kafka topic {KAFKA_TOPIC}")
    except Exception as e:
        print(f"Error bridging message: {e}")

def main():
    # Wait for Kafka to be ready
    print("Waiting for Kafka to be ready...")
    time.sleep(10) 
    
    get_kafka_producer()

    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message

    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_forever()
    except Exception as e:
        print(f"MQTT Connection Error: {e}")

if __name__ == "__main__":
    main()
