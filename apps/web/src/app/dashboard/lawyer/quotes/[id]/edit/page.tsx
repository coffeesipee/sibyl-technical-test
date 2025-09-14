import QuoteForm from '@/components/quote-form'
import { getMyQuote, upsertQuote } from '../actions'
import { QuoteUpsertInput } from '@sibyl/shared'

interface Props { params: { id: string } }

export default async function QuoteEditPage({ params }: Props) {
    const { id } = params
    const quote = await getMyQuote(id)

    const defaults: QuoteUpsertInput = {
        amount: quote.amount,
        expectedDays: quote.expectedDays,
        note: quote.note ?? '',
        caseId: quote.caseId,
    }

    async function onSubmit(data: QuoteUpsertInput) {
        'use server'
        await upsertQuote(data)
    }

    return (
        <QuoteForm defaultValue={defaults} onSubmit={onSubmit} />
    )
}
