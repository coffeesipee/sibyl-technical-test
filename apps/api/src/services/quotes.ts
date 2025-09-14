import { QuoteUpsertInput, QuoteStatus, TQuoteStatus } from '@sibyl/shared';

export interface QuotesServiceDeps {
  prisma: {
    quote: {
      upsert: Function;
      findMany: Function;
      count: Function;
      findUnique: Function;
    };
    case: {
      findUnique: Function;
    };
  };
  createCheckoutSession: (opts: { amount: number; quoteId: string; successUrl: string; cancelUrl: string }) => Promise<any>;
  getPagination: (page: number, pageSize: number) => { skip: number; take: number };
  buildPageMeta: (total: number, page: number, pageSize: number) => any;
}

export class QuotesService {
  constructor(private deps: QuotesServiceDeps) {}

  async upsertQuoteForCase(userId: string, caseId: string, input: QuoteUpsertInput) {
    const { amount, expectedDays, note } = input;
    const quote = await this.deps.prisma.quote.upsert({
      where: { caseId_lawyerId: { caseId, lawyerId: userId } },
      update: { amount, expectedDays, note },
      create: { caseId, lawyerId: userId, amount, expectedDays, note },
    });
    return quote;
  }

  async listMyQuotes(userId: string, page: number, pageSize: number, status?: string) {
    const parsedStatus: TQuoteStatus | undefined =
      status && (QuoteStatus.options as readonly string[]).includes(status)
        ? (status as TQuoteStatus)
        : undefined;
    const { skip, take } = this.deps.getPagination(page, pageSize);
    const where: any = { lawyerId: userId };
    if (parsedStatus) where.status = parsedStatus;

    const [items, total] = await Promise.all([
      this.deps.prisma.quote.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take, include: { case: true } }),
      this.deps.prisma.quote.count({ where }),
    ]);

    return { items, meta: this.deps.buildPageMeta(total, page, pageSize) };
  }

  async getMyQuoteById(userId: string, quoteId: string, status?: string) {
    const q = await this.deps.prisma.quote.findUnique({ where: { id: quoteId }, include: { case: true } });
    if (!q) return { notFound: true } as const;
    if (q.lawyerId !== userId) return { forbidden: true } as const;
    if (status) {
      const isValid = (QuoteStatus.options as readonly string[]).includes(status);
      if (!isValid) return { notFound: true } as const;
      if (q.status !== status) return { notFound: true } as const;
    }
    if (q.status === 'accepted') {
      const caseWithFiles = await this.deps.prisma.case.findUnique({ where: { id: q.caseId }, include: { files: true } });
      const enriched = { ...q, case: { ...q.case, files: caseWithFiles?.files ?? [] } } as any;
      return { ok: true as const, quote: enriched };
    }
    return { ok: true as const, quote: q };
  }

  async acceptQuote(userId: string, quoteId: string, successUrl: string, cancelUrl: string) {
    const quote = await this.deps.prisma.quote.findUnique({ where: { id: quoteId }, include: { case: true } });
    if (!quote) return { notFound: true } as const;
    if (quote.case.clientId !== userId) return { forbidden: true } as const;

    const session = await this.deps.createCheckoutSession({ amount: quote.amount, quoteId, successUrl, cancelUrl });
    return { ok: true as const, session };
  }
}
