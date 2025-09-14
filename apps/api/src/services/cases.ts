import { CaseCreateInput, TCaseCategory } from '@sibyl/shared';

export interface CasesServiceDeps {
  prisma: {
    case: {
      create: Function;
      findMany: Function;
      count: Function;
      findFirst: Function;
      findUnique: Function;
    };
    quote: {
      findFirst: Function;
    };
  };
  getPagination: (page: number, pageSize: number) => { skip: number; take: number };
  buildPageMeta: (total: number, page: number, pageSize: number) => any;
}

export class CasesService {
  constructor(private deps: CasesServiceDeps) {}

  private redactPII(text: string) {
    if (!text) return text;
    // Simple email and phone redaction
    const emailRegex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
    const phoneRegex = /\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3}[-.\s]?\d{3,4}\b/g;
    return text.replace(emailRegex, '[redacted-email]').replace(phoneRegex, '[redacted-phone]');
  }

  async createCase(clientId: string, input: CaseCreateInput) {
    const { title, category, description } = input;
    return this.deps.prisma.case.create({ data: { title, category, description, clientId } });
  }

  async listMyCases(clientId: string, page: number, pageSize: number) {
    const { skip, take } = this.deps.getPagination(page, pageSize);
    const [items, total] = await Promise.all([
      this.deps.prisma.case.findMany({ where: { clientId }, orderBy: { createdAt: 'desc' }, skip, take, include: { _count: { select: { quotes: true } } } }),
      this.deps.prisma.case.count({ where: { clientId } }),
    ]);
    const redacted = items.map((c: any) => ({ ...c, description: this.redactPII(c.description), title: this.redactPII(c.title) }));
    return { items: redacted, meta: this.deps.buildPageMeta(total, page, pageSize) };
  }

  async marketplaceList(page: number, pageSize: number, filters?: { category?: TCaseCategory; created_since?: string }) {
    const where: any = { status: 'open' };
    if (filters?.category) where.category = filters.category;
    if (filters?.created_since) where.createdAt = { gte: new Date(filters.created_since) };
    const { skip, take } = this.deps.getPagination(page, pageSize);
    const [items, total] = await Promise.all([
      this.deps.prisma.case.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take, select: { id: true, title: true, category: true, createdAt: true, description: true, status: true } }),
      this.deps.prisma.case.count({ where }),
    ]);
    const redacted = items.map((c: any) => ({ ...c, description: this.redactPII(c.description), title: this.redactPII(c.title) }));
    return { items: redacted, meta: this.deps.buildPageMeta(total, page, pageSize) };
  }

  async marketplaceSummary(id: string) {
    const c = await this.deps.prisma.case.findFirst({ where: { id, status: 'open' }, select: { id: true, title: true, category: true, createdAt: true, status: true } });
    if (!c) return c as any;
    return { ...c, title: this.redactPII(c.title) } as any;
  }

  async getCaseForUser(user: { id: string; role: 'CLIENT' | 'LAWYER' }, id: string) {
    const c = await this.deps.prisma.case.findUnique({ where: { id }, include: { files: true, quotes: true } });
    if (!c) return { notFound: true } as const;
    if (user.role === 'CLIENT' && c.clientId !== user.id) return { forbidden: true } as const;
    if (user.role === 'LAWYER') {
      const accepted = await this.deps.prisma.quote.findFirst({ where: { caseId: id, lawyerId: user.id, status: 'accepted' } });
      if (!accepted) return { forbidden: true } as const;
    }
    // Redact description and title in detail as well
    return { ok: true as const, case: { ...c, description: this.redactPII(c.description), title: this.redactPII(c.title) } };
  }
}
