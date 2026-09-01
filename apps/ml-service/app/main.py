from fastapi import FastAPI

from .model_service import model_service
from .schemas import MerchantInput


app = FastAPI(
    title="Merchant Fraud Detection API",
    version="1.0.0",
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": "merchant_fraud_ensemble",
    }


@app.post("/predict")
def predict(merchant: MerchantInput):

    result = model_service.predict(
        merchant.model_dump()
    )

    return result