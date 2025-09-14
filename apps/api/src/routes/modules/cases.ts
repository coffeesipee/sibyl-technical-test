import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/rbac';
import { UserRole, CaseCreateSchema, PaginationQuerySchema, MarketplaceFilterSchema } from '@sibyl/shared';
import { validateBody, validateQuery } from '../../middlewares/validate';
import { prisma } from '../../services/prisma';
import { getPagination, buildPageMeta } from '../../utils/pagination';
import { CasesService } from '../../services/cases';

const router = Router();

const casesService = new CasesService({
  prisma,
  getPagination: (page: number, pageSize: number) => getPagination(page, pageSize),
  buildPageMeta: (total: number, page: number, pageSize: number) => buildPageMeta(total, page, pageSize),
});

// Client: create case
router.post('/', authenticateJWT, requireRole(UserRole.CLIENT), validateBody(CaseCreateSchema), async (req, res, next) => {
  try {
    const created = await casesService.createCase(req.user!.id, req.body);
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

// Client: list my cases with counts
router.get('/my', authenticateJWT, requireRole(UserRole.CLIENT), validateQuery(PaginationQuerySchema), async (req, res, next) => {
  try {
    const { page, pageSize } = req.query as any;
    const result = await casesService.listMyCases(req.user!.id, Number(page), Number(pageSize));
    res.json(result);
  } catch (e) { next(e); }
});

// Public marketplace for lawyers (anonymized)
router.get('/marketplace', authenticateJWT, requireRole(UserRole.LAWYER), validateQuery(MarketplaceFilterSchema.merge(PaginationQuerySchema)), async (req, res, next) => {
  try {
    const { page, pageSize, category, created_since } = req.query as any;
    const result = await casesService.marketplaceList(Number(page), Number(pageSize), { category, created_since });
    res.json(result);
  } catch (e) { next(e); }
});

// Lawyer: marketplace case summary (anonymized); only open cases
router.get('/marketplace/:id', authenticateJWT, requireRole(UserRole.LAWYER), async (req, res, next) => {
  try {
    const id = req.params.id;
    const c = await casesService.marketplaceSummary(id);
    if (!c) return res.status(404).json({ error: 'Not found' });
    res.json(c);
  } catch (e) { next(e); }
});

// Case details (client or accepted lawyer can view). Placeholder access check; implement properly later.
router.get('/:id', authenticateJWT, async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await casesService.getCaseForUser({ id: req.user!.id, role: req.user!.role }, id);
    if ('notFound' in result) return res.status(404).json({ error: 'Not found' });
    if ('forbidden' in result) return res.status(403).json({ error: 'Forbidden' });
    res.json(result.case);
  } catch (e) { next(e); }
});

export default router;
