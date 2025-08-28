import axios from "axios";
import type { AxiosResponse } from "axios";
import type { FlowItem } from "../models/Flow";

const API_BASE_URL =
    import.meta.env.MODE === "production"
        ? import.meta.env.VITE_REST_URL
        : import.meta.env.VITE_LOCAL_URL;

export const fetchFlow = async (
    documentList: number[]
): Promise<FlowItem[]> => {
    const response: AxiosResponse<FlowItem[]> = await axios.post(
        `${API_BASE_URL}/aiFlow`,
        { documentList },
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `basic:${localStorage.getItem("token")}`,
            },
        }
    );

    if (!response || response.status !== 200) {
        throw new Error(
            `Flow API request failed with status ${response.status}`
        );
    }

    return response.data;
};
