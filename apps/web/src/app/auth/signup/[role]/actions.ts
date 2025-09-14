'use server'

import { api } from "@/lib/api"
import { ErrorCode } from "@/lib/errorbanks"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { isAxiosError } from "axios"
import { CookieKey } from "@/lib/cookie"

export async function signupClientAction(data: Record<string, any>) {
    signUpRequest("client", data)
}

export const signUpRequest = async (
    role: string,
    data: Record<string, any>
) => {
    let redirectPath = ''
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
        const res = await api.post<{ token: string }>(`${apiUrl}/api/auth/signup/${role}`, data)

        const { token } = res.data
        if (!token) throw new Error(ErrorCode.INVALID_RESPONSE)

        const isProd = process.env.NODE_ENV === "production"
        cookies().set(CookieKey.AUTH_TOKEN, token, {
            httpOnly: true,
            secure: isProd,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        })

        redirectPath = `/dashboard/${role}`
    } catch (error) {
        if (isAxiosError(error)) {
            if (error.response?.status !== 200) {
                redirectPath = `/auth/signup/${role}?error=${ErrorCode.INVALID_RESPONSE}`
            }
        } else {
            redirectPath = `/auth/signup/${role}?error=${(error as Error).message}`
        }
    } finally {
        redirect(redirectPath)
    }
}