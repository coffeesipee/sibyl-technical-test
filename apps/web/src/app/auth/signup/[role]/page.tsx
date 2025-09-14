import SignupForm from "@/components/signup-form";

interface Props {
    params: Promise<{
        role: string
    }>
    searchParams: Promise<{
        error?: string
    }>
}

export default async function SignupPage({ params, searchParams }: Props) {
    const { role } = await params
    const { error } = await searchParams

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-3xl">
                <SignupForm error={error} role={role} />
            </div>
        </div>
    )
}