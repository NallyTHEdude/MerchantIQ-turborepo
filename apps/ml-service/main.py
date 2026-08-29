from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI()

bundle = joblib.load("merchant_fraud_model.joblib")
model = bundle["model"]
scaler = bundle["scaler"]
boolean_features = bundle["boolean_features"]
numeric_features = bundle["numeric_features"]
features = bundle["features"]

class MerchantFeatures(BaseModel):
    isGstNumberVerified: bool
    isWebsiteVerified: bool
    isPhoneNumberVerified: bool
    paymentCount: int
    averagePaymentAmount: float
    failedPaymentRate: float
    highValuePaymentRate: float
    internationalPaymentRate: float

def derive_risk_level(fraud_probability: float) -> str:
    if fraud_probability < 0.30:
        return "LOW"
    if fraud_probability < 0.70:
        return "MEDIUM"
    return "HIGH"

@app.post("/score")
def score(payload: MerchantFeatures):
    row = payload.dict()
    for col in boolean_features:
        row[col] = int(row[col])

    df = pd.DataFrame([row])[features]
    df[numeric_features] = scaler.transform(df[numeric_features])

    fraud_probability = float(model.predict_proba(df)[0][1])

    return {
        "fraudProbability": round(fraud_probability, 4),
        "riskLevel": derive_risk_level(fraud_probability),
        "coefficients": dict(zip(features, model.coef_[0].tolist())),
    }

@app.get("/health")
def health():
    return {"status": "ok"}