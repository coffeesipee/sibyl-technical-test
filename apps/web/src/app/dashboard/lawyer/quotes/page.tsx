'use client'

import { usePagination } from "@/hooks/usePagination"
import { useQuery } from "@tanstack/react-query"
import { getMyQuotes } from "./actions"
import QuoteCardItem from "@/components/quote/QuoteCardItem"
import { QuoteStatus } from '@sibyl/shared'
import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select"

const QuoteStatusArray = QuoteStatus.options
export default function QuotesPage() {
  const router = useRouter()
  const { page, pageSize } = usePagination()
  const searchParams = useSearchParams()
  const status = searchParams.get('status')
  const { data } = useQuery({
    queryKey: ['lawyer-quotes', page, pageSize, status],
    queryFn: () => getMyQuotes(page, pageSize, status || undefined),
  })

  const handleStatusChange = (value: string) => {
    const url = new URL(window.location.href)
    if (value) url.searchParams.set('status', value)
    else url.searchParams.delete('status')
    router.push(url.href)
  }

  return (
    <div className="px-4 py-2">
      <div className="flex justify-end mb-4">
        <div className="w-48">
          <Select onValueChange={(value) => {
            handleStatusChange(value)
          }} value={status || 'all'}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {QuoteStatusArray.map((s: string) => <SelectItem key={s} value={s}>{s.toUpperCase()}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {data?.items?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 space-x-3">
          {data?.items?.map((item: any) =>
            <QuoteCardItem
              key={item.id}
              amount={item.amount}
              expectedDays={item.expectedDays}
              note={item.note}
              caseTitle={item.case.title}
              caseCategory={item.case.category}
              status={item.status}
              quoteId={item.id}
              canEdit={true}
            />)}
        </div>
      ) : <div>No quotes found</div>}
    </div>
  )
}
