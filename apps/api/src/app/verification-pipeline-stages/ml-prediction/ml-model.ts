import { config } from "@/config/env";
import { PaymentStatus } from "@/data/enums/db.enums";

import {
  type MLPredictionData,
  type MLRiskLevel,
  type MLServiceResponse,
  type PipelinePayment,
  type VerificationResults,
} from "@/data/types/pipelineTypes";

const HIGH_VALUE_PAYMENT_THRESHOLD = 10_000;

export const mlPrediction = async (
  paymentData: PipelinePayment[],
  verificationResults: VerificationResults,
): Promise<MLPredictionData> => {
  const paymentCount = paymentData.length;

  if (paymentCount === 0) {
    throw new Error("Payment data cannot be empty");
  }

  const averagePaymentAmount =
    paymentData.reduce((sum, payment) => sum + parseFloat(payment.amount), 0) /
    paymentCount;

  const failedPaymentRate =
    paymentData.filter((payment) => payment.status === PaymentStatus.FAILED)
      .length / paymentCount;

  const highValuePaymentRate =
    paymentData.filter(
      (payment) => parseFloat(payment.amount) >= HIGH_VALUE_PAYMENT_THRESHOLD,
    ).length / paymentCount;

  const internationalPaymentRate =
    paymentData.filter((payment) => payment.isInternational).length /
    paymentCount;

  const predictionData = {
    ...verificationResults,
    paymentCount,
    averagePaymentAmount,
    failedPaymentRate,
    highValuePaymentRate,
    internationalPaymentRate,
  };

  //TODO: change return type and db and uploadVerification such that it matches response,  response is like:
  /**
   * {
    "fraudProbability": 0.00743658697695803,
    "riskLevel": "LOW",
    "explanation": [
        {
            "feature": "highValuePaymentRate",
            "value": 0.1,
            "contribution": -3.4087581634521484,
            "direction": "decreases_risk"
        },
        {
            "feature": "averagePaymentAmount",
            "value": 5000.0,
            "contribution": 2.872476577758789,
            "direction": "increases_risk"
        },
        {
            "feature": "failedPaymentRate",
            "value": 0.0,
            "contribution": -2.2443599700927734,
            "direction": "decreases_risk"
        },
        {
            "feature": "internationalPaymentRate",
            "value": 0.1,
            "contribution": -1.495469570159912,
            "direction": "decreases_risk"
        },
        {
            "feature": "isWebsiteVerified",
            "value": 1.0,
            "contribution": -0.38566136360168457,
            "direction": "decreases_risk"
        },
        {
            "feature": "isGstNumberVerified",
            "value": 1.0,
            "contribution": -0.3620609939098358,
            "direction": "decreases_risk"
        },
        {
            "feature": "isPhoneNumberVerified",
            "value": 1.0,
            "contribution": -0.3221103250980377,
            "direction": "decreases_risk"
        },
        {
            "feature": "paymentCount",
            "value": 35.0,
            "contribution": -0.21826213598251343,
            "direction": "decreases_risk"
        }
    ]
}
   */

  const response = await fetch(`${config.ML_SERVICE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(predictionData),
  });

  if (!response.ok) {
    throw new Error(`ML API request failed with status ${response.status}`);
  }

  const result: unknown = await response.json();

  if (!isMlServiceResponse(result)) {
    throw new Error("Invalid response from ML API");
  }

  return {
    ...predictionData,
    fraudProbability: result.fraudProbability,
    riskLevel: result.riskLevel,
  };
};

const ML_RISK_LEVELS: readonly MLRiskLevel[] = ["LOW", "MEDIUM", "HIGH"];

function isMlServiceResponse(value: unknown): value is MLServiceResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const v = value as Record<string, unknown>;
  return (
    typeof v.fraudProbability === "number" &&
    typeof v.riskLevel === "string" &&
    ML_RISK_LEVELS.includes(v.riskLevel as MLRiskLevel)
  );
}
