export const verificationStatuses = ['Pending', 'Completed', 'Failed'] as const;
export const riskLevels = ['Low', 'Medium', 'High'] as const;
export const merchantCategories = [
    'Retail',
    'Software',
    'Home goods',
    'Logistics',
    'Food & beverage',
    'Design services',
    'Financial services',
    'Healthcare',
] as const;

export const verificationStages = [
    'Phone Number Verification',
    'GST Verification',
    'Website Verification',
    'Payment / Transaction Analysis',
    'Trust Score + Risk Level',
    'LangGraph Reasoning / Action',
    'Compliance RAG',
] as const;

export type VerificationStatus = (typeof verificationStatuses)[number];
export type RiskLevel = (typeof riskLevels)[number];
export type VerificationStage = (typeof verificationStages)[number];
export type CheckState = 'success' | 'processing' | 'failed' | 'review';
export type PipelineCheck = {
    stage: VerificationStage;
    state: CheckState;
    result: string;
    timestamp: string;
    explanation: string;
};

export type PaymentRecord = {
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    customerId?: string;
};
export type GstRegistrationCertificate = {
    name: string;
    type: 'application/pdf';
    size: number;
    lastModified: number;
};
export type CreateMerchantPayload = {
    name: string;
    website: string;
    category: string;
    phone: string;
    gstNumber: string;
    paymentRecords: PaymentRecord[];
    gstCertificate: GstRegistrationCertificate;
};

export type Merchant = {
    id: string;
    name: string;
    legalName: string;
    status: VerificationStatus;
    risk: RiskLevel;
    trustScore: number;
    stage: VerificationStage;
    updatedAt: string;
    submittedAt: string;
    country: string;
    category: string;
    website: string;
    phone: string;
    email: string;
    gstNumber?: string;
    merchantId: string;
    assessment: string;
    logisticRegression: string;
    isolationForest: string;
    riskSignals: string[];
    complianceConcerns: string[];
    ragContext: string;
    recommendedAction: string;
    checks: PipelineCheck[];
};

const checks = (
    overrides: Partial<Record<VerificationStage, PipelineCheck>> = {},
): PipelineCheck[] =>
    verificationStages.map(
        (stage) =>
            overrides[stage] ?? {
                stage,
                state: 'success',
                result: 'Passed',
                timestamp: 'Aug 29, 2026 · 09:42 UTC',
                explanation: 'No exception detected in the submitted evidence.',
            },
    );

export const merchants: Merchant[] = [
    {
        id: 'northstar-market',
        name: 'Northstar Market',
        legalName: 'Northstar Market LLC',
        status: 'Pending',
        risk: 'Medium',
        trustScore: 74,
        stage: 'GST Verification',
        updatedAt: '12 min ago',
        submittedAt: 'Aug 29, 2026',
        country: 'United States',
        category: 'Retail',
        website: 'northstarmarket.com',
        phone: '+1 (415) 555-0148',
        email: 'ops@northstarmarket.com',
        merchantId: 'mrc_01HNS7Q2',
        assessment:
            'GST registration evidence needs an operator review before approval.',
        logisticRegression: 'Medium probability of elevated risk (0.31)',
        isolationForest:
            'One moderate outlier across registration and web signals',
        riskSignals: [
            'GST certificate name mismatch',
            'Newly registered domain',
            'Low historical volume',
        ],
        complianceConcerns: ['Business and GST legal names differ slightly'],
        ragContext:
            'US retail merchants require corroborated business registration and tax identity before settlement access.',
        recommendedAction:
            'Review GST evidence and confirm the legal entity name.',
        checks: checks({
            'GST Verification': {
                stage: 'GST Verification',
                state: 'review',
                result: 'Needs review',
                timestamp: 'Aug 29, 2026 · 09:38 UTC',
                explanation:
                    'Submitted GST name differs from the registered business name.',
            },
            'Payment / Transaction Analysis': {
                stage: 'Payment / Transaction Analysis',
                state: 'processing',
                result: 'Running',
                timestamp: 'Aug 29, 2026 · 09:41 UTC',
                explanation:
                    'Payment behavior model is still evaluating the first transaction sample.',
            },
        }),
    },
    {
        id: 'cobalt-cloud',
        name: 'Cobalt Cloud',
        legalName: 'Cobalt Cloud Systems, Inc.',
        status: 'Pending',
        risk: 'Low',
        trustScore: 91,
        stage: 'Phone Number Verification',
        updatedAt: '28 min ago',
        submittedAt: 'Aug 29, 2026',
        country: 'United States',
        category: 'Software',
        website: 'cobaltcloud.io',
        phone: '+1 (206) 555-0192',
        email: 'trust@cobaltcloud.io',
        merchantId: 'mrc_01HCB4L9',
        assessment:
            'Verification is progressing normally with no material risk signals.',
        logisticRegression: 'Low probability of elevated risk (0.06)',
        isolationForest: 'No anomalous behavior detected',
        riskSignals: ['Limited operating history'],
        complianceConcerns: [],
        ragContext:
            'Software merchants with clear ownership and consistent web presence can proceed after phone confirmation.',
        recommendedAction:
            'Complete phone verification, then continue to Payment Analysis.',
        checks: checks({
            'Phone Number Verification': {
                stage: 'Phone Number Verification',
                state: 'processing',
                result: 'Code sent',
                timestamp: 'Aug 29, 2026 · 09:17 UTC',
                explanation:
                    'Waiting for the authorized contact to confirm the verification code.',
            },
        }),
    },
    {
        id: 'lumen-house',
        name: 'Lumen House',
        legalName: 'Lumen House Goods Ltd.',
        status: 'Pending',
        risk: 'High',
        trustScore: 46,
        stage: 'Website Verification',
        updatedAt: '1 hr ago',
        submittedAt: 'Aug 29, 2026',
        country: 'United Kingdom',
        category: 'Home goods',
        website: 'lumenhousegoods.co.uk',
        phone: '+44 20 7946 0821',
        email: 'hello@lumenhousegoods.co.uk',
        merchantId: 'mrc_01HLUMEN',
        assessment:
            'Web identity and payment indicators require manual investigation.',
        logisticRegression: 'High probability of elevated risk (0.72)',
        isolationForest:
            'Strong outlier detected in domain and payment signals',
        riskSignals: [
            'Recent domain creation',
            'High refund-rate projection',
            'Inconsistent contact details',
        ],
        complianceConcerns: ['Website terms omit required returns language'],
        ragContext:
            'UK ecommerce merchants should publish clear returns, privacy, and business contact information.',
        recommendedAction:
            'Hold approval and investigate website ownership and refund policy.',
        checks: checks({
            'Website Verification': {
                stage: 'Website Verification',
                state: 'failed',
                result: 'Failed',
                timestamp: 'Aug 29, 2026 · 08:56 UTC',
                explanation:
                    'Website contact details do not match submitted merchant information.',
            },
            'Payment / Transaction Analysis': {
                stage: 'Payment / Transaction Analysis',
                state: 'review',
                result: 'Review required',
                timestamp: 'Aug 29, 2026 · 09:02 UTC',
                explanation:
                    'Projected refund behavior is above the category baseline.',
            },
        }),
    },
    {
        id: 'ember-logistics',
        name: 'Ember Logistics',
        legalName: 'Ember Logistics Group',
        status: 'Completed',
        risk: 'Low',
        trustScore: 97,
        stage: 'Compliance RAG',
        updatedAt: '2 hrs ago',
        submittedAt: 'Aug 28, 2026',
        country: 'Canada',
        category: 'Logistics',
        website: 'emberlogistics.ca',
        phone: '+1 (416) 555-0126',
        email: 'compliance@emberlogistics.ca',
        merchantId: 'mrc_01EMBER8',
        assessment:
            'All checks passed and the merchant is cleared for activation.',
        logisticRegression: 'Low probability of elevated risk (0.02)',
        isolationForest: 'No anomalous behavior detected',
        riskSignals: [],
        complianceConcerns: [],
        ragContext:
            'Canadian logistics providers with verified registration and payment history meet the current onboarding policy.',
        recommendedAction: 'Approve merchant and activate settlement access.',
        checks: checks(),
    },
    {
        id: 'atlas-provisions',
        name: 'Atlas Provisions',
        legalName: 'Atlas Provisions Co.',
        status: 'Failed',
        risk: 'High',
        trustScore: 22,
        stage: 'GST Verification',
        updatedAt: '3 hrs ago',
        submittedAt: 'Aug 28, 2026',
        country: 'United States',
        category: 'Food & beverage',
        website: 'atlasprovisions.shop',
        phone: '+1 (312) 555-0177',
        email: 'admin@atlasprovisions.shop',
        merchantId: 'mrc_01ATLAS7',
        assessment:
            'Tax registration could not be validated and risk models flagged multiple anomalies.',
        logisticRegression: 'High probability of elevated risk (0.91)',
        isolationForest: 'Multiple strong outliers detected',
        riskSignals: [
            'Invalid GST evidence',
            'Proxy hosting detected',
            'Payment instrument mismatch',
        ],
        complianceConcerns: ['Registration evidence appears altered'],
        ragContext:
            'Merchants unable to validate tax registration must remain blocked pending enhanced due diligence.',
        recommendedAction:
            'Keep blocked and escalate for enhanced due diligence.',
        checks: checks({
            'GST Verification': {
                stage: 'GST Verification',
                state: 'failed',
                result: 'Failed',
                timestamp: 'Aug 28, 2026 · 14:20 UTC',
                explanation:
                    'Registration number was not found in the expected authority source.',
            },
            'Trust Score + Risk Level': {
                stage: 'Trust Score + Risk Level',
                state: 'failed',
                result: 'High risk',
                timestamp: 'Aug 28, 2026 · 14:24 UTC',
                explanation: 'Both risk models identified material anomalies.',
            },
        }),
    },
    {
        id: 'meridian-studio',
        name: 'Meridian Studio',
        legalName: 'Meridian Studio GmbH',
        status: 'Pending',
        risk: 'Medium',
        trustScore: 68,
        stage: 'Phone Number Verification',
        updatedAt: '5 hrs ago',
        submittedAt: 'Aug 28, 2026',
        country: 'Germany',
        category: 'Design services',
        website: 'meridianstudio.de',
        phone: '+49 30 555 0198',
        email: 'studio@meridianstudio.de',
        merchantId: 'mrc_01MERID9',
        assessment: 'Phone confirmation is the only remaining prerequisite.',
        logisticRegression: 'Medium probability of elevated risk (0.24)',
        isolationForest: 'No material outlier detected',
        riskSignals: ['International settlement route'],
        complianceConcerns: [],
        ragContext:
            'EU service providers require validated contact and business identity before final compliance review.',
        recommendedAction:
            'Wait for phone confirmation and proceed to Compliance.',
        checks: checks({
            'Phone Number Verification': {
                stage: 'Phone Number Verification',
                state: 'processing',
                result: 'Awaiting code',
                timestamp: 'Aug 28, 2026 · 16:01 UTC',
                explanation:
                    'The authorized contact has not completed the phone challenge.',
            },
        }),
    },
    {
        id: 'oakline-finance',
        name: 'Oakline Finance',
        legalName: 'Oakline Finance LLC',
        status: 'Pending',
        risk: 'High',
        trustScore: 39,
        stage: 'Compliance RAG',
        updatedAt: 'Yesterday',
        submittedAt: 'Aug 27, 2026',
        country: 'United States',
        category: 'Financial services',
        website: 'oaklinefinance.com',
        phone: '+1 (212) 555-0133',
        email: 'risk@oaklinefinance.com',
        merchantId: 'mrc_01OAKLN3',
        assessment:
            'Financial-services policy review identified unresolved compliance concerns.',
        logisticRegression: 'High probability of elevated risk (0.66)',
        isolationForest: 'Moderate outlier in transaction profile',
        riskSignals: [
            'High-risk category',
            'Incomplete beneficial-owner context',
        ],
        complianceConcerns: [
            'Enhanced due diligence required for financial services',
        ],
        ragContext:
            'Financial services merchants require enhanced due diligence and documented beneficial ownership.',
        recommendedAction:
            'Request additional compliance evidence before approval.',
        checks: checks({
            'Compliance RAG': {
                stage: 'Compliance RAG',
                state: 'review',
                result: 'Needs review',
                timestamp: 'Aug 27, 2026 · 11:08 UTC',
                explanation:
                    'Beneficial ownership context is incomplete for the submitted entity.',
            },
        }),
    },
    {
        id: 'solace-health',
        name: 'Solace Health',
        legalName: 'Solace Health Technologies',
        status: 'Completed',
        risk: 'Low',
        trustScore: 94,
        stage: 'Compliance RAG',
        updatedAt: 'Yesterday',
        submittedAt: 'Aug 27, 2026',
        country: 'Australia',
        category: 'Healthcare',
        website: 'solacehealth.com.au',
        phone: '+61 2 5550 0175',
        email: 'operations@solacehealth.com.au',
        merchantId: 'mrc_01SOLAC4',
        assessment: 'Verification complete with no outstanding concerns.',
        logisticRegression: 'Low probability of elevated risk (0.03)',
        isolationForest: 'No anomalous behavior detected',
        riskSignals: [],
        complianceConcerns: [],
        ragContext:
            'Healthcare technology merchants pass the current onboarding policy when business and web evidence align.',
        recommendedAction: 'Approve merchant and activate settlement access.',
        checks: checks(),
    },
    {
        id: 'harbor-retail',
        name: 'Harbor Retail',
        legalName: 'Harbor Retail Inc.',
        status: 'Pending',
        risk: 'Medium',
        trustScore: 71,
        stage: 'GST Verification',
        updatedAt: '3 hrs ago',
        submittedAt: 'Aug 28, 2026',
        country: 'United States',
        category: 'Retail',
        website: 'harborretail.com',
        phone: '+1 (617) 555-0111',
        email: 'ops@harborretail.com',
        gstNumber: '27AABCH1234D1Z5',
        merchantId: 'mrc_01HARB01',
        assessment: 'Registration evidence needs review.',
        logisticRegression: 'Medium probability of elevated risk (0.29)',
        isolationForest: 'One moderate outlier detected',
        riskSignals: ['New operating history'],
        complianceConcerns: [],
        ragContext: 'Retail merchants require validated tax identity.',
        recommendedAction: 'Review registration evidence.',
        checks: checks({
            'GST Verification': {
                stage: 'GST Verification',
                state: 'review',
                result: 'Needs review',
                timestamp: 'Aug 28, 2026 · 12:10 UTC',
                explanation: 'Registration evidence requires confirmation.',
            },
        }),
    },
    {
        id: 'brightstack',
        name: 'Brightstack',
        legalName: 'Brightstack Technologies Ltd.',
        status: 'Completed',
        risk: 'Low',
        trustScore: 96,
        stage: 'Compliance RAG',
        updatedAt: '4 hrs ago',
        submittedAt: 'Aug 28, 2026',
        country: 'Canada',
        category: 'Software',
        website: 'brightstack.dev',
        phone: '+1 (604) 555-0122',
        email: 'trust@brightstack.dev',
        gstNumber: '89AABCB2345E1Z6',
        merchantId: 'mrc_01BRIG02',
        assessment: 'All checks passed.',
        logisticRegression: 'Low probability of elevated risk (0.02)',
        isolationForest: 'No anomalous behavior detected',
        riskSignals: [],
        complianceConcerns: [],
        ragContext: 'Software merchants with consistent identity can proceed.',
        recommendedAction: 'Approve merchant.',
        checks: checks(),
    },
    {
        id: 'cedar-home',
        name: 'Cedar Home',
        legalName: 'Cedar Home Interiors',
        status: 'Pending',
        risk: 'Low',
        trustScore: 83,
        stage: 'Phone Number Verification',
        updatedAt: '5 hrs ago',
        submittedAt: 'Aug 28, 2026',
        country: 'United States',
        category: 'Home goods',
        website: 'cedarhome.com',
        phone: '+1 (503) 555-0133',
        email: 'hello@cedarhome.com',
        gstNumber: '19AABCC3456F1Z7',
        merchantId: 'mrc_01CED03',
        assessment: 'Phone confirmation remains.',
        logisticRegression: 'Low probability of elevated risk (0.11)',
        isolationForest: 'No anomaly detected',
        riskSignals: [],
        complianceConcerns: [],
        ragContext: 'Home goods merchants need confirmed contact details.',
        recommendedAction: 'Complete phone verification.',
        checks: checks({
            'Phone Number Verification': {
                stage: 'Phone Number Verification',
                state: 'processing',
                result: 'Awaiting code',
                timestamp: 'Aug 28, 2026 · 11:20 UTC',
                explanation: 'Waiting for contact confirmation.',
            },
        }),
    },
    {
        id: 'swift-route',
        name: 'Swift Route',
        legalName: 'Swift Route Logistics',
        status: 'Completed',
        risk: 'Low',
        trustScore: 92,
        stage: 'Compliance RAG',
        updatedAt: '6 hrs ago',
        submittedAt: 'Aug 28, 2026',
        country: 'United Kingdom',
        category: 'Logistics',
        website: 'swiftroute.co.uk',
        phone: '+44 20 7946 0911',
        email: 'compliance@swiftroute.co.uk',
        gstNumber: 'GB123456789',
        merchantId: 'mrc_01SWIF04',
        assessment: 'Verification complete.',
        logisticRegression: 'Low probability of elevated risk (0.04)',
        isolationForest: 'No anomalous behavior detected',
        riskSignals: [],
        complianceConcerns: [],
        ragContext:
            'Logistics providers with verified registration meet policy.',
        recommendedAction: 'Approve merchant.',
        checks: checks(),
    },
    {
        id: 'olive-table',
        name: 'Olive Table',
        legalName: 'Olive Table Foods',
        status: 'Pending',
        risk: 'Medium',
        trustScore: 63,
        stage: 'Payment / Transaction Analysis',
        updatedAt: '7 hrs ago',
        submittedAt: 'Aug 28, 2026',
        country: 'Italy',
        category: 'Food & beverage',
        website: 'olivetable.it',
        phone: '+39 06 5550 0144',
        email: 'admin@olivetable.it',
        gstNumber: 'IT98765432109',
        merchantId: 'mrc_01OLIV05',
        assessment: 'Payment behavior requires review.',
        logisticRegression: 'Medium probability of elevated risk (0.38)',
        isolationForest: 'Moderate transaction outlier',
        riskSignals: ['Refund rate above baseline'],
        complianceConcerns: [],
        ragContext: 'Food merchants require transaction monitoring.',
        recommendedAction: 'Review payment analysis.',
        checks: checks({
            'Payment / Transaction Analysis': {
                stage: 'Payment / Transaction Analysis',
                state: 'review',
                result: 'Review required',
                timestamp: 'Aug 28, 2026 · 10:34 UTC',
                explanation: 'Refund behavior is above baseline.',
            },
        }),
    },
    {
        id: 'pixel-forge',
        name: 'Pixel Forge',
        legalName: 'Pixel Forge Studio',
        status: 'Completed',
        risk: 'Low',
        trustScore: 89,
        stage: 'Compliance RAG',
        updatedAt: 'Yesterday',
        submittedAt: 'Aug 27, 2026',
        country: 'France',
        category: 'Design services',
        website: 'pixelforge.fr',
        phone: '+33 1 5550 0155',
        email: 'studio@pixelforge.fr',
        gstNumber: 'FR12345678901',
        merchantId: 'mrc_01PIXE06',
        assessment: 'Identity and compliance checks passed.',
        logisticRegression: 'Low probability of elevated risk (0.07)',
        isolationForest: 'No anomalous behavior detected',
        riskSignals: [],
        complianceConcerns: [],
        ragContext: 'Service providers with corroborated identity can proceed.',
        recommendedAction: 'Approve merchant.',
        checks: checks(),
    },
    {
        id: 'summit-pay',
        name: 'Summit Pay',
        legalName: 'Summit Pay Services',
        status: 'Failed',
        risk: 'High',
        trustScore: 28,
        stage: 'Trust Score + Risk Level',
        updatedAt: 'Yesterday',
        submittedAt: 'Aug 27, 2026',
        country: 'United States',
        category: 'Financial services',
        website: 'summitpay.example',
        phone: '+1 (646) 555-0166',
        email: 'risk@summitpay.example',
        gstNumber: '24AABCS4567G1Z8',
        merchantId: 'mrc_01SUMM07',
        assessment: 'Multiple risk signals require escalation.',
        logisticRegression: 'High probability of elevated risk (0.88)',
        isolationForest: 'Multiple strong outliers detected',
        riskSignals: ['Beneficial owner mismatch'],
        complianceConcerns: ['Enhanced due diligence required'],
        ragContext: 'Financial services merchants require enhanced review.',
        recommendedAction: 'Keep blocked.',
        checks: checks({
            'Trust Score + Risk Level': {
                stage: 'Trust Score + Risk Level',
                state: 'failed',
                result: 'High risk',
                timestamp: 'Aug 27, 2026 · 15:10 UTC',
                explanation: 'Risk models identified material anomalies.',
            },
        }),
    },
    {
        id: 'wellnest',
        name: 'Wellnest',
        legalName: 'Wellnest Health Pty Ltd',
        status: 'Pending',
        risk: 'Medium',
        trustScore: 76,
        stage: 'Website Verification',
        updatedAt: '2 days ago',
        submittedAt: 'Aug 27, 2026',
        country: 'Australia',
        category: 'Healthcare',
        website: 'wellnest.au',
        phone: '+61 3 5550 0177',
        email: 'operations@wellnest.au',
        gstNumber: 'AU123456789',
        merchantId: 'mrc_01WELL08',
        assessment: 'Website verification is still running.',
        logisticRegression: 'Medium probability of elevated risk (0.22)',
        isolationForest: 'No material outlier detected',
        riskSignals: [],
        complianceConcerns: [],
        ragContext:
            'Healthcare merchants require aligned business and web evidence.',
        recommendedAction: 'Complete website verification.',
        checks: checks({
            'Website Verification': {
                stage: 'Website Verification',
                state: 'processing',
                result: 'Running',
                timestamp: 'Aug 27, 2026 · 14:18 UTC',
                explanation: 'Website signals are being evaluated.',
            },
        }),
    },
    {
        id: 'maple-market',
        name: 'Maple Market',
        legalName: 'Maple Market Co.',
        status: 'Pending',
        risk: 'Medium',
        trustScore: 58,
        stage: 'Compliance RAG',
        updatedAt: '2 days ago',
        submittedAt: 'Aug 26, 2026',
        country: 'Canada',
        category: 'Retail',
        website: 'maplemarket.ca',
        phone: '+1 (514) 555-0188',
        email: 'ops@maplemarket.ca',
        gstNumber: '72AABCM5678H1Z9',
        merchantId: 'mrc_01MAPL09',
        assessment: 'Compliance context needs confirmation.',
        logisticRegression: 'Medium probability of elevated risk (0.41)',
        isolationForest: 'Moderate outlier detected',
        riskSignals: ['Incomplete business context'],
        complianceConcerns: ['Additional registration evidence requested'],
        ragContext:
            'Canadian retailers require corroborated registration data.',
        recommendedAction: 'Request additional evidence.',
        checks: checks({
            'Compliance RAG': {
                stage: 'Compliance RAG',
                state: 'review',
                result: 'Needs review',
                timestamp: 'Aug 26, 2026 · 13:06 UTC',
                explanation: 'Additional context is required.',
            },
        }),
    },
    {
        id: 'orbit-commerce',
        name: 'Orbit Commerce',
        legalName: 'Orbit Commerce GmbH',
        status: 'Completed',
        risk: 'Low',
        trustScore: 90,
        stage: 'Compliance RAG',
        updatedAt: '3 days ago',
        submittedAt: 'Aug 26, 2026',
        country: 'Germany',
        category: 'Software',
        website: 'orbitcommerce.de',
        phone: '+49 30 555 0199',
        email: 'trust@orbitcommerce.de',
        gstNumber: 'DE123456789',
        merchantId: 'mrc_01ORBI10',
        assessment: 'Verification complete with no outstanding concerns.',
        logisticRegression: 'Low probability of elevated risk (0.05)',
        isolationForest: 'No anomalous behavior detected',
        riskSignals: [],
        complianceConcerns: [],
        ragContext: 'Software merchants with clear ownership can proceed.',
        recommendedAction: 'Approve merchant.',
        checks: checks(),
    },
];

export const merchantById = (id: string) =>
    merchants.find((merchant) => merchant.id === id);
