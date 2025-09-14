import { PaymentsService } from '../../src/services/payments';

function createPrismaMock() {
    const tx = {
        quote: {
            findUnique: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
        },
        case: {
            update: jest.fn(),
        },
    };
    const prisma = {
        quote: {
            findUnique: jest.fn(),
        },
        $transaction: jest.fn(async (cb: any) => cb(tx)),
    } as any;
    return { prisma, tx };
}

describe('PaymentsService', () => {
    const stripeMock: any = {
        webhooks: {
            constructEvent: jest.fn((raw: Buffer, sig: string, secret: string) => ({ type: 'checkout.session.completed', data: { object: { metadata: { quoteId: 'qid' } } } })),
        },
    };

    it('createCheckoutForQuote returns session when user owns the case', async () => {
        const { prisma } = createPrismaMock();
        prisma.quote.findUnique.mockResolvedValue({ id: 'qid', amount: 100, case: { clientId: 'u1' } });

        const createCheckoutSession = jest.fn(async () => ({ id: 'sess_1', url: 'https://example.com' } as any));

        const svc = new PaymentsService({
            prisma,
            stripe: stripeMock,
            createCheckoutSession,
            webhookSecret: 'whsec',
        });

        const res = await svc.createCheckoutForQuote('u1', 'qid', 'http://host/success', 'http://host/cancel');
        expect('ok' in res).toBe(true);
        if ('ok' in res) {
            expect(res?.session?.id).toBe('sess_1');
            expect(createCheckoutSession).toHaveBeenCalledWith({ amount: 100, quoteId: 'qid', successUrl: 'http://host/success', cancelUrl: 'http://host/cancel' });
        }
    });

    it('createCheckoutForQuote returns forbidden when user does not own the case', async () => {
        const { prisma } = createPrismaMock();
        prisma.quote.findUnique.mockResolvedValue({ id: 'qid', amount: 100, case: { clientId: 'other' } });

        const svc = new PaymentsService({
            prisma,
            stripe: stripeMock,
            createCheckoutSession: jest.fn(),
            webhookSecret: 'whsec',
        });

        const res = await svc.createCheckoutForQuote('u1', 'qid', 's', 'c');
        expect('forbidden' in res).toBe(true);
    });

    it('createCheckoutForQuote returns notFound when quote missing', async () => {
        const { prisma } = createPrismaMock();
        prisma.quote.findUnique.mockResolvedValue(null);

        const svc = new PaymentsService({
            prisma,
            stripe: stripeMock,
            createCheckoutSession: jest.fn(),
            webhookSecret: 'whsec',
        });

        const res = await svc.createCheckoutForQuote('u1', 'qid', 's', 'c');
        expect('notFound' in res).toBe(true);
    });

    it('handleCheckoutCompleted updates quote and case in a transaction', async () => {
        const { prisma, tx } = createPrismaMock();
        tx.quote.findUnique.mockResolvedValue({ id: 'qid', caseId: 'case1' });

        const svc = new PaymentsService({
            prisma,
            stripe: stripeMock,
            createCheckoutSession: jest.fn(),
            webhookSecret: 'whsec',
        });

        await svc.handleCheckoutCompleted('qid');

        expect(tx.quote.update).toHaveBeenCalledWith({ where: { id: 'qid' }, data: { status: 'accepted' } });
        expect(tx.quote.updateMany).toHaveBeenCalledWith({ where: { caseId: 'case1', NOT: { id: 'qid' } }, data: { status: 'rejected' } });
        expect(tx.case.update).toHaveBeenCalledWith({ where: { id: 'case1' }, data: { status: 'engaged' } });
    });
});
