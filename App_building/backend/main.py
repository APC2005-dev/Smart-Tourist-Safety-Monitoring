from fastapi import FastAPI
from pydantic import BaseModel
import torch
import joblib
import numpy as np

# -------------------------------
# 1. Define Model & Load Weights
# -------------------------------
class TransformerClassifier(torch.nn.Module):
    def __init__(self, n_features, seq_len, hidden_dim=64, nhead=4, num_layers=2, num_classes=4):
        super().__init__()
        self.input_proj = torch.nn.Linear(n_features, hidden_dim)
        encoder_layer = torch.nn.TransformerEncoderLayer(d_model=hidden_dim, nhead=nhead, batch_first=True)
        self.encoder = torch.nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        self.pool = torch.nn.AdaptiveAvgPool1d(1)
        self.fc = torch.nn.Linear(hidden_dim, num_classes)

    def forward(self, x):
        x = self.input_proj(x)
        x = self.encoder(x)
        x = x.transpose(1, 2)
        x = self.pool(x).squeeze(-1)
        return self.fc(x)

# Load model & scaler once
SEQ_LEN = 10
scaler = joblib.load("scaler.pkl")
model = TransformerClassifier(n_features=4, seq_len=SEQ_LEN, num_classes=4)
model.load_state_dict(torch.load("model.pth", map_location="cpu"))
model.eval()

# -------------------------------
# 2. FastAPI Setup
# -------------------------------
app = FastAPI()

class GPSPoint(BaseModel):
    lat: float
    lon: float
    alt: float
    timestamp: float  # Unix timestamp

class GPSPayload(BaseModel):
    session_start: float
    points: list[GPSPoint]

@app.post("/predict")
def predict(payload: GPSPayload):
    if len(payload.points) != SEQ_LEN:
        return {"error": f"Need exactly {SEQ_LEN} points, got {len(payload.points)}"}
    
    arr = np.array([
        [p.lat, p.lon, p.alt, (p.timestamp - payload.session_start) / 86400]
        for p in payload.points
    ])
    
    arr_scaled = scaler.transform(arr)
    tensor = torch.tensor(arr_scaled, dtype=torch.float32).unsqueeze(0)

    with torch.no_grad():
        logits = model(tensor)
        pred = torch.argmax(logits, dim=1).item()

    class_map = {0: "Normal", 1: "Drop-Off", 2: "Inactivity", 3: "Route Deviation"}
    return {"prediction": class_map[pred], "code": pred}