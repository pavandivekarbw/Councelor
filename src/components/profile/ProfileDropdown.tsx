import React, { useState, useRef, useEffect } from "react";
import "./ProfileDropdown.css";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../useTheme";

interface ProfileDropdownProps {
    name: string;
    email: string;
    onOptionSelect: (option: string) => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
    name,
    onOptionSelect,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { theme, updateTheme } = useTheme();
    const options = ["Settings", "Theme", "Log Out"];

    const userDataString = localStorage.getItem("userData");
    if (userDataString) {
        const userData = JSON.parse(userDataString);
        name = userData.firstName + " " + userData.lastName;
    } else {
        console.error("User data not found in local storage");
    }

    const initials = name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("");

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="dropdown-container" ref={dropdownRef}>
            <div
                className={`${
                    theme === "dark"
                        ? "dropdown-header-dark"
                        : "dropdown-header-light"
                }`}
                title="Profile Settings"
            >
                <div
                    className="avatar cursor-pointer"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {initials}
                </div>
            </div>
            {isOpen && (
                <div
                    className={`${
                        theme === "dark"
                            ? "dropdown-menu-dark"
                            : "dropdown-menu-light"
                    } shadow-lg rounded-md p-2"`}
                >
                    {options.map((option) =>
                        option === "Theme" ? (
                            <div
                                key={option}
                                className={`${
                                    theme === "dark"
                                        ? "dropdown-item-dark"
                                        : "dropdown-item-light"
                                } flex items-center justify-between py-2 px-3`}
                            >
                                <span
                                    className={`${
                                        theme === "light"
                                            ? "text-gray-800"
                                            : "text-white"
                                    }`}
                                >
                                    {option}
                                </span>
                                <button
                                    onClick={() =>
                                        updateTheme(
                                            theme === "light" ? "dark" : "light"
                                        )
                                    }
                                    className={`p-2 rounded-full ${
                                        theme === "light"
                                            ? "bg-gray-300 hover:bg-gray-200"
                                            : "bg-gray-600 hover:bg-gray-500"
                                    } cursor-pointer transition-colors`}
                                    aria-label="Toggle Dark Mode"
                                >
                                    {theme === "light" ? (
                                        <Moon size={20} />
                                    ) : (
                                        <Sun size={20} />
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div
                                key={option}
                                className={`${
                                    theme === "dark"
                                        ? "dropdown-item-dark"
                                        : "dropdown-item-light"
                                } py-2 px-3 rounded cursor-pointer`}
                                onClick={() => {
                                    onOptionSelect(option);
                                    setIsOpen(false);
                                }}
                            >
                                {option}
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;
