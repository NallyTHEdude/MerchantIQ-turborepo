import { globalErrorHandler } from '@/utils/errors/globalErrorHandler';
import express from 'express';
import { serve } from 'inngest/express';
import { config } from '@/config/env';
import { inngestClient } from '@/config/inngest-pipeline/client';
import {
    verificationPipeline,
    documentIngestionPipeline,
    merchantAnalysisPipeline,
    ragProcessingPipeline,
} from './config/inngest-pipeline/functions';
import helmet from 'helmet';
import cors from 'cors';

//import routes
import healthRoute from '@/app/routes/health.route';
import merchantRoute from '@/app/routes/merchant.route';
import paymentRoute from '@/app/routes/payment.route';
import verificationRoute from '@/app/routes/verification.route';
import swaggerRouter from '@/config/swagger/swagger';
import documentRoute from '@/app/routes/document.route';

const app = express();

app.use(helmet());
app.use(
    cors({
        origin: config.FRONTEND_URL,
        credentials: true,
    }),
);
app.use((req, res, next) => {
    if (req.is('multipart/form-data')) {
        return next();
    }
    express.json()(req, res, next);
});

// suggested in docs
app.use(
    '/api/inngest',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    serve({
        client: inngestClient,
        functions: [
            verificationPipeline,
            documentIngestionPipeline,
            ragProcessingPipeline,
            merchantAnalysisPipeline,
        ],
    }),
);

// setup routes
app.use('/api-docs', swaggerRouter);
app.use('/api/health', healthRoute);
app.use('/api/merchant', merchantRoute);
app.use('/api/verification', verificationRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/document', documentRoute);

app.use(globalErrorHandler);

export default app;
