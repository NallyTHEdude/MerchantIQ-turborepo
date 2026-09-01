from pathlib import Path

import joblib
import numpy as np
import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"

MODEL_PATH = MODEL_DIR / "merchant_fraud_ensemble.joblib"
SHAP_PATH = MODEL_DIR / "merchant_fraud_shap_explainer.joblib"

THRESHOLD = 0.5364

FEATURES = [
    "isGstNumberVerified",
    "isWebsiteVerified",
    "isPhoneNumberVerified",
    "paymentCount",
    "averagePaymentAmount",
    "failedPaymentRate",
    "highValuePaymentRate",
    "internationalPaymentRate",
]


class FraudModelService:

    def __init__(self):
        self.model = joblib.load(MODEL_PATH)
        self.shap_explainer = joblib.load(SHAP_PATH)

    def predict(self, merchant: dict):

        # Keep feature order exactly the same as training
        X = pd.DataFrame(
            [[merchant[feature] for feature in FEATURES]],
            columns=FEATURES,
        )

        # Ensemble prediction
        probabilities = self.model.predict_proba(X)
        fraud_score = float(probabilities[0][1])

        # Apply validation-selected threshold
        is_fraud = fraud_score >= THRESHOLD

        # SHAP explanation for the XGBoost component
        shap_values = self.shap_explainer.shap_values(X)

        # Handle SHAP output shape
        if isinstance(shap_values, list):
            values = np.asarray(shap_values[-1])[0]
        else:
            values = np.asarray(shap_values)[0]

        contributions = []

        for feature, value, contribution in zip(
            FEATURES,
            X.iloc[0].values,
            values,
        ):
            if contribution > 0:
                direction = "increases_risk"
            elif contribution < 0:
                direction = "decreases_risk"
            else:
                direction = "neutral"

            contributions.append(
                {
                    "feature": feature,
                    "value": float(value),
                    "contribution": float(contribution),
                    "direction": direction,
                }
            )

        # Most influential features first
        contributions.sort(
            key=lambda x: abs(x["contribution"]),
            reverse=True,
        )

        # Application-level risk categorization
        if fraud_score >= THRESHOLD:
            risk_level = "HIGH"
        elif fraud_score >= 0.30:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        return {
            "fraudProbability": fraud_score,
            "riskLevel": risk_level,
            "explanation": contributions,
        }


model_service = FraudModelService()