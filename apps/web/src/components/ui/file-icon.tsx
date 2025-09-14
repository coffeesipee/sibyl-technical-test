import { FileText, FileImage, File } from "lucide-react"

interface FileIconProps {
  mimeType: string
  className?: string
}

export const FileIcon = ({ mimeType, className = "h-5 w-5" }: FileIconProps) => {
  const type = mimeType.split('/')[0]
  
  switch (type) {
    case 'image':
      return <FileImage className={className} />
    case 'application':
      if (mimeType.includes('pdf')) {
        return <FileText className={`${className} text-red-500`} />
      }
      if (mimeType.includes('word') || mimeType.includes('document')) {
        return <FileText className={`${className} text-blue-600`} />
      }
      return <FileText className={className} />
    default:
      return <File className={className} />
  }
}
