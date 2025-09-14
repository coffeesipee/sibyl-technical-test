import QuoteForm from '@/components/quote-form';
import { createQuote } from './actions';

interface Props {
    params: Promise<{ caseId: string }>
}

export default async function CreateQuotePage({ params }: Props) {
    const { caseId } = await params

    return <QuoteForm
        onSubmit={createQuote}
        defaultValue={{ caseId, amount: 0, expectedDays: 0, note: '' }}
    />;
}
