import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";

export type Message = {
    id: string;
    text: string;
    role: "user" | "assistant";
    createdAt: string; // ISO
};

const LS_KEY = "chat_ui_v1_messages";
const LS_SIDEBAR = "chat_ui_v1_sidebar_collapsed";

export default function Serien() {
    const [collapsed, setCollapsed] = useState<boolean>(() => {
        // try {
        //     return JSON.parse(localStorage.getItem(LS_SIDEBAR) ?? "false");
        // } catch {
        //     return false;
        // }
        return false;
    });

    const [messages, setMessages] = useState<Message[]>(() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (!raw) {
                // initial demo messages
                return [
                    {
                        id: cryptoRandomId(),
                        text: "Hello! I'm your assistant.",
                        role: "assistant",
                        createdAt: new Date().toISOString(),
                    },
                    {
                        id: cryptoRandomId(),
                        text: "Hi! Show me something.",
                        role: "user",
                        createdAt: new Date(Date.now() + 60000).toISOString(),
                    },
                ];
            }
            return JSON.parse(raw) as Message[];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(LS_KEY, JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        localStorage.setItem(LS_SIDEBAR, JSON.stringify(collapsed));
    }, [collapsed]);

    function sendMessage(text: string) {
        if (!text.trim()) return;
        const userMsg: Message = {
            id: cryptoRandomId(),
            text: text.trim(),
            role: "user",
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);

        // mock assistant response (simulate network)
        setTimeout(() => {
            const reply: Message = {
                id: cryptoRandomId(),
                text: `Got it — you said: "${truncate(text.trim(), 200)}"`,
                role: "assistant",
                createdAt: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, reply]);
        }, 700);
    }

    function clearChat() {
        setMessages([]);
        localStorage.removeItem(LS_KEY);
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                clearChat={clearChat}
            />
            <div className="flex-1 flex flex-col">
                <header className="border-b px-6 py-3 flex items-center justify-between bg-white">
                    <h1 className="text-center text-lg md:text-xl font-semibold ml-8">
                        User Agent Chat UI v1.0
                    </h1>
                    <div className="flex items-center gap-3">
                        <button className="hidden sm:inline-block px-3 py-1 border rounded-md text-sm">
                            Login
                        </button>
                    </div>
                </header>

                <ChatWindow
                    messages={messages}
                    onSend={sendMessage}
                    sidebarCollapsed={collapsed}
                />
            </div>
        </div>
    );
}

// small utils
function cryptoRandomId() {
    return Math.random().toString(36).slice(2, 9);
}
function truncate(s: string, l = 100) {
    return s.length > l ? s.slice(0, l - 1) + "…" : s;
}
