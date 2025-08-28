export interface FlowItem {
    id: string;
    date: string; // ISO 8601 UTC, e.g. 2023-10-27T10:00:00Z
    title: string;
    description: string;
    documentSource: string;
    participants: string[];
    icon: string; // e.g., 'file-plus', 'mail', 'truck', etc.
    status: "completed" | "in_progress" | "issue" | "neutral";
    relatedTo: string[];
}
