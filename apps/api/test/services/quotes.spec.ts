import { QuotesService } from '../../src/services/quotes';

function makeDeps() {
  const prisma = {
    quote: {
      upsert: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
    },
  } as any;
  const createCheckoutSession = jest.fn(async () => ({ id: 'sess_1', url: 'https://example.com' } as any));
  const getPagination = (page: number, pageSize: number) => ({ skip: (page - 1) * pageSize, take: pageSize });
  const buildPageMeta = (total: number, page: number, pageSize: number) => ({ total, page, pageSize });
  return { prisma, createCheckoutSession, getPagination, buildPageMeta };
}

describe('QuotesService', () => {
  it('upsertQuoteForCase creates or updates a quote', async () => {
    const { prisma, createCheckoutSession, getPagination, buildPageMeta } = makeDeps();
    prisma.quote.upsert.mockResolvedValue({ id: 'q1', amount: 100 });
    const svc = new QuotesService({ prisma, createCheckoutSession, getPagination, buildPageMeta });

    const res = await svc.upsertQuoteForCase('lawyer1', 'case1', { amount: 100, expectedDays: 10, note: '', caseId: 'case1' } as any);
    expect(res.id).toBe('q1');
    expect(prisma.quote.upsert).toHaveBeenCalled();
  });

  it('listMyQuotes returns items and meta, filters by status if valid', async () => {
    const { prisma, createCheckoutSession, getPagination, buildPageMeta } = makeDeps();
    prisma.quote.findMany.mockResolvedValue([{ id: 'q1' }]);
    prisma.quote.count.mockResolvedValue(1);
    const svc = new QuotesService({ prisma, createCheckoutSession, getPagination, buildPageMeta });

    const res = await svc.listMyQuotes('lawyer1', 1, 10, 'proposed');
    expect(res.items.length).toBe(1);
    expect(res.meta.total).toBe(1);
  });

  it('acceptQuote returns forbidden if user does not own the case', async () => {
    const { prisma, createCheckoutSession, getPagination, buildPageMeta } = makeDeps();
    prisma.quote.findUnique.mockResolvedValue({ id: 'q1', amount: 100, case: { clientId: 'other' } });
    const svc = new QuotesService({ prisma, createCheckoutSession, getPagination, buildPageMeta });

    const res = await svc.acceptQuote('u1', 'q1', 's', 'c');
    expect('forbidden' in res).toBe(true);
  });

  it('acceptQuote returns notFound if missing', async () => {
    const { prisma, createCheckoutSession, getPagination, buildPageMeta } = makeDeps();
    prisma.quote.findUnique.mockResolvedValue(null);
    const svc = new QuotesService({ prisma, createCheckoutSession, getPagination, buildPageMeta });

    const res = await svc.acceptQuote('u1', 'qX', 's', 'c');
    expect('notFound' in res).toBe(true);
  });

  it('acceptQuote returns ok with session when user is owner', async () => {
    const { prisma, createCheckoutSession, getPagination, buildPageMeta } = makeDeps();
    prisma.quote.findUnique.mockResolvedValue({ id: 'q1', amount: 100, case: { clientId: 'u1' } });
    const svc = new QuotesService({ prisma, createCheckoutSession, getPagination, buildPageMeta });

    const res = await svc.acceptQuote('u1', 'q1', 's', 'c');
    expect('ok' in res).toBe(true);
    if ('ok' in res) {
      expect(res.session.id).toBe('sess_1');
    }
  });
});
