'use client'

import { useRouter, useSearchParams } from "next/navigation"
import { getCases } from "./actions"
import { useQuery } from "@tanstack/react-query"
import CaseCardItem from "@/components/case/CaseCardItem"
import ThisPagination from "@/components/common/ThisPagination"
import { usePagination } from "@/hooks/usePagination"

export default function LawyerDashboard() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { page, pageSize } = usePagination()
    const created_since = searchParams.get('created_since') || ''

    const { data } = useQuery({
        queryKey: ['marketplace-cases', page, pageSize, created_since],
        queryFn: () => getCases(page, pageSize, created_since || undefined),
    })


    return (
        <div>
            <div className="flex justify-between items-center px-4 py-2 ">
                <h1 className="text-xl font-bold tracking-tight">Marketplace Cases</h1>
                <div className="flex items-center space-x-2">
                    <label htmlFor="created_since" className="text-sm">Created since</label>
                    <input
                        id="created_since"
                        type="date"
                        className="border rounded px-2 py-1 text-sm"
                        value={created_since}
                        onChange={(e) => {
                            const url = new URL(window.location.href)
                            if (e.target.value) url.searchParams.set('created_since', e.target.value)
                            else url.searchParams.delete('created_since')
                            router.push(url.href)
                        }}
                    />
                </div>
            </div>

            {
                data?.items?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 space-x-3 px-4 py-2">
                        {data?.items?.map((item: any) => (
                            <CaseCardItem
                                key={item.id}
                                {...item}
                                onClick={() => router.push(`/cases/${item.id}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="px-4 py-2 text-center">
                        No cases found
                    </div>
                )
            }

            {
                data?.meta?.total > 0 && (
                    <ThisPagination
                        total={data?.meta?.total}
                        page={page}
                        pageSize={pageSize}
                        totalPages={data?.meta?.totalPages}
                        hasNext={data?.meta?.hasNext}
                        hasPrev={data?.meta?.hasPrev}
                    />
                )
            }
        </div>
    )
}