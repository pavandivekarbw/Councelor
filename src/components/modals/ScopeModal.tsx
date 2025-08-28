import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";

interface TeamsScopesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TeamsScopesModal: React.FC<TeamsScopesModalProps> = ({
    isOpen,
    onClose,
}) => {
    const [scopes, setScopes] = useState({
        pullAll: false,
        pullChannels: false,
        pullMessages: false,
    });

    const handleChange = (scope: keyof typeof scopes) => {
        setScopes({ ...scopes, [scope]: !scopes[scope] });
    };

    const handleSave = () => {
        console.log("Selected Scopes:", scopes);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1e2235] rounded-lg p-6 w-full max-w-md relative shadow-lg">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 cursor-pointer transition-colors"
                    aria-label="Close Modal"
                >
                    <IoMdClose className="h-5 w-5" />
                </button>

                {/* Modal Content */}
                <h2 className="text-lg font-semibold mb-4">
                    Select Scopes for Teams
                </h2>

                <div className="mb-4">
                    <label
                        htmlFor="addUser"
                        className="block text-sm font-medium text-gray-400 mb-1"
                    >
                        Add User
                    </label>
                    <input
                        id="addUser"
                        type="text"
                        value="@steven.birdwell"
                        readOnly
                        className="w-full bg-[#2b2f43] text-gray-300 px-3 py-2 rounded-md outline-none"
                    />
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                        <input
                            id="pullAll"
                            type="checkbox"
                            checked={scopes.pullAll}
                            onChange={() => handleChange("pullAll")}
                            className="h-4 w-4 text-blue-600 bg-[#2b2f43] border-gray-600 rounded focus:ring-blue-500"
                        />
                        <label
                            htmlFor="pullAll"
                            className="ml-3 text-sm text-gray-300 select-none"
                        >
                            Pull All
                        </label>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="pullChannels"
                            type="checkbox"
                            checked={scopes.pullChannels}
                            onChange={() => handleChange("pullChannels")}
                            className="h-4 w-4 text-blue-600 bg-[#2b2f43] border-gray-600 rounded focus:ring-blue-500"
                        />
                        <label
                            htmlFor="pullChannels"
                            className="ml-3 text-sm text-gray-300 select-none"
                        >
                            Pull Channels
                        </label>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="pullMessages"
                            type="checkbox"
                            checked={scopes.pullMessages}
                            onChange={() => handleChange("pullMessages")}
                            className="h-4 w-4 text-blue-600 bg-[#2b2f43] border-gray-600 rounded focus:ring-blue-500"
                        />
                        <label
                            htmlFor="pullMessages"
                            className="ml-3 text-sm text-gray-300 select-none"
                        >
                            Pull Messages
                        </label>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold"
                >
                    Save
                </button>
            </div>
        </div>
    );
};

export default TeamsScopesModal;
