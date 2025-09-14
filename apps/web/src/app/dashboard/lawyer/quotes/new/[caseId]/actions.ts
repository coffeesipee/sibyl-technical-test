'use server'

import { QuoteUpsertInput } from "@sibyl/shared"
import { cookies } from "next/headers"
import { CookieKey } from "@/lib/cookie"
import { redirect } from "next/navigation"
import { api } from "@/lib/api"

export const createQuote = async (payload: QuoteUpsertInput) => {
    const token = await cookies().get(CookieKey.AUTH_TOKEN)?.value
    if (!token) redirect('/auth/login?error=unauthorized')

    const { data } = await api.post(
        `/quotes/${payload.caseId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
    )

    return data
}
