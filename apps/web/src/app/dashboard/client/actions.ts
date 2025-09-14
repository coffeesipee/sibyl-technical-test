'use server'

import { api } from "@/lib/api";
import { CookieKey } from "@/lib/cookie";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const getMyCases = async (page: number = 1, pageSize: number = 20) => {
    const token = (await cookies()).get(CookieKey.AUTH_TOKEN)
    if (!token) redirect('/auth/login')

    const { data } = await api.get<{ items: any, meta: any }>(
        `/cases/my`,
        { params: { page, pageSize }, headers: { Authorization: `Bearer ${token.value}` } }
    )

    return data
}
