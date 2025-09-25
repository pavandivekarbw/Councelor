import type { Message } from "./Serien";
import { formatTime } from "./time";

export default function MessageBubble({ message }: { message: Message }) {
    const isUser = message.role === "user";
    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div
                className={`px-5 py-3 rounded-2xl max-w-[70%] break-words ${
                    isUser
                        ? "bg-blue-900 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-900 rounded-bl-none"
                }`}
            >
                <div className="whitespace-pre-wrap">{message.text}</div>
                <div
                    className={`text-xs mt-2 ${
                        isUser
                            ? "text-gray-300 text-right"
                            : "text-gray-500 text-left"
                    }`}
                >
                    {formatTime(message.createdAt)}
                </div>
            </div>
        </div>
    );
}
