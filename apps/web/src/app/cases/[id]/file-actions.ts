'use server'

import { cookies } from 'next/headers'
import { CookieKey } from '@/lib/cookie'
import { api } from '@/lib/api'

export const getFileDownloadUrl = async (fileId: string) => {
    const token = cookies().get(CookieKey.AUTH_TOKEN)?.value
    if (!token) {
        throw new Error('Authentication required')
    }

    const response = await api.get(`/files/download/${fileId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })

    return response.data
}
