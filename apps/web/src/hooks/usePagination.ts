'use client'

import { useSearchParams } from "next/navigation"

export const usePagination = () => {
    const searchParams = useSearchParams()
    const page = Number(searchParams.get('page')) < 1 ? 1 : Number(searchParams.get('page'))
    const pageSize = Number(searchParams.get('pageSize')) < 1 ? 20 : Number(searchParams.get('pageSize'))

    return {
        page, pageSize
    }
}