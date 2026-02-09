# ==============================
# FULL RUL PREDICTION MODULE
# ==============================

import random
import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler


# ==============================
# REAL ML MODEL
# ==============================

class RealMLModel:
    def __init__(self):
        print("Loading Real ML Models...")

        self.anomaly_detector = IsolationForest(
            contamination=0.1,
            random_state=42,
            n_estimators=100
        )

        self.failure_classifier = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )

        self.scaler = StandardScaler()
        self._train_on_synthetic_data()

    def _train_on_synthetic_data(self):
        print("Training models on synthetic sensor data...")

        np.random.seed(42)
        n_samples = 500

        # Normal
        normal_data = np.random.normal(
            loc=[0.7, 70, 55],
            scale=[0.3, 5, 10],
            size=(n_samples // 2, 3)
        )
        normal_labels = np.zeros(n_samples // 2)

        # Warning
        abnormal_data = np.random.normal(
            loc=[2.5, 85, 30],
            scale=[0.8, 8, 15],
            size=(n_samples // 4, 3)
        )
        abnormal_labels = np.ones(n_samples // 4)

        # Critical
        critical_data = np.random.normal(
            loc=[4.0, 95, 20],
            scale=[1.0, 10, 10],
            size=(n_samples // 4, 3)
        )
        critical_labels = np.ones(n_samples // 4) * 2

        X = np.vstack([normal_data, abnormal_data, critical_data])
        y = np.hstack([normal_labels, abnormal_labels, critical_labels])

        X_scaled = self.scaler.fit_transform(X)

        self.anomaly_detector.fit(X_scaled)
        self.failure_classifier.fit(X_scaled, y)

        print("✓ Models trained successfully")

    def predict(self, vibration_rms, temperature, humidity=50):
        features = np.array([[vibration_rms, temperature, humidity]])
        features_scaled = self.scaler.transform(features)

        anomaly_score = -self.anomaly_detector.score_samples(features_scaled)[0]
        anomaly_score = max(0, min(1, anomaly_score))

        failure_class_pred = self.failure_classifier.predict(features_scaled)[0]
        failure_proba = self.failure_classifier.predict_proba(features_scaled)[0]

        class_map = {0: "normal", 1: "warning", 2: "critical"}

        if vibration_rms > 3.5:
            rul = 2 + (1 - anomaly_score) * 8
        elif vibration_rms > 2.0:
            rul = 50 + (1 - anomaly_score) * 150
        else:
            rul = 500 + (1 - anomaly_score) * 500

        if temperature > 90:
            rul *= 0.7
        elif temperature > 85:
            rul *= 0.85

        return {
            "predicted_rul_hours": round(rul, 1),
            "anomaly_score": round(anomaly_score, 3),
            "failure_class": class_map[int(failure_class_pred)],
            "failure_probability": round(float(np.max(failure_proba)), 3)
        }


# ==============================
# MOCK (RULE-BASED) MODEL
# ==============================

class MockRULModel:
    def __init__(self):
        print("Loading Mock RUL Model...")

    def predict(self, vibration_rms, temperature):
        base_rul = 1000.0

        if vibration_rms > 3.0:
            base_rul = random.uniform(2.0, 10.0)
        elif vibration_rms > 1.5:
            base_rul = random.uniform(50.0, 200.0)
        else:
            base_rul = 500.0 + random.uniform(0, 500.0)

        if temperature > 90:
            base_rul *= 0.5

        return {
            "predicted_rul_hours": round(base_rul, 1),
            "failure_class": "rule_based",
            "confidence": "low"
        }


# ==============================
# MODEL SELECTION
# ==============================

USE_REAL_MODEL = True  # Change to False to use mock model

model = RealMLModel() if USE_REAL_MODEL else MockRULModel()


# ==============================
# TEST RUN
# ==============================

if __name__ == "__main__":
    print("\n--- Sample Prediction ---")

    vibration = 2.8
    temperature = 88
    humidity = 40

    if USE_REAL_MODEL:
        result = model.predict(vibration, temperature, humidity)
    else:
        result = model.predict(vibration, temperature)

    for k, v in result.items():
        print(f"{k}: {v}")
