import React from "react";
import { ChevronDown, Upload } from "lucide-react";
interface CustomButtonProps {
    label: string;
    withIcon?: boolean;
    onClick?: () => void;
    standAlone?: boolean;
    theme?: string;
    disabled?: boolean;
    icon?: React.ReactNode;
    title?: string;
    classes?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
    label,
    withIcon = false,
    onClick,
    standAlone = false,
    theme,
    disabled = false,
    icon,
    title = "",
    classes,
}) => {
    return (
        <button
            className={
                classes
                    ? `flex items-center y-2 px-4 py-2.5 rounded-lg shadow-md gap-2  cursor-pointer transition duration-200 ease-in-out min-w-[125px] ${classes}`
                    : `flex items-center ${
                          theme === "dark"
                              ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                              : "bg-white text-black hover:bg-gray-200"
                      }  py-2 px-4 rounded-lg shadow-md gap-2  cursor-pointer transition duration-200 ease-in-out min-w-[125px]`
            }
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={title}
        >
            {icon || null}
            {icon ? null : standAlone ? null : withIcon ? (
                <Upload className="w-4 h-4" />
            ) : (
                <ChevronDown className="w-4 h-4" />
            )}
            <span>{label}</span>
        </button>
    );
};

export default CustomButton;
