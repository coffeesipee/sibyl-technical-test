'use server'

import { cookies } from "next/headers"
import { CookieKey } from "@/lib/cookie"
import { api } from "@/lib/api"
import { redirect } from "next/navigation"

export const getMyQuotes = async (page: number, pageSize: number, status?: string) => {
    const token = (await cookies()).get(CookieKey.AUTH_TOKEN)
    if (!token) redirect('/auth/login')

    const { data } = await api.get('/quotes/my', { params: { page, pageSize, status }, headers: { Authorization: `Bearer ${token.value}` } })

    return data
}   
