'use client'

import { getFileDownloadUrl } from "@/app/cases/[id]/file-actions"
import { formatFileSize } from "@/lib/utils"
import { useCallback } from "react"
import { FileIcon } from "../ui/file-icon"
import { Button } from "../ui/button"
import { Download } from "lucide-react"

interface Props {
    files: any[]
}

export default function CaseFileList({ files }: Props) {
    const downloadFile = useCallback(async (fileId: string) => {
        const { url } = await getFileDownloadUrl(fileId)
        window.open(url, '_blank')
    }, [])

    return (
        <div className="space-y-2">
            {files.map((file: any) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-secondary">
                            <FileIcon mimeType={file.mimetype || ''} />
                        </div>
                        <div>
                            <p className="font-medium text-sm">{file.originalName}</p>
                            <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => downloadFile(file.id)}
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            ))}
        </div>
    )
}
