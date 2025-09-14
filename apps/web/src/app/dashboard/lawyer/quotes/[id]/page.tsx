import Link from 'next/link'
import { getMyQuote } from './actions'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface Props { params: { id: string } }

export default async function QuoteDetailPage({ params }: Props) {
  const { id } = params
  const quote = await getMyQuote(id)
  const CaseFileList = dynamic(() => import('@/components/case/CaseFileList'), { ssr: false })

  return (
    <div className="px-4 py-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Quote Detail</CardTitle>
            <CardDescription>Review your quote information</CardDescription>
          </div>
          <Link href={`/dashboard/lawyer/quotes/${id}/edit`} className="text-sm underline">Edit</Link>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium">{quote.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-medium">{quote.amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Expected Days</span>
            <span className="font-medium">{quote.expectedDays}</span>
          </div>
          {quote.note && (
            <div>
              <div className="text-muted-foreground mb-1">Note</div>
              <div className="whitespace-pre-wrap">{quote.note}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {quote.case && (
        <Card>
          <CardHeader>
            <CardTitle>Case</CardTitle>
            <CardDescription>Context for this quote</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Title</span>
                <span className="font-medium">{quote.case.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{quote.case.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">{quote.case.status}</span>
              </div>
            </div>

            {quote.status === 'accepted' && Array.isArray(quote.case.files) && quote.case.files.length > 0 && (
              <div className="mt-6">
                <div className="font-semibold mb-2">Files</div>
                {/* Adapt API field `mime` to component expectation `mimetype` */}
                <CaseFileList files={quote.case.files.map((f: any) => ({ ...f, mimetype: f.mime }))} />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
