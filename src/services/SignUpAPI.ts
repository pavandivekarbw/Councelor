import axios from "axios";
import type { AxiosResponse } from "axios";
interface RegisterUserRequest {
    firstName: string;
    lastName: string;
    userEmail: string;
    companyName: string;
    departmentName: string;
    contactNumber: string;
    profilePicture: string;
    password: string;
}

interface RegisterUserResponse {
    userId: number;
}

// const API_BASE_URL =
//     process.env.NODE_ENV === "production"
//         ? process.env.REST_URL
//         : process.env.LOCAL_URL; // Replace with your API base URL // Replace with your API base URL

const API_BASE_URL =
    import.meta.env.MODE === "production"
        ? import.meta.env.VITE_REST_URL
        : import.meta.env.VITE_LOCAL_URL;
export const registerUser = async (
    userData: RegisterUserRequest
): Promise<RegisterUserResponse> => {
    try {
        const response: AxiosResponse<RegisterUserResponse> = await axios.post(
            `${API_BASE_URL}/register/registerUser`,
            userData
        );
        return response.data;
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
