import React, { useEffect, useRef, useState } from "react";
import type { Message } from "./Serien";
import MessageBubble from "./MessageBubble";
import { Plus, Send } from "lucide-react";

type Props = {
    messages: Message[];
    onSend: (text: string) => void;
    sidebarCollapsed: boolean;
};

export default function ChatWindow({ messages, onSend }: Props) {
    const [input, setInput] = useState("");
    const listRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // auto scroll to bottom when messages change
        listRef.current?.scrollTo({
            top: listRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages]);

    function handleSend() {
        const trimmed = input.trim();
        if (!trimmed) return;
        onSend(trimmed);
        setInput("");
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    return (
        <div className="flex-1 flex flex-col">
            <main
                ref={listRef}
                className="flex-1 overflow-auto p-6 space-y-4"
                role="log"
                aria-live="polite"
            >
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-20">
                        No messages yet — say hi 👋
                    </div>
                )}

                {messages.map((m) => (
                    <MessageBubble key={m.id} message={m} />
                ))}
            </main>

            <footer className="p-4 border-t bg-white">
                <div className="max-w-4xl mx-auto flex items-center border rounded-full overflow-hidden">
                    <button
                        className="px-4 py-3 rounded-l-full"
                        aria-label="Add"
                    >
                        <Plus className="w-5 h-5" />
                    </button>

                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="Type your message..."
                        className="flex-1 py-3 focus:outline-none"
                        aria-label="Message input"
                    />

                    <button
                        onClick={handleSend}
                        className="px-4 py-3 rounded-r-full"
                        aria-label="Send message"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </footer>
        </div>
    );
}
