import { CookieKey } from "@/lib/cookie"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function HomePage() {
    const token = (await cookies()).get(CookieKey.AUTH_TOKEN)?.value

    if (token) {
        const role = (await cookies().get(CookieKey.USER_ROLE))?.value
        redirect(`/dashboard/${role?.toLowerCase()}`)
    }

    return (
        <>

        </>
    )
}