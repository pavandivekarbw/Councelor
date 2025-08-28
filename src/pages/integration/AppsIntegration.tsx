"use client";
import React, { useEffect, useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { PiMicrosoftOutlookLogoFill } from "react-icons/pi";
import { BsMicrosoftTeams } from "react-icons/bs";
import { FaSlack } from "react-icons/fa";
import {
    authenticateOutlook,
    authenticateTeams,
    disconnectOutlook,
    disconnectTeams,
    getAvailableIntegrations,
    getHMailIntegration,
} from "../../services/User";
import AppSettings from "../../components/app-settings/AppSettings";
import { useAppDispatch, useAppSelector } from "../../lib/hooks";
import {
    clearNotifications,
    showNotification,
} from "../../lib/feature/toaster";
import CustomNotification from "../../components/custom-notification/CustomNotification";
import { useTheme } from "../../components/useTheme";
import Loader from "../../components/loader/Loader";
// If you still get an error, try changing 'SiMicrosoftoutlook' to 'SiMicrosoftoutlook' or check the actual export name in node_modules/react-icons/si/index.d.ts

interface IntegrationList {
    accessToken: string;
    accessTokenExpiration: string;
    accountType: string;
    emailAddress: string;
    isRefreshTokenExpired: boolean;
    lastReadMessageId: string;
    refreshToken: string;
    userId: number;
}

const AppsIntegration: React.FC = () => {
    const { theme } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [integrations, setIntegrations] = useState<IntegrationList[]>([]);
    const [userHmail, setUserHmail] = useState<string>("");
    const [showOutlookConfig, setShowOutlookConfig] = useState(false);
    const [outlookRedirectURL, setOutlookRedirectURL] = useState("#");
    const outlookRedirectref = React.useRef<HTMLAnchorElement>(null);
    const [teamsRedirectURL, setTeamsRedirectURL] = useState("#");
    const teamsRedirectref = React.useRef<HTMLAnchorElement>(null);
    const { show, message, type, duration } = useAppSelector(
        (state) => state.toaster
    );
    const dispatch = useAppDispatch();
    const handleOutlookAuthentication = async () => {
        try {
            setIsLoading(true);
            const response = await authenticateOutlook();
            console.log("Authentication response:", response);
            setOutlookRedirectURL(response.redirectUrl);
            setIsLoading(false);

            if (response.redirectUrl) {
                window.open(response.redirectUrl, "_blank");
            } else {
                console.error("No redirect URL received.");
            }
        } catch (error) {
            setIsLoading(false);
            dispatch(
                showNotification({
                    show: true,
                    message: "Authentication failed",
                    type: "error",
                    duration: 3000,
                })
            );
            console.error("Authentication failed:", error);
        }
    };
    const handleTeamsAuthentication = async () => {
        try {
            setIsLoading(true);
            const response = await authenticateTeams();
            setTeamsRedirectURL(response.redirectUrl);
            setIsLoading(false);

            if (response.redirectUrl) {
                window.open(response.redirectUrl, "_blank");
            } else {
                console.error("No redirect URL received.");
            }
        } catch (error) {
            setIsLoading(false);
            dispatch(
                showNotification({
                    show: true,
                    message: "Authentication failed",
                    type: "error",
                    duration: 3000,
                })
            );
            console.error("Authentication failed:", error);
        }
    };

    const handleOutlookAuthenticationDisconnect = async () => {
        try {
            // Logic to disconnect Outlook integration
            // This could be an API call to remove the integration
            setIsLoading(true);
            const response = await disconnectOutlook();
            if (response.success)
                setIntegrations((prev) =>
                    prev.filter(
                        (integration) =>
                            integration.accountType.toUpperCase() !== "OUTLOOK"
                    )
                );
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            dispatch(
                showNotification({
                    show: true,
                    message: "Error disconnecting Outlook",
                    type: "error",
                    duration: 3000,
                })
            );
            console.error("Error disconnecting Outlook:", error);
        }
        // setShowOutlookConfig(true);
    };
    const handleTeamsAuthenticationDisconnect = async () => {
        try {
            // Logic to disconnect Teams integration
            // This could be an API call to remove the integration
            setIsLoading(true);
            const response = await disconnectTeams();
            if (response.success)
                setIntegrations((prev) =>
                    prev.filter(
                        (integration) =>
                            integration.accountType.toUpperCase() !== "TEAMS"
                    )
                );
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            dispatch(
                showNotification({
                    show: true,
                    message: "Error disconnecting Teams",
                    type: "error",
                    duration: 3000,
                })
            );
            console.error("Error disconnecting Outlook:", error);
        }
        // setShowOutlookConfig(true);
    };

    const fetchIntegrations = async () => {
        try {
            setIsLoading(true);
            const response = await getAvailableIntegrations();
            if (response) {
                setIntegrations(response);
            } else {
                console.error("No integrations found in response");
            }
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            dispatch(
                showNotification({
                    show: true,
                    message: "Error fetching integrations",
                    type: "error",
                    duration: 3000,
                })
            );
            console.error("Error fetching integrations:", error);
            // Handle error appropriately, e.g., show a notification or log it
        }
    };
    const fetchHMail = async () => {
        try {
            setIsLoading(true);
            const response = await getHMailIntegration();
            if (response) {
                setUserHmail(response.mailServerEmailAddress);
            } else {
                console.error("No integrations found in response");
            }
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            dispatch(
                showNotification({
                    show: true,
                    message: "Error fetching integrations",
                    type: "error",
                    duration: 3000,
                })
            );
            console.error("Error fetching integrations:", error);
            // Handle error appropriately, e.g., show a notification or log it
        }
    };

    useEffect(() => {
        // Check if Outlook integration is already connected
        if (outlookRedirectURL !== "#" && outlookRedirectURL !== "") {
            if (outlookRedirectref.current) {
                outlookRedirectref.current.click();
            }
        }
    }, [outlookRedirectURL]);
    useEffect(() => {
        fetchIntegrations();
        fetchHMail();
    }, []);
    return (
        <div>
            {isLoading && <Loader />}
            {showOutlookConfig ? (
                <AppSettings setShowOutlookConfig={setShowOutlookConfig} />
            ) : (
                <div
                    className={`h-[100%] ${
                        theme === "dark" ? "text-white" : "text-black"
                    } p-6`}
                >
                    <h1 className="text-lg font-semibold mb-4">Apps</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 md:overflow-y-auto gap-6">
                        {/* Send Emails to UC */}
                        <div
                            className={`${
                                theme === "dark" ? "bg-[#21242C]" : "bg-white"
                            } p-5 rounded-md shadow`}
                        >
                            <div className="flex items-center gap-2 mb-3 text-lg font-medium">
                                <FaEnvelope
                                    className={`text-xl ${
                                        theme === "light"
                                            ? "text-[#21242C]"
                                            : "text-[#B7BECD]"
                                    }`}
                                />
                                <span>Send Emails to UC</span>
                            </div>
                            <p
                                className={`text-sm ${
                                    theme === "dark"
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                } mb-2`}
                            >
                                Send from any email address to:
                            </p>
                            <div className="flex items-center mb-3">
                                <label
                                    htmlFor="uc-email-address"
                                    className="sr-only"
                                >
                                    Unity Central Email Address
                                </label>
                                <input
                                    id="uc-email-address"
                                    type="text"
                                    readOnly
                                    value={userHmail}
                                    placeholder="Unity Central Email Address"
                                    title="Unity Central Email Address"
                                    className={`flex-1 ${
                                        theme === "dark"
                                            ? "bg-[#2b2f43] text-gray-300"
                                            : "bg-gray-200 text-[#21242C]"
                                    }  text-sm px-3 py-2 rounded-l-md outline-none`}
                                />
                                <button
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md text-sm font-semibold"
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            userHmail
                                        );
                                        dispatch(
                                            showNotification({
                                                show: true,
                                                message: "Copied to clipboard",
                                                type: "info",
                                                duration: 3000,
                                            })
                                        );
                                    }}
                                    title="Copy Email Address"
                                >
                                    Copy
                                </button>
                            </div>
                            {/* <div className="flex flex-col gap-1 text-sm text-blue-400 underline cursor-pointer">
                                <span>Reset Email Address</span>
                                <span>Email Me This Address</span>
                            </div> */}
                        </div>

                        {/* Outlook Integration */}
                        <div
                            className={`${
                                theme === "dark" ? "bg-[#21242C]" : "bg-white"
                            } p-5 rounded-md shadow`}
                        >
                            <div className="flex items-center gap-2 mb-3 text-lg font-medium">
                                <PiMicrosoftOutlookLogoFill
                                    className={`text-xl ${
                                        theme === "light"
                                            ? "text-[#21242C]"
                                            : "text-[#B7BECD]"
                                    }`}
                                />
                                <span>Outlook</span>
                            </div>
                            <p
                                className={`text-sm ${
                                    theme === "dark"
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                } mb-4`}
                            >
                                Streamline email collaboration by leveraging
                                Unity Central for Outlook to attach emails and
                                download email attachments directly to Unity
                                Central
                            </p>
                            <div className="flex justify-between">
                                <button
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold cursor-pointer"
                                    onClick={
                                        integrations.find(
                                            (integration) =>
                                                integration.accountType.toUpperCase() ===
                                                "OUTLOOK"
                                        )
                                            ? handleOutlookAuthenticationDisconnect
                                            : handleOutlookAuthentication
                                    }
                                    title={
                                        integrations.find(
                                            (integration) =>
                                                integration.accountType.toUpperCase() ===
                                                "OUTLOOK"
                                        )
                                            ? "Disconnect Outlook Integration"
                                            : "Connect Outlook Integration"
                                    }
                                >
                                    {integrations.find(
                                        (integration) =>
                                            integration.accountType.toUpperCase() ===
                                            "OUTLOOK"
                                    )
                                        ? "Disconnect"
                                        : "Connect"}
                                </button>

                                {integrations.find(
                                    (integration) =>
                                        integration.accountType.toUpperCase() ===
                                        "OUTLOOK"
                                ) && (
                                    <div className="flex items-center">
                                        <img
                                            src="/images/check-icon.svg"
                                            alt="Check Icon"
                                            width={24}
                                            height={24}
                                        />
                                        <span
                                            className={`text-sm ${
                                                theme === "dark"
                                                    ? "text-gray-300"
                                                    : "text-gray-600"
                                            } ml-2`}
                                        >
                                            Connected
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4" title="Outlook Redirect">
                                <a
                                    ref={outlookRedirectref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={outlookRedirectURL}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition hidden"
                                >
                                    Continue to Outlook
                                </a>
                            </div>
                        </div>

                        {/* Teams Integration */}
                        <div
                            className={`${
                                theme === "dark" ? "bg-[#21242C]" : "bg-white"
                            } p-5 rounded-md shadow`}
                        >
                            <div className="flex items-center gap-2 mb-3 text-lg font-medium">
                                <BsMicrosoftTeams
                                    className={`text-xl ${
                                        theme === "light"
                                            ? "text-[#21242C]"
                                            : "text-[#B7BECD]"
                                    }`}
                                />
                                <span>Teams</span>
                            </div>
                            <p
                                className={`text-sm ${
                                    theme === "dark"
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                } mb-4`}
                            >
                                Streamline team communication by connecting
                                Microsoft Teams to Unity Central
                            </p>
                            <div className="flex justify-between">
                                <button
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold cursor-pointer"
                                    onClick={
                                        integrations.find(
                                            (integration) =>
                                                integration.accountType.toUpperCase() ===
                                                "TEAMS"
                                        )
                                            ? handleTeamsAuthenticationDisconnect
                                            : handleTeamsAuthentication
                                    }
                                    title={`${
                                        integrations.find(
                                            (integration) =>
                                                integration.accountType.toUpperCase() ===
                                                "TEAMS"
                                        )
                                            ? "Disconnect"
                                            : "Connect"
                                    } Teams Integration`}
                                >
                                    {integrations.find(
                                        (integration) =>
                                            integration.accountType.toUpperCase() ===
                                            "TEAMS"
                                    )
                                        ? "Disconnect"
                                        : "Connect"}
                                </button>

                                {integrations.find(
                                    (integration) =>
                                        integration.accountType.toUpperCase() ===
                                        "TEAMS"
                                ) && (
                                    <div
                                        className="flex items-center"
                                        title="Teams Connected"
                                    >
                                        <img
                                            src="/images/check-icon.svg"
                                            alt="Check Icon"
                                            width={24}
                                            height={24}
                                        />
                                        <span
                                            className={`text-sm ${
                                                theme === "dark"
                                                    ? "text-gray-300"
                                                    : "text-gray-600"
                                            } ml-2`}
                                        >
                                            Connected
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4" title="Teams Redirect">
                                <a
                                    ref={teamsRedirectref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={teamsRedirectURL}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition hidden"
                                >
                                    Continue to Teams
                                </a>
                            </div>
                        </div>

                        {/* Slack Integration */}
                        <div
                            className={`${
                                theme === "dark" ? "bg-[#21242C]" : "bg-white"
                            } p-5 rounded-md shadow`}
                        >
                            <div className="flex items-center gap-2 mb-3 text-lg font-medium">
                                <FaSlack
                                    className={`text-xl ${
                                        theme === "light"
                                            ? "text-[#21242C]"
                                            : "text-[#B7BECD]"
                                    }`}
                                />
                                <span>Slack</span>
                            </div>
                            <p
                                className={`text-sm ${
                                    theme === "dark"
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                } mb-4`}
                            >
                                Streamline team communication by connecting
                                Slack to Unity Central
                            </p>
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold"
                                title="Connect Slack"
                            >
                                Coming Soon
                            </button>
                        </div>
                    </div>
                    {show && (
                        <CustomNotification
                            message={message}
                            seviority={type}
                            onClose={() => dispatch(clearNotifications())}
                            duration={duration}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default AppsIntegration;
