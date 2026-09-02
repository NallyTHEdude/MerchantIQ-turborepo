const merchantExample = {
  id: "7b8d5d43-6b2f-4d7b-b1f4-4af4f28d7267",
  businessName: "Example Retail Pvt Ltd",
  category: "RETAIL",
  gstNumber: "27ABCDE1234F1Z5",
  websiteUrl: "https://example.com",
  phoneNumber: "9876543210",
  createdAt: "2026-08-29T10:30:00.000Z",
};

const verificationExample = {
  id: "1e8c8747-6a35-4f2c-9a35-9a8b27e91c54",
  merchantId: merchantExample.id,
  verificationStatus: "PENDING",
  isGstNumberVerified: false,
  isWebsiteVerified: false,
  isPhoneNumberVerified: false,
  trustscore: 0,
  riskLevel: "VERY_HIGH",
  createdAt: "2026-08-29T10:35:00.000Z",
};

const paymentExample = {
  id: "e7c24154-b56f-48dc-86a4-0c5edaa2a7ad",
  merchantId: merchantExample.id,
  amount: "1499.00",
  status: "SUCCESS",
  paymentMethod: "UPI",
  createdAt: "2026-08-29T10:40:00.000Z",
};

export const apiErrorDetailSchema = {
  type: "object",
  properties: {
    field: {
      type: "string",
      nullable: true,
      description: "Request field that failed validation, when available.",
    },
    message: {
      type: "string",
    },
  },
  required: ["message"],
  example: {
    field: "gstNumber",
    message: "Invalid GST number format",
  },
};

export const errorResponseSchema = {
  type: "object",
  properties: {
    success: {
      type: "boolean",
      example: false,
    },
    message: {
      type: "string",
    },
    errors: {
      type: "array",
      items: {
        $ref: "#/components/schemas/ApiErrorDetail",
      },
    },
    data: {
      nullable: true,
      example: null,
    },
  },
  required: ["success", "message", "errors", "data"],
  example: {
    success: false,
    message: "Validation failed",
    errors: [
      {
        field: "gstNumber",
        message: "Invalid GST number format",
      },
    ],
    data: null,
  },
};

export const healthResponseSchema = {
  type: "object",
  properties: {
    statusCode: {
      type: "integer",
      example: 200,
    },
    data: {
      type: "object",
      additionalProperties: {
        type: "boolean",
      },
    },
    message: {
      type: "string",
      example: "Health check successful",
    },
    success: {
      type: "boolean",
      example: true,
    },
  },
  required: ["statusCode", "data", "message", "success"],
  example: {
    statusCode: 200,
    data: {
      Database: true,
      LLM: true,
    },
    message: "Health check successful",
    success: true,
  },
};

export const merchantCategorySchema = {
  type: "string",
  enum: [
    "FOOD_AND_BEVERAGE",
    "GROCERY",
    "RETAIL",
    "CLOTHING_AND_FASHION",
    "ELECTRONICS",
    "MOBILE_AND_ACCESSORIES",
    "HOME_AND_FURNITURE",
    "AUTOMOTIVE",
    "HEALTHCARE",
    "PHARMACY",
    "BEAUTY_AND_WELLNESS",
    "HOTEL_AND_TRAVEL",
    "EDUCATION",
    "FINANCIAL_SERVICES",
    "REAL_ESTATE",
    "PROFESSIONAL_SERVICES",
    "LOGISTICS",
    "MANUFACTURING",
    "WHOLESALE",
    "ENTERTAINMENT",
    "SPORTS_AND_FITNESS",
    "JEWELLERY",
    "BOOKS_AND_STATIONERY",
    "SOFTWARE_AND_TECHNOLOGY",
    "OTHER",
  ],
};

export const merchantSchema = {
  type: "object",
  properties: {
    id: {
      type: "string",
      format: "uuid",
    },
    businessName: {
      type: "string",
      maxLength: 255,
    },
    category: {
      $ref: "#/components/schemas/MerchantCategory",
    },
    gstNumber: {
      type: "string",
      pattern: "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$",
      example: "27ABCDE1234F1Z5",
    },
    websiteUrl: {
      type: "string",
      maxLength: 255,
      format: "uri",
      example: "https://example.com",
    },
    phoneNumber: {
      type: "string",
      pattern: "^[0-9]{10}$",
      example: "9876543210",
    },
    createdAt: {
      type: "string",
      format: "date-time",
      nullable: true,
    },
  },
  required: ["id", "businessName", "category", "gstNumber", "websiteUrl", "phoneNumber"],
  example: merchantExample,
};

export const createMerchantRequestSchema = {
  type: "object",
  properties: {
    businessName: {
      type: "string",
      minLength: 1,
    },
    category: {
      $ref: "#/components/schemas/MerchantCategory",
    },
    gstNumber: {
      type: "string",
      pattern: "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$",
      example: "27ABCDE1234F1Z5",
    },
    websiteUrl: {
      type: "string",
      format: "uri",
      example: "https://example.com",
    },
    phoneNumber: {
      type: "string",
      pattern: "^[0-9]{10}$",
      example: "9876543210",
    },
  },
  required: ["businessName", "category", "gstNumber", "websiteUrl", "phoneNumber"],
  example: {
    businessName: "Example Retail Pvt Ltd",
    category: "RETAIL",
    gstNumber: "27ABCDE1234F1Z5",
    websiteUrl: "https://example.com",
    phoneNumber: "9876543210",
  },
};

export const updateMerchantRequestSchema = {
  type: "object",
  minProperties: 1,
  properties: {
    businessName: {
      type: "string",
      minLength: 1,
    },
    category: {
      $ref: "#/components/schemas/MerchantCategory",
    },
    gstNumber: {
      type: "string",
      pattern: "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$",
      example: "27ABCDE1234F1Z5",
    },
    websiteUrl: {
      type: "string",
      format: "uri",
      example: "https://example.com",
    },
    phoneNumber: {
      type: "string",
      pattern: "^[0-9]{10}$",
      example: "9876543210",
    },
  },
  example: {
    businessName: "Updated Retail Pvt Ltd",
    websiteUrl: "https://updated.example.com",
  },
};

export const merchantResponseSchema = {
  type: "object",
  properties: {
    statusCode: {
      type: "integer",
    },
    data: {
      $ref: "#/components/schemas/Merchant",
    },
    message: {
      type: "string",
    },
    success: {
      type: "boolean",
      example: true,
    },
  },
  required: ["statusCode", "data", "message", "success"],
  example: {
    statusCode: 200,
    data: merchantExample,
    message: "Merchant retrieved successfully",
    success: true,
  },
};

export const merchantListResponseSchema = {
  type: "object",
  properties: {
    statusCode: {
      type: "integer",
      example: 200,
    },
    data: {
      type: "array",
      items: {
        $ref: "#/components/schemas/Merchant",
      },
    },
    message: {
      type: "string",
      example: "Merchants retrieved successfully",
    },
    success: {
      type: "boolean",
      example: true,
    },
  },
  required: ["statusCode", "data", "message", "success"],
  example: {
    statusCode: 200,
    data: [merchantExample],
    message: "Merchants retrieved successfully",
    success: true,
  },
};

export const verificationSchema = {
  type: "object",
  properties: {
    id: {
      type: "string",
      format: "uuid",
    },
    merchantId: {
      type: "string",
      format: "uuid",
    },
    verificationStatus: {
      type: "string",
      enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "FAILED"],
    },
    isGstNumberVerified: {
      type: "boolean",
    },
    isWebsiteVerified: {
      type: "boolean",
      nullable: true,
    },
    isPhoneNumberVerified: {
      type: "boolean",
    },
    trustscore: {
      type: "integer",
    },
    riskLevel: {
      type: "string",
      enum: ["LOW", "MODERATE", "HIGH", "VERY_HIGH"],
    },
    createdAt: {
      type: "string",
      format: "date-time",
    },
  },
  required: [
    "id",
    "merchantId",
    "verificationStatus",
    "isGstNumberVerified",
    "isPhoneNumberVerified",
    "trustscore",
    "riskLevel",
    "createdAt",
  ],
  example: verificationExample,
};

export const verificationResponseSchema = {
  type: "object",
  properties: {
    statusCode: {
      type: "integer",
    },
    data: {
      $ref: "#/components/schemas/Verification",
    },
    message: {
      type: "string",
    },
    success: {
      type: "boolean",
      example: true,
    },
  },
  required: ["statusCode", "data", "message", "success"],
  example: {
    statusCode: 200,
    data: verificationExample,
    message: "Verification fetched successfully",
    success: true,
  },
};

export const verificationListResponseSchema = {
  type: "object",
  properties: {
    statusCode: {
      type: "integer",
      example: 200,
    },
    data: {
      type: "array",
      items: {
        $ref: "#/components/schemas/Verification",
      },
    },
    message: {
      type: "string",
      example: "Verifications fetched successfully",
    },
    success: {
      type: "boolean",
      example: true,
    },
  },
  required: ["statusCode", "data", "message", "success"],
  example: {
    statusCode: 200,
    data: [verificationExample],
    message: "Verifications fetched successfully",
    success: true,
  },
};

export const paymentStatusSchema = {
  type: "string",
  enum: ["SUCCESS", "REFUNDED", "CHARGEBACK"],
};

export const paymentMethodSchema = {
  type: "string",
  enum: ["CARD", "UPI", "NET_BANKING"],
};

export const paymentSchema = {
  type: "object",
  properties: {
    id: {
      type: "string",
      format: "uuid",
    },
    merchantId: {
      type: "string",
      format: "uuid",
    },
    amount: {
      type: "string",
      example: "1499.00",
      description: "Decimal amount stored with precision 12 and scale 2.",
    },
    status: {
      $ref: "#/components/schemas/PaymentStatus",
    },
    paymentMethod: {
      $ref: "#/components/schemas/PaymentMethod",
    },
    createdAt: {
      type: "string",
      format: "date-time",
    },
  },
  required: ["id", "merchantId", "amount", "status", "paymentMethod", "createdAt"],
  example: paymentExample,
};

export const createPaymentRequestSchema = {
  type: "array",
  minItems: 1,
  items: {
    type: "object",
    properties: {
      amount: {
        type: "string",
        minLength: 1,
        example: "1499.00",
      },
      status: {
        $ref: "#/components/schemas/PaymentStatus",
      },
      paymentMethod: {
        $ref: "#/components/schemas/PaymentMethod",
      },
    },
    required: ["amount", "status", "paymentMethod"],
  },
  example: [
    {
      amount: "1499.00",
      status: "SUCCESS",
      paymentMethod: "UPI",
    },
  ],
};

export const paymentResponseSchema = {
  type: "object",
  properties: {
    statusCode: {
      type: "integer",
    },
    data: {
      $ref: "#/components/schemas/Payment",
    },
    message: {
      type: "string",
    },
    success: {
      type: "boolean",
      example: true,
    },
  },
  required: ["statusCode", "data", "message", "success"],
  example: {
    statusCode: 200,
    data: paymentExample,
    message: "Payment fetched successfully",
    success: true,
  },
};

export const paymentListResponseSchema = {
  type: "object",
  properties: {
    statusCode: {
      type: "integer",
      example: 200,
    },
    data: {
      type: "array",
      items: {
        $ref: "#/components/schemas/Payment",
      },
    },
    message: {
      type: "string",
      example: "Payments retrieved successfully",
    },
    success: {
      type: "boolean",
      example: true,
    },
  },
  required: ["statusCode", "data", "message", "success"],
  example: {
    statusCode: 200,
    data: [paymentExample],
    message: "Payments retrieved successfully",
    success: true,
  },
};

export const componentSchemas = {
  ApiErrorDetail: apiErrorDetailSchema,
  ErrorResponse: errorResponseSchema,
  HealthResponse: healthResponseSchema,
  Merchant: merchantSchema,
  MerchantCategory: merchantCategorySchema,
  CreateMerchantRequest: createMerchantRequestSchema,
  UpdateMerchantRequest: updateMerchantRequestSchema,
  MerchantResponse: merchantResponseSchema,
  MerchantListResponse: merchantListResponseSchema,
  Verification: verificationSchema,
  VerificationResponse: verificationResponseSchema,
  VerificationListResponse: verificationListResponseSchema,
  Payment: paymentSchema,
  PaymentStatus: paymentStatusSchema,
  PaymentMethod: paymentMethodSchema,
  CreatePaymentRequest: createPaymentRequestSchema,
  PaymentResponse: paymentResponseSchema,
  PaymentListResponse: paymentListResponseSchema,
};
