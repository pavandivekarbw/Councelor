// src/components/PrivateRoute.tsx
"use client";
import { useState, type ReactNode } from "react";
import { useTheme } from "./useTheme";
import ProfileDropdown from "./profile/ProfileDropdown";
import SettingsModal from "./settings-modal/SettingsModal";

interface PrivateRouteProps {
    children: ReactNode;
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;
}

export default function PrivateRoute({
    children,
    setIsAuthenticated,
}: PrivateRouteProps) {
    const { theme } = useTheme();
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    return (
        <>
            <div
                className={`flex-1 h-[100vh] w-full ${
                    theme === "dark" ? "bg-[#171923]" : "bg-[#FAFBFC]"
                }  text-white relative"`}
            >
                <div className="p-8 h-full md:overflow-y-auto">{children}</div>
                <div className="absolute top-4 right-4">
                    <ProfileDropdown
                        name="Unity Central"
                        email="fz7dD@example.com"
                        onOptionSelect={(option) => {
                            if (option === "Log Out") {
                                localStorage.removeItem("authenticated");
                                setIsAuthenticated(false);
                            }
                            if (option === "Settings") {
                                setShowSettingsModal(true);
                            }
                        }}
                    />
                </div>
                {showSettingsModal && (
                    <SettingsModal
                        onClose={() => setShowSettingsModal(false)}
                    />
                )}
            </div>
        </>
    );
}
// This component checks if the user is authenticated before rendering its children.
