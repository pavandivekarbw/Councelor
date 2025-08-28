import axios from "axios";
import type { AxiosResponse } from "axios";
// const API_BASE_URL =
//     process.env.NODE_ENV === "production"
//         ? process.env.REST_URL
//         : process.env.LOCAL_URL; // Replace with your API base URL // Replace with your API base URL

const API_BASE_URL =
    import.meta.env.MODE === "production"
        ? import.meta.env.VITE_REST_URL
        : import.meta.env.VITE_LOCAL_URL;
interface LLMAPIRequest {
    documentList: number[];
    history: string;
    question: string;
}

interface ChatMessage {
    id: string;
    sender: string;
    text: string;
}

export const chatAPI = async (payload: LLMAPIRequest): Promise<ChatMessage> => {
    const response: AxiosResponse<{ answer: string }> = await axios.post(
        `${API_BASE_URL}/aiChat`,
        payload,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `basic:${localStorage.getItem("token")}`,
            },
        }
    );

    if (!response || response.status !== 200) {
        throw new Error(
            `LLM API request failed with status ${response.status}`
        );
    }

    return { text: response.data.answer, id: "1", sender: "model" };
};

// interface AnalyzeResponse {
//     summary: string;
//     keyDetails: { key: string; value: object | string }[];
//     sentiment: {
//         label: "Positive" | "Neutral" | "Negative";
//         reasoning: string;
//         confidence?: number;
//         score?: number;
//     };
//     actionableItems: string[];
//     delayIndicators: string[];
//     suggestedQuestions: string[];
// }

interface Candidate {
    content: {
        parts: { text: string }[];
    };
}
interface AnalyzeResponse {
    candidates: Candidate[];
}

export const analyzeFiles = async (documentList: number[]): Promise<string> => {
    const response: AxiosResponse<AnalyzeResponse> = await axios.post(
        `${API_BASE_URL}/aiAnalyze`,
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
            `Analyze API request failed with status ${response.status}`
        );
    }

    if (!response.data || !response.data.candidates) {
        throw new Error("Invalid response format from Analyze API");
    }
    const data = response.data.candidates[0].content.parts[0].text;
    return data;
};
