import React, { useState, useEffect, useRef } from "react";
import CustomButton from "../CustomButton";
import "./style.css"; // Assuming you have a CSS file for styles
import { useTheme } from "../useTheme";

const fileTypes: string[] = [
    "All",
    "pdf",
    "txt",
    "docx",
    "doc",
    "xlsx",
    "xls",
    "pptx",
    "ppt",
    "jpg",
    "jpeg",
    "png",
    "gif",
    "mp4",
    "mp3",
    "json",
    "xml",
];
interface FileTypeDropdownProps {
    selectedValue: string;
    setSelectedValue: (value: string) => void;
}
const FileTypeDropdown: React.FC<FileTypeDropdownProps> = ({
    selectedValue = "",
    setSelectedValue = () => {},
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();

    const handleOutsideClick = (event: MouseEvent) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
        ) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleOutsideClick);
        return () =>
            document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    const handleSelect = (value: string) => {
        setSelectedValue(value);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <CustomButton
                onClick={() => setIsOpen(!isOpen)}
                label={
                    !selectedValue || selectedValue === "All"
                        ? "File Type"
                        : selectedValue
                }
                theme={theme}
                title="Select File Type"
            />
            {isOpen && (
                <div
                    className={`absolute ${
                        theme === "dark"
                            ? "bg-gray-800 text-white"
                            : "bg-white text-gray-800"
                    } mt-2 rounded shadow-lg p-2 w-48 z-50 min-w-[250px] dropdown-class`}
                >
                    <ul>
                        {fileTypes.map((type) => (
                            <li
                                key={type}
                                className={`cursor-pointer ${
                                    theme === "dark"
                                        ? "hover:bg-gray-700"
                                        : "hover:bg-gray-200"
                                }  p-2`}
                                onClick={() => handleSelect(type)}
                            >
                                {type}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default FileTypeDropdown;
