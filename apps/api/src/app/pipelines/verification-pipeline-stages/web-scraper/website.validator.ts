export type WebsiteAgentData = {
  isWebsiteVerified: boolean;

  businessName?: string;
  contactInformation?: string;
  physicalAddress?: string;
  productsOrServices?: string;

  policies?: {
    privacyPolicy?: string;
    termsAndConditions?: string;
    refundPolicy?: string;
  };
};

export const websiteDataSchema = {
  type: "object",

  properties: {
    isWebsiteVerified: {
      type: "boolean",
      description:
        "Whether the website appears to genuinely represent the claimed merchant and operate within the claimed business category. Consider the evidence found across the website, including business identity, products or services, contact information, address, terms and conditions, policies, and suspicious or contradictory information.",
    },

    businessName: {
      type: "string",
      description: "The business or company name found on the website.",
    },

    contactInformation: {
      type: "string",
      description:
        "Contact information found on the website, including phone numbers, email addresses, or other contact details.",
    },

    physicalAddress: {
      type: "string",
      description:
        "The physical business address or location found on the website.",
    },

    productsOrServices: {
      type: "string",
      description:
        "A summary of the products or services offered by the business.",
    },

    policies: {
      type: "object",

      properties: {
        privacyPolicy: {
          type: "string",
          description: "Privacy policy information found on the website.",
        },

        termsAndConditions: {
          type: "string",
          description:
            "Terms and conditions or terms of service information found on the website.",
        },

        refundPolicy: {
          type: "string",
          description:
            "Refund, return, or cancellation policy information found on the website.",
        },
      },
    },
  },
};
