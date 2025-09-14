import { api } from "./api"

export const uploadFiles = async (caseId: string, files: File[], token: string) => {
    if (!files.length) return;
    
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('files', file);
    });

    try {
        await api.post(`/files/${caseId}/upload`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return { success: true };
    } catch (error) {
        console.error('Error uploading files:', error);
        return { success: false, error };
    }
};
