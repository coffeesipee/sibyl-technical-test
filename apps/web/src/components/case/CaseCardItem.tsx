'use client'

import dayjs from "dayjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

interface Props {
    id: string
    title: string
    description: string
    category: string
    updatedAt: string
    status: string
    quotesCount?: number
    onClick: () => void
}

export default function CaseCardItem(props: Props) {
    const { title, updatedAt, description, onClick, quotesCount } = props
    return (
        <Card onClick={onClick}>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>{title}</span>
                    {typeof quotesCount === 'number' && (
                        <span className="text-sm font-normal text-muted-foreground">{quotesCount} quotes</span>
                    )}
                </CardTitle>
                <CardDescription>
                    Last Updated At: {dayjs(updatedAt).format('YYYY-MM-DD HH:mm:ss')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>{description}</p>
            </CardContent>
        </Card>
    )
}