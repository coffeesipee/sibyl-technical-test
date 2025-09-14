import { CasesService } from '../../src/services/cases';

describe('CasesService PII redaction', () => {
  const getPagination = (page: number, pageSize: number) => ({ skip: (page - 1) * pageSize, take: pageSize });
  const buildPageMeta = (total: number, page: number, pageSize: number) => ({ total, page, pageSize });

  function makeDeps() {
    const prisma = {
      case: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
      },
      quote: { findFirst: jest.fn() },
    } as any;
    return { prisma };
  }

  it('redacts email and phone in listMyCases', async () => {
    const { prisma } = makeDeps();
    prisma.case.findMany.mockResolvedValue([
      { id: 'c1', title: 'Contact john@example.com', description: 'Call +1 415-555-1234', _count: { quotes: 2 } },
    ]);
    prisma.case.count.mockResolvedValue(1);
    const svc = new CasesService({ prisma, getPagination, buildPageMeta });
    const res = await svc.listMyCases('u1', 1, 10);
    expect(res.items[0].title).toContain('[redacted-email]');
    expect(res.items[0].description).toContain('[redacted-phone]');
  });

  it('redacts in marketplaceList', async () => {
    const { prisma } = makeDeps();
    prisma.case.findMany.mockResolvedValue([
      { id: 'c1', title: 'Email jane@site.co', description: 'My number 222-333-4444', createdAt: new Date().toISOString(), status: 'open', category: 'contract' },
    ]);
    prisma.case.count.mockResolvedValue(1);
    const svc = new CasesService({ prisma, getPagination, buildPageMeta });
    const res = await svc.marketplaceList(1, 10);
    expect(res.items[0].title).toContain('[redacted-email]');
    expect(res.items[0].description).toContain('[redacted-phone]');
  });

  it('redacts in marketplaceSummary (title)', async () => {
    const { prisma } = makeDeps();
    prisma.case.findFirst.mockResolvedValue({ id: 'c1', title: 'Ping me at a@b.com', createdAt: new Date().toISOString(), status: 'open', category: 'contract' });
    const svc = new CasesService({ prisma, getPagination, buildPageMeta });
    const res = await svc.marketplaceSummary('c1');
    expect(res?.title).toContain('[redacted-email]');
  });

  it('redacts in getCaseForUser detail', async () => {
    const { prisma } = makeDeps();
    prisma.case.findUnique.mockResolvedValue({ id: 'c1', clientId: 'u1', title: 'x@y.com', description: 'phone 123-456-7890', files: [], quotes: [] });
    const svc = new CasesService({ prisma, getPagination, buildPageMeta });
    const res = await svc.getCaseForUser({ id: 'u1', role: 'CLIENT' }, 'c1');
    if ('ok' in res) {
      expect(res.case.title).toContain('[redacted-email]');
      expect(res.case.description).toContain('[redacted-phone]');
    } else {
      throw new Error('expected ok result');
    }
  });
});
