import { LoginForm } from "@/components/login-form";

interface Props {
    searchParams: Promise<{
        error?: string
    }>
}

export default async function LoginPage({ searchParams }: Props) {
    const { error } = await searchParams

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-3xl">
                <LoginForm error={error} />
            </div>
        </div>
    )
}
