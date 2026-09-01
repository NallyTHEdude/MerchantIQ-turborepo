from pydantic import BaseModel, Field


class MerchantInput(BaseModel):
    isGstNumberVerified: int = Field(ge=0, le=1)
    isWebsiteVerified: int = Field(ge=0, le=1)
    isPhoneNumberVerified: int = Field(ge=0, le=1)

    paymentCount: float = Field(ge=0)
    averagePaymentAmount: float = Field(ge=0)

    failedPaymentRate: float = Field(ge=0, le=1)
    highValuePaymentRate: float = Field(ge=0, le=1)
    internationalPaymentRate: float = Field(ge=0, le=1)