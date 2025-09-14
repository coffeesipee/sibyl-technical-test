'use server'

import { api } from "@/lib/api"
import { CookieKey } from "@/lib/cookie"
import { UserRole } from "@sibyl/shared"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const getCase = async (id: string) => {
    const token = cookies().get(CookieKey.AUTH_TOKEN)?.value
    const role = cookies().get(CookieKey.USER_ROLE)?.value
    if (!token || !role) redirect('/auth/login')

    let url = ''
    if (role === UserRole.LAWYER) {
        url = `/cases/marketplace/${id}`
    } else if (role === UserRole.CLIENT) {
        url = `/cases/${id}`
    }

    const { data } = await api.get(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    })

    return data
}

export const acceptQuote = async (id: string) => {
    const token = cookies().get(CookieKey.AUTH_TOKEN)?.value
    if (!token) redirect('/auth/login')

    const { data } = await api.post(`/quotes/${id}/accept`, {}, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    })

    return data
}
