import Stripe from 'stripe';
import { env } from '../env';
import type { PrismaClient } from '@prisma/client';

export const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' }) : null;

export async function createCheckoutSession(opts: { amount: number; quoteId: string; successUrl: string; cancelUrl: string }) {
  if (!stripe) throw new Error('Stripe not configured');
  // Stripe expects unit_amount in the smallest currency unit (cents for SGD)
  const unitAmountCents = Math.max(1, Math.round(Number(opts.amount) * 100));
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'sgd',
          unit_amount: unitAmountCents,
          product_data: { name: `Legal services quote #${opts.quoteId}` },
        },
        quantity: 1,
      },
    ],
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    metadata: { quoteId: opts.quoteId },
  });
  return session;
}

export interface PaymentsServiceDeps {
  prisma: Pick<PrismaClient, '$transaction'> & {
    quote: {
      findUnique: Function;
      update: Function;
      updateMany: Function;
    };
    case: {
      update: Function;
    };
  };
  stripe: Stripe | null;
  createCheckoutSession: (opts: { amount: number; quoteId: string; successUrl: string; cancelUrl: string }) => Promise<Stripe.Checkout.Session>;
  webhookSecret?: string;
}

export class PaymentsService {
  constructor(private deps: PaymentsServiceDeps) {}

  async createCheckoutForQuote(userId: string, quoteId: string, successUrl: string, cancelUrl: string) {
    // Verify quote belongs to client
    const q: any = await this.deps.prisma.quote.findUnique({ where: { id: quoteId }, include: { case: true } });
    if (!q) return { notFound: true } as const;
    if (q.case.clientId !== userId) return { forbidden: true } as const;
    // Create checkout with amount in dollars (service converts to cents)
    const session = await this.deps.createCheckoutSession({ amount: q.amount, quoteId, successUrl, cancelUrl });
    return { ok: true as const, session };
  }

  constructEvent(rawBody: Buffer, signature: string) {
    if (!this.deps.stripe || !this.deps.webhookSecret) throw new Error('Stripe webhook not configured');
    return this.deps.stripe.webhooks.constructEvent(rawBody, signature, this.deps.webhookSecret);
  }

  async handleCheckoutCompleted(quoteId: string) {
    await this.deps.prisma.$transaction(async (tx: any) => {
      const q = await tx.quote.findUnique({ where: { id: quoteId } });
      if (!q) return;
      await tx.quote.update({ where: { id: quoteId }, data: { status: 'accepted' } });
      await tx.quote.updateMany({ where: { caseId: q.caseId, NOT: { id: quoteId } }, data: { status: 'rejected' } });
      await tx.case.update({ where: { id: q.caseId }, data: { status: 'engaged' } });
    });
  }
}
