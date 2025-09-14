import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/rbac';
import { UserRole } from '@sibyl/shared';
import type { Request, Response } from 'express';
import { env } from '../../env';
import { prisma } from '../../services/prisma';
import { PaymentsService, stripe, createCheckoutSession } from '../../services/payments';
import type Stripe from 'stripe';

const router = Router();

const paymentsService = new PaymentsService({
  prisma,
  stripe,
  createCheckoutSession: (opts) => createCheckoutSession(opts),
  webhookSecret: env.STRIPE_WEBHOOK_SECRET,
});

// Client: create checkout session for a quote
router.post('/checkout/:quoteId', authenticateJWT, requireRole(UserRole.CLIENT), async (req, res, next) => {
  try {
    const { quoteId } = req.params;
    const origin = (req.headers['origin'] as string) || (req.headers['referer'] as string) || 'http://localhost:3000';
    const base = origin.replace(/\/$/, '');
    const successUrl = `${base}/success`;
    const cancelUrl = `${base}/cancel`;
    const result = await paymentsService.createCheckoutForQuote(req.user!.id, quoteId, successUrl, cancelUrl);
    if ('notFound' in result) return res.status(404).json({ error: 'Not found' });
    if ('forbidden' in result) return res.status(403).json({ error: 'Forbidden' });
    res.json({ id: result.session.id, url: result.session.url });
  } catch (e) {
    next(e);
  }
});

// Stripe webhook handler (must receive raw body, mounted in app.ts BEFORE express.json())
export async function paymentsWebhookHandler(req: Request, res: Response) {
  try {
    if (!stripe || !env.STRIPE_WEBHOOK_SECRET) return res.status(200).json({ skipped: true });
    const sig = req.headers['stripe-signature'];
    if (!sig || Array.isArray(sig)) return res.status(400).send('Missing signature');
    const raw = (req as any).body as Buffer; // express.raw provides Buffer
    const event = paymentsService.constructEvent(raw, sig);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const quoteId = session.metadata?.quoteId;
        if (!quoteId) break;
        await paymentsService.handleCheckoutCompleted(quoteId);
        break;
      }
      default:
        break;
    }
    return res.json({ received: true });
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
}

export default router;
