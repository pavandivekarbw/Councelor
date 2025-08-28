import axios from "axios";

export interface LoginRequest {
    password: string;
    authenticationType: string;
    samlToken: string;
    username: string;
}

export interface LoginResponse {
    authorizationToken: string;
    memberId: string;
    nhId: number;
    readOnlyUser: boolean;
    userId: number;
    userName: string;
}

// const API_BASE_URL =
//     process.env.NODE_ENV === "production"
//         ? process.env.REST_URL
//         : process.env.LOCAL_URL; // Replace with your API base URL // Replace with your API base URL

const API_BASE_URL =
    import.meta.env.MODE === "production"
        ? import.meta.env.VITE_REST_URL
        : import.meta.env.VITE_LOCAL_URL;

export const loginAPI = async (
    credentials: LoginRequest
): Promise<LoginResponse> => {
    try {
        const response = await axios.post<LoginResponse>(
            `${API_BASE_URL}/authentication`,
            credentials,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        if (!response.status) {
            throw new Error("Login failed");
        }
        const data: LoginResponse = response.data;
        // Store token in local storage or secure cookie
        localStorage.setItem("token", data.authorizationToken);
        localStorage.setItem("userId", data.userId.toString());
        return data;
    } catch (error: unknown) {
        console.error("Login error:", error);
        if (
            axios.isAxiosError(error) &&
            error.response &&
            error.response.data
        ) {
            // Try to extract message from response data
            const message =
                typeof error.response.data === "string"
                    ? error.response.data
                    : error.response.data[0]?.error || "Login failed";
            throw new Error(message);
        } else if (error instanceof Error) {
            throw new Error(error.message);
        } else {
            throw new Error("An unknown error occurred");
        }
    }
};

export const logout = () => {
    localStorage.removeItem("token");
};

export const getToken = (): string | null => {
    return localStorage.getItem("token");
};
