import { firecrawl } from "@/config/firecrawl-scraper/client";

import {
  type WebsiteData,
  type WebsiteVerificationResult,
} from "@/data/types/pipelineTypes";

import { websiteDataSchema, type WebsiteAgentData } from "./website.validator";

export const fetchWebsiteData = async (
  websiteUrl: string,
  businessName: string,
  category: string,
): Promise<WebsiteVerificationResult> => {
  try {
    console.log(`Investigating website: ${websiteUrl}`);

    const result = await firecrawl.agent({
      urls: [websiteUrl],

      prompt: `
        You are verifying a merchant's website.

        Merchant information:

        Business Name:
        ${businessName}

        Business Category:
        ${category}

        Website:
        ${websiteUrl}

        Your task is to investigate the website and determine whether
        it genuinely appears to represent the claimed merchant and
        operate within the claimed business category.

        Navigate the website as necessary and examine relevant pages.

        Investigate:

        - Business or company identity
        - Business name and whether it matches the claimed merchant
        - Products and services
        - Whether the products/services are relevant to the claimed category
        - Contact information
        - Physical business address
        - About/company information
        - Terms and conditions
        - Privacy policy
        - Refund, return, or cancellation policy
        - Other relevant legal or business information
        - Suspicious or misleading claims
        - Contradictions between the merchant information and website
        - Signs that the website may be fraudulent, deceptive, or unrelated
          to the claimed merchant

        Pay particular attention to the actual content of the Terms and
        Conditions and other legal/business pages. Do not assume that
        the existence of a policy means the business is legitimate.

        Use your judgment based on the evidence found across the website.

        Set isWebsiteVerified to true only when there is sufficient
        evidence that the website genuinely corresponds to the claimed
        merchant and business category.

        Set isWebsiteVerified to false when the website appears unrelated,
        contradictory, suspicious, misleading, fraudulent, or otherwise
        does not provide sufficient evidence to verify the claimed merchant.

        Do not use a fixed numerical scoring system.

        Return only information that you can actually find or reasonably
        determine from the website.
      `,

      schema: websiteDataSchema,

      model: "spark-2",
      effort: "medium",
      maxCredits: 100,
    });

    if (!result.success || !result.data) {
      console.error("Firecrawl Agent failed:", result);

      return {
        websiteData: null,
        isWebsiteVerified: false,
      };
    }

    const agentData = result.data as WebsiteAgentData;

    const websiteData: WebsiteData = {
      url: websiteUrl,

      businessName: agentData.businessName,

      contactInformation: agentData.contactInformation,

      physicalAddress: agentData.physicalAddress,

      productsOrServices: agentData.productsOrServices,

      policies: agentData.policies,

      scrapedAt: new Date().toISOString(),
    };

    return {
      websiteData,

      // Agent makes the initial website verification decision
      isWebsiteVerified: agentData.isWebsiteVerified,
    };
  } catch (error) {
    console.error("! ----- Firecrawl Agent failed ----- !:", error);

    return {
      websiteData: null,
      isWebsiteVerified: false,
    };
  }
};
