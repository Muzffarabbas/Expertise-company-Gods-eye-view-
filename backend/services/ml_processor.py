
# Edit .env and set ESP32_IP to your NodeMCU's IP addressimport json
import time
from kafka import KafkaConsumer, KafkaProducer
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.ml_model import model

# Configuration
KAFKA_BROKER = "localhost:9092"
SOURCE_TOPIC = "sensor_raw"
DEST_TOPIC = "sensor_enriched"

def main():
    print("Starting ML Processor with Real ML Models...")
    # Wait for Kafka to be ready
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

        print(f"✓ Listening on Kafka topic '{SOURCE_TOPIC}'...")

        for message in consumer:
            payload = message.value
            try:
                # Extract sensor features
                vibration_rms = payload.get('vibration_rms', 0.5)
                temperature = payload.get('temperature', 70)
                humidity = payload.get('humidity', 50)
                
                # Run Real ML Predictions
                ml_results = model.predict(vibration_rms, temperature, humidity)
                
                # Enrich payload with ML predictions
                payload.update({
                    'predicted_rul': ml_results['predicted_rul'],
                    'anomaly_score': ml_results['anomaly_score'],
                    'failure_class': ml_results['failure_class'],
                    'failure_probability': ml_results['failure_probability'],
                    'ml_model_version': '1.0_real'
                })
                
                # Send to Enriched Topic
                producer.send(DEST_TOPIC, value=payload)
                
                # Log significant events
                if ml_results['anomaly_score'] > 0.7 or ml_results['failure_class'] != 'normal':
                    print(f"⚠ {payload['machine_id']}: RUL={ml_results['predicted_rul']}h, "
                          f"Anomaly={ml_results['anomaly_score']}, "
                          f"Status={ml_results['failure_class']}")
                
            except Exception as e:
                print(f"✗ Error processing message: {e}")

    except Exception as e:
        print(f"✗ Critical ML Processor Error: {e}")

if __name__ == "__main__":
    main()