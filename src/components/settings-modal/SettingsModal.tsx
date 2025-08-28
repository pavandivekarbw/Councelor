"use client";
import React, { useEffect, useState } from "react";
import "./SettingsModal.css";
import { updateUser } from "../../services/User"; // Adjust the import path as necessary

interface SettingsModalProps {
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState("General");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [userId, setUserId] = useState<number | null>(null);

    const handleTabClick = (tab: string) => setActiveTab(tab);

    const handleSaveChanges = async () => {
        if (activeTab === "General") {
            const response = await updateUser({
                companyName: companyName,
                contactNumber: contactNumber,
                externalUserId: userId,
                firstName,
                lastName,
                userEmail: email,
                userId: userId,
            });
            if (response) {
                console.log("User updated successfully:");
            } else {
                console.error("Failed to update user:", response);
            }
        }
        onClose(); // Optionally close modal on save
    };

    useEffect(() => {
        const userDataString = localStorage.getItem("userData");
        if (userDataString) {
            const userData = JSON.parse(userDataString);
            setFirstName(userData.firstName || "");
            setLastName(userData.lastName || "");
            setEmail(userData.userEmail || "");
            setUsername(userData.firstName + userData.lastName || "_");
            setContactNumber(userData.contactNumber || "");
            setCompanyName(userData.companyName || "");
            setUserId(userData.userId || null);
        } else {
            console.error("User data not found in local storage");
        }
    }, []);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="settings-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4">
                    <h2>Settings</h2>
                    <button
                        className="close-button cursor-pointer"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>
                <div className="tabs">
                    {["General", "App Info"].map((tab) => (
                        <div
                            key={tab}
                            className={`tab ${
                                activeTab === tab ? "active" : ""
                            }`}
                            onClick={() => handleTabClick(tab)}
                        >
                            {tab}
                        </div>
                    ))}
                </div>

                {activeTab === "General" && (
                    <div className="tab-content">
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Enter your first name"
                                title="First Name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Enter your last name"
                                title="Last Name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                title="Email Address"
                                readOnly
                            />
                        </div>
                        <div className="form-group">
                            <label>User Name</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Your username"
                                title="User Name"
                                readOnly
                            />
                        </div>
                        <p>Username: {"@" + username}</p>
                    </div>
                )}

                {activeTab === "App Info" && (
                    <div className="tab-content">App Version: 2.0.1</div>
                )}

                <div className="button-group">
                    <button className="change-password-button" disabled>
                        Change Password
                    </button>
                    <button
                        className="save-changes-button"
                        onClick={handleSaveChanges}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
