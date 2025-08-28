import React, { useEffect } from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "./ui/Card";
import { loginAPI } from "../services/LoginAPI";
import { getUserData } from "../services/User";
import Loader from "./loader/Loader";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { clearNotifications, showNotification } from "../lib/feature/toaster";
import { getErrorMessage } from "../lib/hepler";
import CustomNotification from "./custom-notification/CustomNotification";
import { useTheme } from "./useTheme";

interface LoginFormProps {
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;
}
const UnityCentralLoginForm: React.FC<LoginFormProps> = ({
    setIsAuthenticated,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch();
    const { theme } = useTheme();
    const { show, message, type, duration } = useAppSelector(
        (state) => state.toaster
    );

    useEffect(() => {
        // Reset form fields on component mount
        setEmail("");
        setPassword("");
        setShowPassword(false);
    }, []);

    const onFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        signInUser();
    };

    const signInUser = async () => {
        setIsLoading(true);
        if (!email || !password) {
            setIsLoading(false);
            dispatch(
                showNotification({
                    show: true,
                    duration: 3000,
                    type: "error",
                    message: "Email and Password are required.",
                })
            );
            return;
        }

        try {
            const response = await loginAPI({
                username: email,
                password,
                authenticationType: "basic",
                samlToken: "",
            });
            if (response) {
                // Handle successful login (e.g., redirect to dashboard)
                localStorage.setItem("authenticated", "true");
                const userData = await getUserData(response.userId);
                localStorage.setItem("userData", JSON.stringify(userData));
                setIsAuthenticated(true);
            } else {
                console.error("Login failed");
                // Handle login failure (e.g., show error message)
            }
        } catch (error: unknown) {
            const errorMessage =
                typeof error === "object" &&
                error !== null &&
                "message" in error
                    ? (error as { message?: string }).message
                    : String(error);
            setIsLoading(false);
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

    return (
        <div
            className={`min-h-screen flex items-center justify-center ${
                theme === "dark" ? "bg-black" : "bg-white"
            } bg-cover bg-center bg-no-repeat`}
        >
            <Card
                className={`w-full max-w-md ${
                    theme === "dark" ? "bg-gray-800" : "bg-gray-200"
                } p-8 rounded-2xl shadow-lg min-w-[550px]`}
            >
                <CardContent className="text-center">
                    <img
                        src="/images/uc-logo.svg"
                        alt="Unity Central Logo"
                        width={64}
                        height={64}
                        className="mx-auto mb-4"
                    />
                    <h1
                        className={`${
                            theme === "dark" ? "text-white" : "text-black"
                        } text-3xl font-bold mb-8`}
                    >
                        Unity Central
                    </h1>
                    <form onSubmit={onFormSubmit}>
                        <div className="flex justify-start p-1">
                            <label
                                className={`${
                                    theme === "dark"
                                        ? "text-gray-300"
                                        : "text-gray-700"
                                } text-sm`}
                            >
                                Email
                            </label>
                        </div>
                        <input
                            type="email"
                            placeholder="Enter your Email"
                            className={`w-full ${
                                theme === "dark"
                                    ? "bg-gray-700 text-gray-200"
                                    : "text-gray-700 bg-gray-200"
                            }  p-3 rounded-md mb-4`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <div className="flex justify-start p-1">
                            <label
                                className={`${
                                    theme === "dark"
                                        ? "text-gray-300"
                                        : "text-gray-700"
                                } text-sm`}
                            >
                                Password
                            </label>
                        </div>
                        <div className="relative mb-4">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your Password"
                                className={`w-full ${
                                    theme === "dark"
                                        ? "bg-gray-700 text-gray-200"
                                        : "text-gray-700 bg-gray-200"
                                }  p-3 rounded-md pr-10`}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className={`absolute right-3 top-3 ${
                                    theme === "dark"
                                        ? "text-gray-400"
                                        : "text-gray-700"
                                } cursor-pointer`}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {!showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>
                        <div className="flex items-center justify-between mb-6">
                            <label
                                className={`flex items-center ${
                                    theme === "dark"
                                        ? "text-gray-300"
                                        : "text-gray-700"
                                }`}
                            >
                                <input type="checkbox" className="mr-2" />{" "}
                                Remember me
                            </label>
                            <a
                                href="#"
                                className={`${
                                    theme === "dark"
                                        ? "text-gray-300"
                                        : "text-gray-700"
                                } text-sm hover:underline`}
                            >
                                Forgot Password
                            </a>
                        </div>
                        <button className="w-full bg-blue-600 text-white py-3 rounded-md text-lg font-semibold hover:bg-blue-700 cursor-pointer">
                            Login
                        </button>
                    </form>
                    <p
                        className={`${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                        } text-sm mt-6`}
                    >
                        New to{" "}
                        <span
                            className={`font-semibold ${
                                theme === "dark" ? "text-whtie" : "text-black"
                            }`}
                        >
                            Unity Central
                        </span>
                        ?{" "}
                        <a
                            href="/signup"
                            className="text-blue-400 hover:underline"
                        >
                            Sign up
                        </a>
                    </p>
                    <p className="text-gray-500 text-xs mt-4">
                        Copyright 2006 - 2025 Boardwalktech, Inc.
                    </p>
                </CardContent>
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

export default UnityCentralLoginForm;
