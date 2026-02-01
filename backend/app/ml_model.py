import random

class MockRULModel:
    def __init__(self):
        print("Loading Mock RUL Model...")

    def predict(self, rms_vibrations, temperature):
        """
        Predict Remaining Useful Life (RUL) in hours.
        Logic:
        - High vibration (> 2.0) drastically reduces RUL.
        - High temp (> 80) reduces RUL.
        """
        base_rul = 1000.0 # Start with 1000 hours
        
        # Penalize for vibration
        if rms_vibrations > 3.0:
            base_rul = random.uniform(2.0, 10.0) # Critical failure imminent
        elif rms_vibrations > 1.5:
            base_rul = random.uniform(50.0, 200.0)
        else:
            base_rul = 500.0 + random.uniform(0, 500.0)

        # Penalize for temperature
        if temperature > 90:
            base_rul *= 0.5
        
        return round(base_rul, 1)

# Global instance
model = MockRULModel()
