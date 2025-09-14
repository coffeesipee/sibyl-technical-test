import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/rbac';
import { UserRole, QuoteUpsertSchema, PaginationQuerySchema } from '@sibyl/shared';
import z from 'zod';
import { validateBody, validateQuery } from '../../middlewares/validate';
import { prisma } from '../../services/prisma';
import { getPagination, buildPageMeta } from '../../utils/pagination';
import { createCheckoutSession } from '../../services/payments';
import { QuotesService } from '../../services/quotes';

const router = Router();

// Service factory (dependencies injected for testability)
const quotesService = new QuotesService({
  prisma,
  createCheckoutSession,
  getPagination: (page: number, pageSize: number) => getPagination(page, pageSize),
  buildPageMeta: (total: number, page: number, pageSize: number) => buildPageMeta(total, page, pageSize),
});

// Lawyer: upsert a quote for a case
router.post('/:caseId', authenticateJWT, requireRole(UserRole.LAWYER), validateBody(QuoteUpsertSchema), async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const quote = await quotesService.upsertQuoteForCase(req.user!.id, caseId, req.body);
    res.json(quote);
  } catch (e) {
    next(e);
  }
});

// Lawyer: my quotes with filter
router.get('/my', authenticateJWT, requireRole(UserRole.LAWYER), validateQuery(PaginationQuerySchema.extend({ status: z.string().optional() })), async (req, res, next) => {
  try {
    const { page, pageSize } = req.query as any;
    let statusParam = (req.query as any).status as string | undefined;
    if (statusParam === 'all') statusParam = undefined;
    const result = await quotesService.listMyQuotes(req.user!.id, Number(page), Number(pageSize), statusParam);
    res.json(result);
  } catch (e) { next(e); }
});

// Lawyer: get my quote by id
router.get('/:id', authenticateJWT, requireRole(UserRole.LAWYER), async (req, res, next) => {
  try {
    const result = await quotesService.getMyQuoteById(req.user!.id, req.params.id);
    if ('notFound' in result) return res.status(404).json({ error: 'Not found' });
    if ('forbidden' in result) return res.status(403).json({ error: 'Forbidden' });
    res.json(result.quote);
  } catch (e) { next(e); }
});

// Client: accept a quote (starts payment flow)
router.post('/:id/accept', authenticateJWT, requireRole(UserRole.CLIENT), async (req, res, next) => {
  try {
    const origin = (req.headers['origin'] as string) || (req.headers['referer'] as string) || 'http://localhost:3000';
    const base = origin.replace(/\/$/, '');
    const successUrl = `${base}/success`;
    const cancelUrl = `${base}/cancel`;
    const result = await quotesService.acceptQuote(req.user!.id, req.params.id, successUrl, cancelUrl);
    if ('notFound' in result) return res.status(404).json({ error: 'Not found' });
    if ('forbidden' in result) return res.status(403).json({ error: 'Forbidden' });
    res.json({ ok: true, message: 'checkout url created', session: result.session });
  } catch (e) { next(e); }
});

export default router;
