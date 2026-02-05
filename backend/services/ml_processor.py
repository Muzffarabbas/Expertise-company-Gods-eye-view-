import json
import time
from kafka import KafkaConsumer, KafkaProducer
import sys
import os

# Add parent directory to path to allow importing app.ml_model
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.ml_model import model

# Configuration
KAFKA_BROKER = "localhost:9092"
SOURCE_TOPIC = "sensor_raw"
DEST_TOPIC = "sensor_enriched"

def main():
    print("Starting ML Processor...")
    # Wait for Kafka
    time.sleep(15)

    try:
        consumer = KafkaConsumer(
            SOURCE_TOPIC,
            bootstrap_servers=[KAFKA_BROKER],
            auto_offset_reset='latest',
            enable_auto_commit=True,
            group_id='ml_processor_group',
            value_deserializer=lambda x: json.loads(x.decode('utf-8'))
        )

        producer = KafkaProducer(
            bootstrap_servers=[KAFKA_BROKER],
            value_serializer=lambda x: json.dumps(x).encode('utf-8')
        )

        print(f"Listening on {SOURCE_TOPIC}...")

        for message in consumer:
            payload = message.value
            try:
                # Run ML Prediction
                rul = model.predict(payload['vibration_rms'], payload['temperature'])
                payload['predicted_rul'] = rul
                
                # Send to Enriched Topic
                producer.send(DEST_TOPIC, value=payload)
                # print(f"Processed {payload['machine_id']} -> RUL: {rul}")
                
            except Exception as e:
                print(f"Error processing message: {e}")

    except Exception as e:
        print(f"Critical ML Processor Error: {e}")

if __name__ == "__main__":
    main()
