"use client";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "./ui/Card";
import { registerUser } from "../services/SignUpAPI";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { clearNotifications, showNotification } from "../lib/feature/toaster";
import { getErrorMessage } from "../lib/hepler";
import CustomNotification from "./custom-notification/CustomNotification";
import Loader from "./loader/Loader";
import { useTheme } from "./useTheme";

const UnityCentralSignupForm: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    // const [company, setCompany] = useState("");
    // const [industry, setIndustry] = useState("");
    const [showSuccessScreen, setShowSuccessScreen] = useState(false);
    // const [userId, setUserId] = useState<number | null>(null);
    const { theme } = useTheme();

    const dispatch = useAppDispatch();
    const { show, message, type, duration } = useAppSelector(
        (state) => state.toaster
    );

    const onFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        signUpUser();
    };

    const signUpUser = async () => {
        if (!email || !password || !firstName || !lastName) {
            dispatch(
                showNotification({
                    show: true,
                    duration: 3000,
                    type: "error",
                    message: "All fields are required.",
                })
            );
            return;
        }
        if (password.length < 6) {
            dispatch(
                showNotification({
                    show: true,
                    duration: 3000,
                    type: "error",
                    message: "Password must be at least 6 characters long.",
                })
            );
            return;
        }
        if (password !== confirmPassword) {
            dispatch(
                showNotification({
                    show: true,
                    duration: 3000,
                    type: "error",
                    message: "Passwords do not match.",
                })
            );
            return;
        }
        setIsLoading(true);
        try {
            const response = await registerUser({
                userEmail: email,
                password,
                firstName,
                lastName,
                companyName: "", // company,
                departmentName: "", // industry,
                contactNumber: phoneNumber,
                profilePicture: "Coming Soon",
            });
            setIsLoading(false);
            if (response) {
                console.log("Login successful:", response);
                // setUserId(response.userId);
                setShowSuccessScreen(true);
            } else {
                console.error("Login failed");
                // Handle login failure (e.g., show error message)
            }
        } catch (error: unknown) {
            setIsLoading(false);
            const errorMessage =
                typeof error === "object" &&
                error !== null &&
                "message" in error
                    ? (error as { message?: string }).message
                    : String(error);
            dispatch(
                showNotification({
                    show: true,
                    duration: 3000,
                    type: "error",
                    message: getErrorMessage(errorMessage),
                })
            );
            return;
        }
    };

    const handleResendEmail = async () => {
        // const response = await resendAcivationCode({
        //     userEmail: email,
        //     password,
        //     firstName,
        //     lastName,
        //     companyName: company,
        //     departmentName: industry,
        //     contactNumber: phoneNumber,
        //     profilePicture: "Coming Soon",
        // });
        // if (response) {
        //     console.log("Login successful:", response);
        //     setShowSuccessScreen(true);
        // } else {
        //     console.error("Login failed");
        //     // Handle login failure (e.g., show error message)
        // }
    };

    return (
        <div
            className={`min-h-screen flex items-center justify-center ${
                theme === "dark" ? "bg-black" : "bg-white"
            } bg-cover bg-center bg-no-repeat`}
        >
            <Card
                className={`w-full max-w-md ${
                    theme === "dark" ? "bg-gray-800" : "bg-gray-200"
                } p-8 rounded-2xl shadow-lg`}
            >
                {!showSuccessScreen ? (
                    <CardContent className="text-center">
                        <img
                            src="/images/uc-logo.svg"
                            alt="Unity Central Logo"
                            width={64}
                            height={64}
                            className="w-16 mx-auto mb-4"
                        />
                        <h1
                            className={`${
                                theme === "dark" ? "text-white" : "text-black"
                            } text-3xl font-bold mb-8`}
                        >
                            Unity Central
                        </h1>
                        <form onSubmit={onFormSubmit}>
                            <div className="flex gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    className={`w-full ${
                                        theme === "dark"
                                            ? "bg-gray-700 text-gray-300"
                                            : "text-gray-700 bg-gray-300"
                                    }  p-3 rounded-md`}
                                    value={firstName}
                                    onChange={(e) =>
                                        setFirstName(e.target.value)
                                    }
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    className={`w-full ${
                                        theme === "dark"
                                            ? "bg-gray-700 text-gray-300"
                                            : "text-gray-700 bg-gray-300"
                                    }  p-3 rounded-md`}
                                    value={lastName}
                                    onChange={(e) =>
                                        setLastName(e.target.value)
                                    }
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Enter email address"
                                className={`w-full ${
                                    theme === "dark"
                                        ? "bg-gray-700 text-gray-300"
                                        : "text-gray-700 bg-gray-300"
                                }  p-3 rounded-md mb-4`}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {/* <input
                                type="text"
                                placeholder="Enter your Company"
                                className="w-full bg-gray-700 text-gray-300 p-3 rounded-md mb-4"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                            />
                            <select
                                className="w-full bg-gray-700 text-gray-400 p-3 rounded-md mb-4"
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                            >
                                <option value="" disabled>
                                    Select Industry
                                </option>
                                <option>Select Role/Industry</option>
                                <option>Software</option>
                                <option>Finance</option>
                                <option>Healthcare</option>
                            </select> */}
                            <div className="relative mb-4">
                                <input
                                    type="text"
                                    placeholder="Enter phone number"
                                    className={`w-full ${
                                        theme === "dark"
                                            ? "bg-gray-700 text-gray-300"
                                            : "text-gray-700 bg-gray-300"
                                    }  p-3 rounded-md pl-12`}
                                    value={phoneNumber}
                                    onChange={(e) =>
                                        setPhoneNumber(e.target.value)
                                    }
                                />
                                <span className="absolute left-4 top-3">
                                    🇺🇸
                                </span>
                            </div>
                            <div className="relative mb-4">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your Password"
                                    className={`w-full ${
                                        theme === "dark"
                                            ? "bg-gray-700 text-gray-300"
                                            : "text-gray-700 bg-gray-300"
                                    }  p-3 rounded-md pl-10`}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                                <button
                                    type="button"
                                    className={`absolute right-3 top-3 ${
                                        theme === "dark"
                                            ? "text-gray-400"
                                            : "text-gray-700"
                                    } cursor-pointer`}
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>
                            </div>
                            <div className="relative mb-6">
                                <input
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Re-Enter your Password"
                                    className={`w-full ${
                                        theme === "dark"
                                            ? "bg-gray-700 text-gray-300"
                                            : "text-gray-700 bg-gray-300"
                                    }  p-3 rounded-md pl-10`}
                                />
                                <button
                                    type="button"
                                    className={`absolute right-3 top-3 ${
                                        theme === "dark"
                                            ? "text-gray-400"
                                            : "text-gray-700"
                                    } cursor-pointer`}
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>
                            </div>
                            <button className="w-full bg-blue-600 text-white py-3 rounded-md text-lg font-semibold hover:bg-blue-700 cursor-pointer">
                                Continue
                            </button>
                        </form>
                        <p
                            className={`${
                                theme === "dark" ? "text-white" : "text-black"
                            } text-xs mt-6`}
                        >
                            Copyright 2006 - 2025 Boardwalktech, Inc
                        </p>
                    </CardContent>
                ) : (
                    <CardContent className="text-center">
                        <img
                            src="/images/uc-logo.svg"
                            alt="Unity Central Logo"
                            width={64}
                            height={64}
                            className="w-16 mx-auto mb-4"
                        />
                        <h1
                            className={`${
                                theme === "dark" ? "text-white" : "text-black"
                            } text-3xl font-bold mb-8`}
                        >
                            Unity Central
                        </h1>

                        <h2
                            className={`${
                                theme === "dark" ? "text-white" : "text-black"
                            } mb-4`}
                        >
                            {
                                "A confirmation email has been sent to your email, Check your inbox to get started!"
                            }
                        </h2>
                        <button
                            className="w-full bg-blue-600 text-white py-3 rounded-md text-lg hover:bg-blue-700 cursor-pointer"
                            onClick={handleResendEmail}
                        >
                            {"Didn't receive email? Click Here to try again"}
                        </button>
                        <p
                            className={`${
                                theme === "dark" ? "text-white" : "text-black"
                            } text-xs mt-6`}
                        >
                            Copyright 2006 - 2025 BoardWalkTech, Inc
                        </p>
                    </CardContent>
                )}
            </Card>
            {isLoading && <Loader />}
            {show && (
                <CustomNotification
                    message={message}
                    onClose={() => dispatch(clearNotifications())}
                    seviority={type}
                    duration={duration}
                />
            )}
        </div>
    );
};

export default UnityCentralSignupForm;
