import axios from "axios";
import type { AxiosResponse } from "axios";
interface FeedItems {
    documentId: number;
    documentName: string;
    documentSource: string;
    documentCreatedOn: string;
    source: string;
}
interface FeedResoponse {
    data: FeedItems[];
    page: number;
    pageSize: number;
    summary: object;
    totalPages: number;
    totalRecords: number;
    error?: string;
}

interface DocumentItem {
    documentId: number;
    documentName: string;
    documentLocation: string;
    documentStream: string;
    error?: string;
}

// const API_BASE_URL =
//     process.env.NODE_ENV === "production"
//         ? process.env.REST_URL
//         : process.env.LOCAL_URL; // Replace with your API base URL // Replace with your API base URL

const API_BASE_URL =
    import.meta.env.MODE === "production"
        ? import.meta.env.VITE_REST_URL
        : import.meta.env.VITE_LOCAL_URL;

export const getFeeds = async (
    pageNo: number,
    pageSize: number
): Promise<FeedResoponse> => {
    try {
        const response: AxiosResponse<FeedResoponse> = await axios.get(
            `${API_BASE_URL}/feed?pageNo=${pageNo}&pageSize=${pageSize}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `basic:${localStorage.getItem("token")}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching feeds:", error);
        // throw error;
        return {
            data: [],
            page: 0,
            pageSize: 0,
            summary: {},
            totalPages: 0,
            totalRecords: 0,
            error: "Failed to fetch feeds",
        };
    }
};

export const getDocument = async (id: number): Promise<DocumentItem> => {
    try {
        const response: AxiosResponse<DocumentItem> = await axios.get(
            `${API_BASE_URL}/document/details/${id}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `basic:${localStorage.getItem("token")}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching feeds:", error);
        // throw error;
        return {
            documentId: 0,
            documentName: "",
            documentLocation: "",
            documentStream: "",
            error: "Failed to fetch feeds",
        };
    }
};

export const getDocumentData = async (location: string): Promise<unknown> => {
    try {
        const response: AxiosResponse<unknown> = await axios.get(`${location}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching document data:", error);
        throw error;
    }
};

export const uploadFiles = async (
    formData: FormData
): Promise<{ success: boolean; message: string }> => {
    try {
        const response: AxiosResponse<{ success: boolean; message: string }> =
            await axios.post(`${API_BASE_URL}/document/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `basic:${localStorage.getItem("token")}`,
                },
            });
        return response.data;
    } catch (error) {
        console.error("Error uploading files:", error);
        return {
            success: false,
            message: "Failed to upload files",
        };
    }
};

export const fetchTextFile = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Failed to load text file");
        }
        return await response.text();
    } catch (error) {
        console.error("Error fetching text file:", error);
        throw error;
    }
};
