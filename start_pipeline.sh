#!/bin/bash
# Verification Script

# 1. Start Docker
echo "Starting Docker Containers..."
docker compose up -d
sleep 5

# 2. Start Services
echo "Starting MQTT Bridge..."
python3 backend/services/mqtt_bridge.py > bridge.log 2>&1 &
BRIDGE_PID=$!

echo "Starting ML Processor..."
python3 backend/services/ml_processor.py > ml.log 2>&1 &
ML_PID=$!

echo "Starting Backend..."
uvicorn backend.app.main:app --port 8000 --reload > backend.log 2>&1 &
BACKEND_PID=$!

echo "Starting Mock Generator..."
python3 backend/mock_iot_generator.py > generator.log 2>&1 &
GEN_PID=$!

echo "Services Started. PIDs: Bridge=$BRIDGE_PID, ML=$ML_PID, Backend=$BACKEND_PID, Gen=$GEN_PID"
echo "Tailing logs... Press Ctrl+C to stop."

tail -f bridge.log ml.log backend.log generator.log

# Cleanup on exit
trap "kill $BRIDGE_PID $ML_PID $BACKEND_PID $GEN_PID; echo 'Stopped services'" SIGINT SIGTERM
