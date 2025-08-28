import React from "react";
import clsx from "clsx";
export const Button: React.FC<
    React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className, children, ...props }) => {
    return (
        <button
            className={clsx(
                "px-4 py-2 rounded-2xl bg-blue-600 text-white flex items-center gap-2 hover:bg-blue-700 transition duration-150 cursor-pointer",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};
