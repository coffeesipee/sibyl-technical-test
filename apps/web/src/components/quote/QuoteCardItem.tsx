'use client'

import { acceptQuote } from "@/app/cases/[id]/actions"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { useRouter } from "next/navigation"

export default function QuoteCardItem({
    quoteId,
    amount,
    expectedDays,
    note,
    caseTitle,
    caseCategory,
    status,
    isAcceptable,
    canEdit = false
}: {
    quoteId?: string
    amount: number,
    expectedDays: number,
    note?: string,
    caseTitle?: string,
    caseCategory?: string,
    caseDescription?: string,
    status: string,
    isAcceptable?: boolean,
    canEdit?: boolean
}) {
    const router = useRouter()

    return <>
        <Card onClick={() => {
            if (quoteId) router.push(`/dashboard/lawyer/quotes/${quoteId}`)
        }}>
            <CardHeader>
                <CardTitle className="flex justify-between">
                    {caseTitle}
                    <Badge>{status}</Badge>
                </CardTitle>
                <CardDescription>{caseCategory}</CardDescription>
            </CardHeader>
            <CardContent>
                <div>
                    <span>Amount:</span>
                    <span>{amount}</span>
                </div>
                <div>
                    <span>Expected Days:</span>
                    <span>{expectedDays}</span>
                </div>
                {note && <div>{note}</div>}
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
                {canEdit && quoteId && (
                    <Link href={`/dashboard/lawyer/quotes/${quoteId}`} className="text-sm underline">Edit</Link>
                )}
                {isAcceptable && quoteId && (
                    <Button size={'sm'} variant={'link'} onClick={async () => {
                        const res = await acceptQuote(quoteId)
                        window.open(res.session.url, '_blank')
                    }}>Accept</Button>
                )}
            </CardFooter>
        </Card>
    </>
}
