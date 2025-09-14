"use server"

import { api } from "@/lib/api"
import { isAxiosError } from "axios"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ErrorCode } from "@/lib/errorbanks"
import { CookieKey } from "@/lib/cookie"

export async function loginAction(email: string, password: string) {
    let redirectPath = ''
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
        const res = await api.post<{ token: string, role: string }>(`${apiUrl}/api/auth/login`, {
            email,
            password,
        })

        const { token, role } = res.data
        if (!token || !role) redirectPath = `/auth/login?error=${ErrorCode.INVALID_RESPONSE}`

        const isProd = process.env.NODE_ENV === "production"
        cookies().set(CookieKey.USER_ROLE, role, {
            httpOnly: true,
            secure: isProd,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        })
        cookies().set(CookieKey.AUTH_TOKEN, token, {
            httpOnly: true,
            secure: isProd,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        })

        redirectPath = `/dashboard/${role.toLowerCase()}`
    } catch (error) {
        if (isAxiosError(error)) {
            if (error.response?.status !== 200) {
                redirectPath = `/auth/login?error=${ErrorCode.INVALID_CREDENTIALS}`
            }
        } else {
            redirectPath = `/auth/login?error=${(error as Error).message}`
        }
    } finally {
        redirect(redirectPath)
    }
}

export async function logoutAction() {
    cookies().delete(CookieKey.AUTH_TOKEN)
    cookies().delete(CookieKey.USER_ROLE)
    redirect("/auth/login")
}
