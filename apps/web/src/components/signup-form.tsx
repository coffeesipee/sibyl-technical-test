'use client'

import Image from "next/image"
import { Card, CardContent } from "./ui/card"
import { cn } from "@/utils/cn"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormMessage } from "./ui/form"
import { SignupClientSchema, SignupLawyerSchema } from "@sibyl/shared"
import { z } from "zod"
import ClientForm from "./signup-forms/Client"
import LawyerForm from "./signup-forms/Lawyer"
import { signupClientAction, signUpRequest } from "@/app/auth/signup/[role]/actions"

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    error?: string
    role: string

}

export default function SignupForm({ error, role, className, ...props }: Props) {
    const handleSubmitClient = (data: { name?: string, email: string, password: string }) => {
        signUpRequest("client", data)
    }

    const handleSubmitLawyer = (data: { name?: string, email: string, password: string, jurisdiction?: string, barNumber?: string }) => {
        signUpRequest("lawyer", data)
    }

    return (
        <div>
            <div className={cn("flex flex-col gap-6", className)} {...props}>
                <Card className="overflow-hidden">
                    <CardContent className="grid p-0 md:grid-cols-2">
                        {role === "client" ? <ClientForm onSubmit={handleSubmitClient} /> : <LawyerForm onSubmit={handleSubmitLawyer} />}

                        <div className="relative hidden bg-muted md:block">
                            <Image
                                src="https://regalsprings.co.id/wp-content/uploads/2023/05/danau-toba-1024x682.jpg"
                                alt="Image"
                                className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                                width={1024}
                                height={682}
                            />
                        </div>
                        {/* </div> */}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
