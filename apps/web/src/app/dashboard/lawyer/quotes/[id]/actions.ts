'use server'

import { api } from '@/lib/api'
import { CookieKey } from '@/lib/cookie'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { QuoteUpsertInput } from '@sibyl/shared'

export async function getMyQuote(quoteId: string) {
  const token = (await cookies()).get(CookieKey.AUTH_TOKEN)
  if (!token) redirect('/auth/login')
  const { data } = await api.get(`/quotes/${quoteId}`, { headers: { Authorization: `Bearer ${token.value}` } })
  return data
}

export async function upsertQuote(input: QuoteUpsertInput) {
  const token = (await cookies()).get(CookieKey.AUTH_TOKEN)
  if (!token) redirect('/auth/login')
  const { caseId, ...rest } = input
  const { data } = await api.post(`/quotes/${caseId}`, rest, { headers: { Authorization: `Bearer ${token.value}` } })
  return data
}
