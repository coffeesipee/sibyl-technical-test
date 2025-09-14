import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './env';
import { router } from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error';
import { paymentsWebhookHandler } from './routes/modules/payments';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
// Stripe webhook must use raw body. Mount BEFORE any JSON parsing middleware.
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentsWebhookHandler);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp());

app.use('/api', router);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
