import axios from "axios";

// const API_BASE_URL =
//     process.env.NODE_ENV === "production"
//         ? process.env.REST_URL
//         : process.env.LOCAL_URL; // Replace with your API base URL // Replace with your API base URL

const API_BASE_URL =
    import.meta.env.MODE === "production"
        ? import.meta.env.VITE_REST_URL
        : import.meta.env.VITE_LOCAL_URL;

export async function fetchWorkspaceSearchResult(
    payload: {
        startDate: string | "";
        endDate: string | "";
        documentType: string | "";
        searchString: string | "";
    },
    isNewSearch: boolean = true,
    pageNo: number = 1,
    pageSize: number = 10
) {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/search?isNewSearch=${isNewSearch}&pageNo=${pageNo}&pageSize=${pageSize}`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `basic:${localStorage.getItem("token")}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching workspace search result:", error);
        throw error;
    }
}

export async function fetchRecentSearches() {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/search/searchRegistries`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `basic:${localStorage.getItem("token")}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching recent searches:", error);
        throw error;
    }
}
