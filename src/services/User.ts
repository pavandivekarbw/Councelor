import axios from "axios";
import type { AxiosResponse } from "axios";

interface UpdateUserRequest {
    companyName: string;
    contactNumber: string;
    externalUserId: number | null;
    firstName: string;
    lastName: string;
    userEmail: string;
    userId: number | null;
}

interface UpdateUserResponse {
    success: boolean;
    message: string;
    data?: {
        id: string;
        name: string;
        email: string;
        phone: string;
    };
}

// const API_BASE_URL =
//     process.env.NODE_ENV === "production"
//         ? process.env.REST_URL
//         : process.env.LOCAL_URL; // Replace with your API base URL // Replace with your API base URL

const API_BASE_URL =
    import.meta.env.MODE === "production"
        ? import.meta.env.VITE_REST_URL
        : import.meta.env.VITE_LOCAL_URL;

export const updateUser = async (
    userData: UpdateUserRequest
): Promise<UpdateUserResponse> => {
    try {
        const response: AxiosResponse<UpdateUserResponse> = await axios.put(
            `${API_BASE_URL}/user`,
            userData,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `basic:${localStorage.getItem("token")}`,
                },
            }
        );
        return response.data;
    } catch (error: unknown) {
        console.error("Error updating user:", error);
        throw new Error("Failed to update user information");
    }
};

export const getUserData = async (userId: number): Promise<unknown> => {
    try {
        const response: AxiosResponse<unknown> = await axios.get(
            `${API_BASE_URL}/users/${userId}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `basic:${localStorage.getItem("token")}`,
                },
            }
        );
        return response.data;
    } catch (error: unknown) {
        console.error("Error updating user:", error);
        throw new Error("Failed to update user information");
    }
};
interface authenticateOutlookResponse {
    redirectUrl: string;
}
export const authenticateOutlook =
    async (): Promise<authenticateOutlookResponse> => {
        try {
            const response: AxiosResponse<authenticateOutlookResponse> =
                await axios.post(
                    `${API_BASE_URL}/outlookIntegration/authentication/outlook`,
                    {},
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `basic:${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }
                );
            return response.data;
        } catch (error: unknown) {
            console.error("Error fetching user profile:", error);
            throw new Error("Failed to fetch user profile");
        }
    };
interface authenticateTeamsResponse {
    redirectUrl: string;
}
export const authenticateTeams =
    async (): Promise<authenticateTeamsResponse> => {
        try {
            const response: AxiosResponse<authenticateTeamsResponse> =
                await axios.post(
                    `${API_BASE_URL}/outlookIntegration/authentication/teams`,
                    {},
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `basic:${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }
                );
            return response.data;
        } catch (error: unknown) {
            console.error("Error fetching user profile:", error);
            throw new Error("Failed to fetch user profile");
        }
    };

interface DisconnectOutlookResponse {
    success: boolean;
    message: string;
}
export const disconnectOutlook =
    async (): Promise<DisconnectOutlookResponse> => {
        try {
            const response: AxiosResponse<DisconnectOutlookResponse> =
                await axios.delete(`${API_BASE_URL}/integration/outlook`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `basic:${localStorage.getItem("token")}`,
                    },
                });
            if (response.status === 200) {
                return {
                    success: true,
                    message: "Outlook integration disconnected successfully",
                };
            } else
                return {
                    success: false,
                    message: "Failed to disconnect Outlook integration",
                };
        } catch (error: unknown) {
            console.error("Error fetching user profile:", error);
            throw new Error("Failed to fetch user profile");
        }
    };

interface DisconnectTeamsResponse {
    success: boolean;
    message: string;
}
export const disconnectTeams = async (): Promise<DisconnectTeamsResponse> => {
    try {
        const response: AxiosResponse<DisconnectTeamsResponse> =
            await axios.delete(`${API_BASE_URL}/integration/teams`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `basic:${localStorage.getItem("token")}`,
                },
            });
        if (response.status === 200) {
            return {
                success: true,
                message: "Teams integration disconnected successfully",
            };
        } else
            return {
                success: false,
                message: "Failed to disconnect Teams integration",
            };
    } catch (error: unknown) {
        console.error("Error fetching user profile:", error);
        throw new Error("Failed to fetch user profile");
    }
};

interface IntegrationResponse {
    accessToken: string;
    accessTokenExpiration: string;
    accountType: string;
    emailAddress: string;
    isRefreshTokenExpired: boolean;
    lastReadMessageId: string;
    refreshToken: string;
    userId: number;
}
export const getAvailableIntegrations = async (): Promise<
    IntegrationResponse[]
> => {
    try {
        const response: AxiosResponse<IntegrationResponse[]> = await axios.get(
            `${API_BASE_URL}/integration/integrationList`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `basic:${localStorage.getItem("token")}`,
                },
            }
        );
        return response.data;
    } catch (error: unknown) {
        console.error("Error fetching available integrations:", error);
        throw new Error("Failed to fetch available integrations");
    }
};

interface HmailIntegrationResponse {
    mailServerEmailAddress: string;
}
export const getHMailIntegration =
    async (): Promise<HmailIntegrationResponse> => {
        try {
            const response: AxiosResponse<HmailIntegrationResponse> =
                await axios.get(`${API_BASE_URL}/hmailServer/emailAddress`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `basic:${localStorage.getItem("token")}`,
                    },
                });
            return response.data;
        } catch (error: unknown) {
            console.error("Error fetching available integrations:", error);
            throw new Error("Failed to fetch available integrations");
        }
    };

interface IntegrationResponse {
    integrations: string[];
    expiredRefreshTokensIntegrations: string[];
}
export const getOutlookIntegrationList =
    async (): Promise<IntegrationResponse> => {
        try {
            const response: AxiosResponse<IntegrationResponse> =
                await axios.get(
                    `${API_BASE_URL}/integration/outlook/filterList`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `basic:${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }
                );
            return response.data;
        } catch (error: unknown) {
            console.error("Error fetching available integrations:", error);
            throw new Error("Failed to fetch available integrations");
        }
    };
