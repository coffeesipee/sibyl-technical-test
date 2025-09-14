'use server'

import { api } from "@/lib/api"
import { cookies } from "next/headers"
import { CookieKey } from "@/lib/cookie"
import { CaseCreateInput } from "@sibyl/shared"
import { redirect } from "next/navigation"

export const createCase = async (data: CaseCreateInput) => {
    const token = cookies().get(CookieKey.AUTH_TOKEN)?.value
    if (!token) redirect('/auth/login')

    try {
        const res = await api.post('/cases', data, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return {
            success: true,
            caseId: res.data.id as string
        };
    } catch (error) {
        console.error('Error creating case:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create case'
        };
    }
}