import React from "react";
import clsx from "clsx";

// Input Component
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
    className,
    ...props
}) => {
    return (
        <input
            className={clsx(
                "px-4 py-2 rounded-2xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500 w-full",
                className
            )}
            {...props}
        />
    );
};
