import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config({
    path: '.env',
});

const envSchema = z.object({
    INNGEST_DEV: z.coerce.number().int().min(0).max(1).default(0),
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
    BASE_URL: z.string(),
    PORT: z.coerce.number().int().min(0).max(65535).default(4000),
    DATABASE_URL: z.string().url(),
    ML_SERVICE_URL: z.string().url(),
    FRONTEND_URL: z.string().url(),
    FIRECRAWL_API_KEY: z.string(),
    CLOUDINARY_API_KEY: z.string(),
    CLOUDINARY_API_SECRET: z.string(),
    CLOUDINARY_CLOUD_NAME: z.string(),
    ADMIN_UPLOAD_PASSWORD: z.string(),
    MISTRAL_API_KEY: z.string(),
    GROQ_API_KEY: z.string(),
});

export const config = envSchema.parse(process.env);
