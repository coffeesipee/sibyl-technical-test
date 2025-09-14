'use client'

import z from "zod"
import { Form } from "./ui/form"
import { useForm } from "react-hook-form"
import { QuoteUpsertInput, QuoteUpsertSchema } from "@sibyl/shared"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"


interface Props {
    defaultValue?: QuoteUpsertInput
    onSubmit: (data: QuoteUpsertInput) => Promise<void>
}

export default function QuoteForm({ defaultValue, onSubmit }: Props) {
    const router = useRouter()
    const form = useForm({
        resolver: zodResolver(QuoteUpsertSchema),
        defaultValues: defaultValue ?? {}
    })

    const handleSubmit = async (data: QuoteUpsertInput) => {
        try {
            // Ensure defaults applied for optional fields (e.g., note)
            await onSubmit({ ...data, note: data.note ?? '' })
            toast.success('Quote created successfully!')
            router.push(`/cases/${data.caseId}`)
        } catch (error) {
            toast.error('Failed to create quote')
        }
    }

    return <div className="px-4">
        <div className="flex justify-between items-center px-4 py-2 ">
            <h1 className="text-xl font-bold tracking-tight">New Quote</h1>
        </div>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                {/* Hidden field to include caseId in submission */}
                <FormField
                    name="caseId"
                    control={form.control as any}
                    render={({ field }) => (
                        <input type="hidden" {...field} />
                    )}
                />
                <FormField
                    name="amount"
                    control={form.control as any}
                    render={({ field }) => (
                        <FormItem>
                            <Label htmlFor="amount">Amount</Label>
                            <Input id="amount" onChange={(e) => field.onChange(Number(e.target.value))} type="number" />
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    name='expectedDays'
                    control={form.control as any}
                    render={({ field }) => (
                        <FormItem>
                            <Label htmlFor="expectedDays">Expected Days</Label>
                            <Input id="expectedDays" onChange={(e) => field.onChange(Number(e.target.value))} type="number" />
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    name="note"
                    control={form.control as any}
                    render={({ field }) => (
                        <FormItem>
                            <Label htmlFor="note">Note</Label>
                            <Textarea id="note" {...field} />
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="mt-4">
                    <Button type="submit">Create Quote</Button>
                </div>
            </form>
        </Form>
    </div>
}
