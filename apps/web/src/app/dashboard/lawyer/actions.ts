'use server'

import { cookies } from "next/headers"
import { api } from "@/lib/api"
import { CookieKey } from "@/lib/cookie"
import { redirect } from "next/navigation"

export const getCases = async (page: number, pageSize: number, created_since?: string) => {
    const token = (await cookies()).get(CookieKey.AUTH_TOKEN)
    if (!token) redirect('/auth/login')

    const { data } = await api.get<{ items: any, meta: any }>(
        `/cases/marketplace`,
        { params: { page, pageSize, created_since }, headers: { Authorization: `Bearer ${token.value}` } }
    )

    return data
}
