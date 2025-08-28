"use client";
import { X } from "lucide-react";
import { useEffect } from "react";

type NotificationProps = {
    message: string;
    duration?: number; // in ms
    seviority?: "info" | "success" | "warning" | "error";
    onClose: () => void;
};

export default function CustomNotification({
    message,
    duration = 3000,
    seviority = "info",
    onClose,
}: NotificationProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div
            className={`flex justify-between align-middle gap-2 fixed bottom-4 left-1/2 transform -translate-x-1/2 ${
                seviority === "success"
                    ? "bg-green-500"
                    : seviority === "info"
                    ? "bg-blue-500"
                    : "bg-red-500"
            } text-white p-3 rounded shadow-lg animate-fade-in-out text-sm`}
        >
            <div className="mt-0.5">{message}</div>
            <div>
                <X className="cursor-pointer" onClick={onClose} />
            </div>
        </div>
    );
}
