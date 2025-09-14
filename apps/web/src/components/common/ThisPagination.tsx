import Link from "next/link";
import { Pagination, PaginationContent, PaginationItem } from "../ui/pagination";
import { useMemo } from "react";

export default function ThisPagination({ total, page, pageSize, totalPages, hasNext, hasPrev }: { total: number, page: number, pageSize: number, totalPages: number, hasNext: boolean, hasPrev: boolean }) {
    const wholePage = useMemo(() => Array.from({ length: totalPages }), [totalPages])
    return (
        <>
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <Link
                            className="text-gray-600 hover:text-gray-800"
                            href={`?page=${page - 1}&pageSize=${pageSize}`}
                        >
                            Previous
                        </Link>
                    </PaginationItem>
                    {wholePage.map((_, i) => (
                        <PaginationItem key={i}>
                            <Link
                                className="text-gray-600 hover:text-gray-800"
                                href={`?page=${i + 1}&pageSize=${pageSize}`}
                            >
                                {i + 1}
                            </Link>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <Link
                            className="text-gray-600 hover:text-gray-800"
                            href={`?page=${page + 1}&pageSize=${pageSize}`}
                        >
                            Next
                        </Link>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </>
    )
}