import React from "react";
import type { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
    return (
        <div
            className={`rounded-2xl bg-[#1E212F] shadow-lg p-6 ${className}`}
            style={{ scrollbarWidth: "thin" }}
        >
            {children}
        </div>
    );
};
interface CardContentProps {
    children: ReactNode;
    className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
    children,
    className = "",
}) => {
    return <div className={`px-6 py-4 ${className}`}>{children}</div>;
};
