import { Menu, Plus } from "lucide-react";

type Props = {
    collapsed: boolean;
    setCollapsed: (v: boolean) => void;
    clearChat: () => void;
};

export default function Sidebar({ collapsed, setCollapsed, clearChat }: Props) {
    return (
        <>
            {/* Desktop sidebar */}
            <aside
                className={`hidden md:flex flex-col bg-gray-200 p-4 transition-all duration-300 ${
                    collapsed ? "w-16" : "w-64"
                }`}
                aria-hidden={false}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        {!collapsed && (
                            <>
                                <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-sm">
                                    UA
                                </div>
                                <span className="font-semibold">
                                    User Agent
                                </span>
                            </>
                        )}
                    </div>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        aria-label={
                            collapsed ? "Expand sidebar" : "Collapse sidebar"
                        }
                        className={`p-1 rounded hover:bg-gray-300 `}
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

                {!collapsed && (
                    <>
                        <button className="w-full text-left bg-white p-3 rounded-lg flex items-center gap-2 mb-3 shadow-sm">
                            <Plus className="w-4 h-4" /> <span>New Chat</span>
                        </button>
                        <input
                            className="w-full px-3 py-2 rounded-lg mb-3 text-sm"
                            placeholder="Search Chats"
                            aria-label="Search chats"
                        />
                        <nav className="flex-1 space-y-2">
                            <ChatListItem title="Chat 1" />
                            <ChatListItem title="Chat 2" />
                            <ChatListItem title="Chat 3" />
                        </nav>

                        {/* <div className="mt-auto">
                            <button
                                onClick={clearChat}
                                className="w-full border rounded px-3 py-2 text-sm"
                            >
                                Clear chat (local)
                            </button>
                        </div> */}
                    </>
                )}
            </aside>

            {/* Mobile (drawer-like) */}
            <div className="md:hidden fixed top-3 left-3">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 bg-gray-200 rounded shadow"
                    aria-expanded={collapsed}
                    aria-label="Toggle sidebar"
                >
                    <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                    >
                        <path d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* Mobile overlay menu when collapsed state used as "open" */}
            <div
                className={`md:hidden fixed inset-0 z-20 transition-transform transform ${
                    collapsed ? "translate-x-0" : "-translate-x-full"
                }`}
                role="dialog"
                aria-modal="true"
            >
                <div className="w-72 bg-gray-200 h-full p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-sm">
                                UA
                            </div>
                            <span className="font-semibold">User Agent</span>
                        </div>
                        <button
                            onClick={() => setCollapsed(false)}
                            className="p-1 rounded hover:bg-gray-300"
                        >
                            Close
                        </button>
                    </div>

                    <button className="w-full text-left bg-white p-3 rounded-lg mb-3 shadow-sm">
                        + New Chat
                    </button>
                    <input
                        className="w-full px-3 py-2 rounded-lg mb-3 text-sm"
                        placeholder="Search Chats"
                    />
                    <nav className="flex flex-col gap-2">
                        <ChatListItem title="Chat 1" />
                        <ChatListItem title="Chat 2" />
                        <ChatListItem title="Chat 3" />
                    </nav>
                </div>
                <div className="flex-1" onClick={() => setCollapsed(false)} />
            </div>
        </>
    );
}

function ChatListItem({ title }: { title: string }) {
    return (
        <button className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 text-left">
            <span className="text-lg">💬</span>
            <span className="text-sm">{title}</span>
        </button>
    );
}
