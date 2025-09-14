import { CasesService } from '../../src/services/cases';

function createPrismaMock() {
  const prisma = {
    case: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    quote: {
      findFirst: jest.fn(),
    },
  } as any;
  return { prisma };
}

describe('CasesService', () => {
  const getPagination = (page: number, pageSize: number) => ({ skip: (page - 1) * pageSize, take: pageSize });
  const buildPageMeta = (total: number, page: number, pageSize: number) => ({ total, page, pageSize });

  it('createCase creates case for client', async () => {
    const { prisma } = createPrismaMock();
    prisma.case.create.mockResolvedValue({ id: 'c1' });
    const svc = new CasesService({ prisma, getPagination, buildPageMeta });
    const res = await svc.createCase('u1', { title: 't', category: 'contract' as any, description: 'd' });
    expect(res.id).toBe('c1');
    expect(prisma.case.create).toHaveBeenCalled();
  });

  it('listMyCases returns items and meta', async () => {
    const { prisma } = createPrismaMock();
    prisma.case.findMany.mockResolvedValue([{ id: 'c1' }]);
    prisma.case.count.mockResolvedValue(1);
    const svc = new CasesService({ prisma, getPagination, buildPageMeta });
    const res = await svc.listMyCases('u1', 1, 10);
    expect(res.items.length).toBe(1);
    expect(res.meta.total).toBe(1);
  });

  it('marketplaceList returns filtered list', async () => {
    const { prisma } = createPrismaMock();
    prisma.case.findMany.mockResolvedValue([{ id: 'c1' }]);
    prisma.case.count.mockResolvedValue(1);
    const svc = new CasesService({ prisma, getPagination, buildPageMeta });
    const res = await svc.marketplaceList(1, 10, { category: 'contract' as any });
    expect(res.items.length).toBe(1);
  });

  it('marketplaceSummary returns record or null', async () => {
    const { prisma } = createPrismaMock();
    prisma.case.findFirst.mockResolvedValueOnce({ id: 'c1' });
    const svc = new CasesService({ prisma, getPagination, buildPageMeta });
    const ok = await svc.marketplaceSummary('c1');
    expect(ok).toEqual({ id: 'c1' });
    prisma.case.findFirst.mockResolvedValueOnce(null);
    const notFound = await svc.marketplaceSummary('c2');
    expect(notFound).toBeNull();
  });

  it('getCaseForUser enforces access: client ok', async () => {
    const { prisma } = createPrismaMock();
    prisma.case.findUnique.mockResolvedValue({ id: 'c1', clientId: 'u1', files: [], quotes: [] });
    const svc = new CasesService({ prisma, getPagination, buildPageMeta });
    const res = await svc.getCaseForUser({ id: 'u1', role: 'CLIENT' }, 'c1');
    expect('ok' in res).toBe(true);
  });

  it('getCaseForUser forbids client accessing others', async () => {
    const { prisma } = createPrismaMock();
    prisma.case.findUnique.mockResolvedValue({ id: 'c1', clientId: 'other', files: [], quotes: [] });
    const svc = new CasesService({ prisma, getPagination, buildPageMeta });
    const res = await svc.getCaseForUser({ id: 'u1', role: 'CLIENT' }, 'c1');
    expect('forbidden' in res).toBe(true);
  });

  it('getCaseForUser for lawyer requires accepted quote', async () => {
    const { prisma } = createPrismaMock();
    prisma.case.findUnique.mockResolvedValue({ id: 'c1', clientId: 'client', files: [], quotes: [] });
    prisma.quote.findFirst.mockResolvedValueOnce(null);
    const svc = new CasesService({ prisma, getPagination, buildPageMeta });
    const res = await svc.getCaseForUser({ id: 'lawyer', role: 'LAWYER' }, 'c1');
    expect('forbidden' in res).toBe(true);
  });
});
