'use client'

import { useForm } from "react-hook-form"
import { Form, FormField, FormItem, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { zodResolver } from "@hookform/resolvers/zod"
import { SignupLawyerSchema } from "@sibyl/shared"
import { Button } from "../ui/button"
import Link from "next/link"

interface Props {
    onSubmit: (data: { name?: string, email: string, password: string, jurisdiction?: string, barNumber?: string }) => void
}

export default function LawyerForm({ onSubmit }: Props) {
    const form = useForm({
        resolver: zodResolver(SignupLawyerSchema),
        defaultValues: {
            email: '',
            password: '',
            name: '',
            jurisdiction: '',
            barNumber: '',
        },
    })

    return (
        <div className="flex flex-col">
            <div className="flex flex-col items-center text-center mt-5">
                <h1 className="text-2xl font-bold">Sign up</h1>
                <p className="text-balance text-muted-foreground">
                    Sign up as lawyer
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 p-6 md:p-8">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                        {...field}
                                    />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        {...field}
                                    />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="John Doe"
                                        {...field}
                                    />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="jurisdiction"
                        render={({ field }) => (
                            <FormItem>
                                <div className="grid gap-2">
                                    <Label htmlFor="jurisdiction">Jurisdiction</Label>
                                    <Input
                                        id="jurisdiction"
                                        type="text"
                                        placeholder="Jurisdiction"
                                        {...field}
                                    />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="barNumber"
                        render={({ field }) => (
                            <FormItem>
                                <div className="grid gap-2">
                                    <Label htmlFor="barNumber">Bar Number</Label>
                                    <Input
                                        id="barNumber"
                                        type="text"
                                        placeholder="Bar Number"
                                        {...field}
                                    />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full">Sign up</Button>
                    <div className="text-center text-sm text-muted-foreground mb-5">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="underline underline-offset-4">
                            Login
                        </Link>
                    </div>
                </form>
            </Form>

        </div>
    )
}
