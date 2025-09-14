'use client'
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { CaseCreateSchema, CaseCategory, CaseCreateInput } from "@sibyl/shared"
import { useForm } from "react-hook-form"
import { useMemo, useState, useRef, ChangeEvent, useEffect } from "react"
import { FileText, FileImage, File, X, Loader2 } from "lucide-react"
import { uploadFiles } from "@/lib/upload"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Props {
    createCase(data: CaseCreateInput): Promise<Record<string, any>>
    token: string
}

export default function CaseForm({ createCase, token }: Props) {
    const router = useRouter()
    const categories = useMemo(() => Object.values(CaseCategory.Values), [])
    const [files, setFiles] = useState<File[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const form = useForm({
        defaultValues: {
            title: '',
            description: '',
            category: CaseCategory.Values.contract, // set default value
        },
        resolver: zodResolver(CaseCreateSchema)
    })

    const onSubmit = async (data: CaseCreateInput) => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        setUploadProgress(0);

        try {
            // 1. Create the case first
            const result = await createCase(data);

            if (!result.success) {
                throw new Error(result.error || 'Failed to create case');
            }

            // 2. Upload files if any (client-side)
            if (files.length > 0) {
                setUploadProgress(30);
                const uploadResult = await uploadFiles(result.caseId, files, token);
                if (!uploadResult?.success) {
                    throw new Error('Failed to upload files');
                }
                setUploadProgress(100);
            }

            // 3. Redirect to the new case
            toast.success('Case created successfully!');
            router.push(`/client/cases/${result.caseId}`);

        } catch (error) {
            console.error('Error:', error);
            toast.error(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            setFiles(prev => [...prev, ...newFiles].slice(0, 10)) // Limit to 10 files
        }
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    const getFileIcon = (file: File) => {
        const type = file.type.split('/')[0]
        switch (type) {
            case 'image':
                return <FileImage className="h-4 w-4" />
            case 'application':
                return <FileText className="h-4 w-4" />
            default:
                return <File className="h-4 w-4" />
        }
    }

    return (
        <>
            <div className="flex justify-between items-center px-4 py-2 ">
                <h1 className="text-xl font-bold tracking-tight">New Case</h1>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 space-x-3 px-4 py-2">
                        <FormField
                            name="title"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id='title'
                                        {...field}
                                        required
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name="description"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id='description'
                                        {...field}
                                        required
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name="category"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category.toUpperCase()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="col-span-full space-y-4">
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Add Files
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept="image/*,.pdf,.doc,.docx,.txt"
                                />
                                <p className="text-sm text-muted-foreground">
                                    {files.length} file(s) selected
                                </p>
                            </div>

                            {files.length > 0 && (
                                <div className="space-y-2">
                                    {files.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                                            <div className="flex items-center gap-2">
                                                {getFileIcon(file)}
                                                <div className="text-sm">
                                                    <p className="font-medium">{file.name}</p>
                                                    <p className="text-muted-foreground text-xs">
                                                        {(file.size / 1024).toFixed(1)} KB
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => removeFile(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="col-span-full">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {uploadProgress > 0 && uploadProgress < 100 ?
                                            `Uploading (${Math.round(uploadProgress)}%)` :
                                            'Creating Case...'}
                                    </>
                                ) : (
                                    'Create Case'
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </>
    )
}
