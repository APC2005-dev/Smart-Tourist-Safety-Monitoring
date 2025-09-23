# from fastapi import FastAPI
# from pydantic import BaseModel
# import torch
# import joblib
# import numpy as np

# # -------------------------------
# # 1. Define Model & Load Weights
# # -------------------------------
# class TransformerClassifier(torch.nn.Module):
#     def __init__(self, n_features, seq_len, hidden_dim=64, nhead=4, num_layers=2, num_classes=4):
#         super().__init__()
#         self.input_proj = torch.nn.Linear(n_features, hidden_dim)
#         encoder_layer = torch.nn.TransformerEncoderLayer(d_model=hidden_dim, nhead=nhead, batch_first=True)
#         self.encoder = torch.nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
#         self.pool = torch.nn.AdaptiveAvgPool1d(1)
#         self.fc = torch.nn.Linear(hidden_dim, num_classes)

#     def forward(self, x):
#         x = self.input_proj(x)
#         x = self.encoder(x)
#         x = x.transpose(1, 2)
#         x = self.pool(x).squeeze(-1)
#         return self.fc(x)

# # Load model & scaler once
# SEQ_LEN = 10
# scaler = joblib.load("scaler.pkl")
# model = TransformerClassifier(n_features=4, seq_len=SEQ_LEN, num_classes=4)
# model.load_state_dict(torch.load("model.pth", map_location="cpu"))
# model.eval()

# # -------------------------------
# # 2. FastAPI Setup
# # -------------------------------
# app = FastAPI()

# class GPSPoint(BaseModel):
#     lat: float
#     lon: float
#     alt: float
#     timestamp: float  # Unix timestamp

# class GPSPayload(BaseModel):
#     session_start: float
#     points: list[GPSPoint]

# @app.post("/predict")
# def predict(payload: GPSPayload):
#     if len(payload.points) != SEQ_LEN:
#         return {"error": f"Need exactly {SEQ_LEN} points, got {len(payload.points)}"}
    
#     arr = np.array([
#         [p.lat, p.lon, p.alt, (p.timestamp - payload.session_start) / 86400]
#         for p in payload.points
#     ])
    
#     arr_scaled = scaler.transform(arr)
#     tensor = torch.tensor(arr_scaled, dtype=torch.float32).unsqueeze(0)

#     with torch.no_grad():
#         logits = model(tensor)
#         pred = torch.argmax(logits, dim=1).item()

#     class_map = {0: "Normal", 1: "Drop-Off", 2: "Inactivity", 3: "Route Deviation"}
#     return {"prediction": class_map[pred], "code": pred}



from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import tensorflow as tf
import joblib, json

# Load artifacts
model = tf.keras.models.load_model("1D_CNN_model.keras")
label_encoder = joblib.load("label_encoder.pkl")
temporal_scaler = joblib.load("temporal_scaler.pkl")
params = json.load(open("preprocessing_params.json"))

# Manual mapping of activities (since your label_encoder was numeric)
activity_labels = [
    "Standing still (1 min)",
    "Sitting and relaxing (1 min)",
    "Lying down (1 min)",
    "Walking (1 min)",
    "Climbing stairs (1 min)",
    "Waist bends forward (20x)",
    "Frontal elevation of arms (20x)",
    "Knees bending (crouching) (20x)",
    "Cycling (1 min)",
    "Jogging (1 min)",
    "Running (1 min)",
    "Jump front & back (20x)"
]

app = FastAPI(title="HAR Inference API")

class InferenceRequest(BaseModel):
    data: list  # 2D list -> shape: [window_size, n_features]

@app.post("/predict")
async def predict_activity(req: InferenceRequest):
    try:
        X_new = np.array(req.data)
        expected_shape = (params["window_size"], len(params["sensor_cols"]))

        if X_new.shape != expected_shape:
            raise HTTPException(
                status_code=400,
                detail=f"Input shape mismatch. Expected {expected_shape}, got {X_new.shape}"
            )

        # Scale using saved scaler
        X_new_scaled = temporal_scaler.transform(X_new.reshape(-1, X_new.shape[-1])).reshape(1, *X_new.shape)

        # Model prediction
        pred = model.predict(X_new_scaled)
        pred_class_idx = int(np.argmax(pred, axis=1)[0])
        pred_class_name = label_encoder.inverse_transform([pred_class_idx])[0]
        pred_class_name = activity_labels[int(pred_class_name)-1]

        return {
            #"predicted_index": pred_class_idx,
            "predicted_label": pred_class_name,
            #"confidence": float(np.max(pred))
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))