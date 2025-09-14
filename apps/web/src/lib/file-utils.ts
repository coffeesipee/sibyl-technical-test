export const downloadFile = async (getDownloadUrl: () => Promise<string>, fileName: string) => {
    try {
        // Get the presigned URL from the server
        const downloadUrl = await getDownloadUrl()
        
        // Create a temporary anchor element to trigger the download
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = fileName
        a.rel = 'noopener noreferrer'
        a.target = '_blank'
        
        // Trigger the download
        document.body.appendChild(a)
        a.click()
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a)
            window.URL.revokeObjectURL(downloadUrl)
        }, 100)
    } catch (error) {
        console.error('Download error:', error)
        throw error
    }
}
