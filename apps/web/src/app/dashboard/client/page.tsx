'use client'

import { useSearchParams } from "next/navigation"
import { getMyCases } from "./actions"
import { useQuery } from "@tanstack/react-query"
import CaseCardItem from "@/components/case/CaseCardItem"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import ThisPagination from "@/components/common/ThisPagination"

export default function ClientDashboard() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const page = Number(searchParams.get('page')) < 1 ? 1 : Number(searchParams.get('page'))
    const pageSize = Number(searchParams.get('pageSize')) < 1 ? 20 : Number(searchParams.get('pageSize'))
    const { data } = useQuery({
        queryKey: ['my-cases', page, pageSize],
        queryFn: () => getMyCases(page, pageSize),
    })

    return (
        <>
            <div className="flex justify-between items-center px-4 py-2 ">
                <h1 className="text-xl font-bold tracking-tight">My Cases</h1>
                <Button size='sm' onClick={() => router.push('/cases/new')}>
                    New Case
                </Button>
            </div>

            {
                data?.items?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 space-x-3 px-4 py-2">
                        {data?.items?.map((item: any) => (
                            <CaseCardItem
                                key={item.id}
                                {...item}
                                quotesCount={item._count?.quotes}
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
        </>
    )
}
