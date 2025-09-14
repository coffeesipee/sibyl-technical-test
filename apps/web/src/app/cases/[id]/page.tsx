import { acceptQuote, getCase } from "./actions"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import dayjs from "dayjs"
import CaseFileList from "@/components/case/CaseFileList"
import { cookies } from "next/headers"
import { CookieKey } from "@/lib/cookie"
import { CaseStatus, QuoteStatus, UserRole } from "@sibyl/shared"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import QuoteCardItem from "@/components/quote/QuoteCardItem"

interface Props {
    params: Promise<{ id: string }>
}

export default async function CasePage({ params }: Props) {
    const { id } = await params
    const data = await getCase(id as string)
    const role = (await cookies()).get(CookieKey.USER_ROLE)?.value
    const isLawyer = role === UserRole.LAWYER

    return (
        <div className="mt-10 space-y-4 px-4">
            {data.status === CaseStatus.Values.open && isLawyer && (
                <div className="flex justify-end">
                    <Link href={`/dashboard/lawyer/quotes/new/${id}`}>
                        <Button size={'sm'} variant={'link'}>
                            New Quote
                        </Button>
                    </Link>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>
                        {data?.title}
                    </CardTitle>
                    <CardDescription className="flex justify-between">
                        <span>{data?.category ? String(data.category).toUpperCase() : 'Unknown'}</span>
                        <span>{dayjs(data?.createdAt).format('YYYY-MM-DD HH:mm:ss')}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{data?.description}</p>
                </CardContent>
                <CardFooter>
                    <Badge className="px-2 py-1" variant="default">{String(data?.status).toUpperCase()}</Badge>
                </CardFooter>
            </Card>


            {data?.files?.length && (
                <Card>
                    <CardHeader>
                        <CardTitle>Files</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CaseFileList files={data.files} />
                    </CardContent>
                </Card>
            )}

            {data?.quotes?.length && (
                <Card>
                    <CardHeader>
                        <CardTitle>Quotes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.quotes.map((quote: any) => (
                            <QuoteCardItem key={quote.id}
                                amount={quote.amount}
                                expectedDays={quote.expectedDays}
                                note={quote.note}
                                caseTitle={''}
                                caseCategory={""}
                                caseDescription={''}
                                status={data.status}
                                quoteId={quote.id}
                                isAcceptable={quote.status === QuoteStatus.Values.proposed}
                            />
                        ))}
                    </CardContent>
                </Card>
            )}

        </div>
    )
}