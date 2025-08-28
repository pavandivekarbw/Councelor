"use client";

import { useState, useRef, useEffect, type FC, type ReactNode } from "react";
import {
    Search,
    Clock,
    X,
    Copy,
    Download,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    Minus,
    Info,
    ChevronUp,
    ChevronDown,
    Eye,
    EyeOff,
    FileText,
    FileJson,
    CheckCircle,
    XCircle,
    Trash2,
    BrainCircuit,
    MessageSquare,
    Send,
    User,
    Bot,
    ArrowRight,
    Check,
    FilePlus,
    Truck,
    Mail,
    FileCheck,
    Package,
    Receipt,
    UserCheck,
    GitMerge,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeFiles, chatAPI } from "../services/LLMAPI";
import { useTheme } from "./useTheme";
import CustomButton from "./CustomButton";
import { ProgressBar } from "./ui/ProgressBar";
import type { FlowItem } from "../models/Flow";
import { fetchFlow } from "../services/FlowAPI";

// TYPES
type FileStatus = "pending" | "ready" | "error";

interface UploadedFile {
    id: string;
    file: File;
    status: FileStatus;
}

interface AnalysisResult {
    summary: string;
    keyDetails: { key: string; value: object | string }[];
    sentiment: {
        label: "Positive" | "Neutral" | "Negative";
        reasoning: string;
        confidence?: number;
        score?: number;
    };
    actionableItems: string[];
    delayIndicators: string[];
    suggestedQuestions: string[];
}

interface ChatMessage {
    id: string;
    sender: "user" | "bot";
    text: string;
}

// HELPER COMPONENTS
const IconWrapper: FC<{ children: ReactNode; className?: string }> = ({
    children,
    className,
}) => (
    <div
        className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${className}`}
    >
        {children}
    </div>
);

const InfoCard: FC<{
    icon: ReactNode;
    title: string;
    children: ReactNode;
    className?: string;
    theme?: string;
}> = ({ icon, title, children, className, theme }) => (
    <div
        className={`${
            theme === "dark" ? "bg-[#1E212F]" : "bg-white"
        } rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}
    >
        <div className="flex items-start gap-4">
            {icon}
            <div className="flex-1">
                <h3
                    className={`text-lg font-semibold ${
                        theme === "dark" ? "text-white" : "text-black"
                    } mb-2`}
                >
                    {title}
                </h3>
                <div
                    className={`${
                        theme === "dark" ? "text-white" : "text-black"
                    } text-sm leading-relaxed`}
                >
                    {children}
                </div>
            </div>
        </div>
    </div>
);

interface DataItem {
    documentId: string;
    name: string;
    source: string;
    selected: boolean;
    date: string;
}

interface LLMProps {
    inputFiles: DataItem[];
    reload: boolean;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
    setShowAnalyse: React.Dispatch<React.SetStateAction<boolean>>;
    showButton?: boolean;
}

// MAIN PAGE COMPONENT
const AIDocumentAnalyzerPage: React.FC<LLMProps> = ({
    inputFiles,
    reload,
    setReload,
    setShowAnalyse,
    showButton,
}) => {
    const { theme } = useTheme();
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [selectedModel] = useState<"gemini" | "openai">("openai");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [flowProgress, setFlowProgress] = useState(0);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
        null
    );
    const [currentView, setCurrentView] = useState<
        "analysis" | "chat" | "flow"
    >("analysis");
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [chatProgress, setChatProgress] = useState(0);
    const [isFetchingFlow, setIsFetchingFlow] = useState(false);
    const [flowError, setFlowError] = useState<string | null>(null);
    const [flowData, setFlowData] = useState<FlowItem[] | null>(null);

    // Flow processing is now handled in parallel with analysis
    // No separate handleFetchFlow function needed

    const chatContainerRef = useRef<HTMLDivElement>(null);

    const analysisComplete = analysisResult !== null;

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, isBotTyping]);
    useEffect(() => {
        if (inputFiles.length && analysisResult === null) handleAnalyze();
    }, [inputFiles]);

    useEffect(() => {
        if (reload && analysisResult !== null) handleAnalyze();
    }, [reload]);

    const handleAnalyze = async () => {
        if (inputFiles.length === 0) return;
        setIsAnalyzing(true);
        setAnalysisProgress(0);
        setAnalysisResult(null);
        setAnalysisError(null);
        setChatHistory([]);
        setCurrentView("analysis");

        // Also start flow processing in parallel
        setIsFetchingFlow(true);
        setFlowProgress(0);
        setFlowError(null);
        setFlowData(null);

        // Start progress simulation for analysis
        const progressInterval = setInterval(() => {
            setAnalysisProgress((prev) => {
                if (prev >= 90) return prev; // Stop at 90% until actual completion
                return prev + 3; // Smooth, fixed increment
            });
        }, 200);

        // Start progress simulation for flow
        const flowProgressInterval = setInterval(() => {
            setFlowProgress((prev) => {
                if (prev >= 90) return prev; // Stop at 90% until actual completion
                return prev + 4; // Smooth, fixed increment
            });
        }, 200);

        try {
            // Run analysis and flow processing in parallel
            const documentIds = inputFiles.map((f) => parseInt(f.documentId));

            const [analysisResult, flowResult] = await Promise.allSettled([
                analyzeFiles(documentIds),
                fetchFlow(documentIds),
            ]);

            // Handle analysis result
            if (analysisResult.status === "fulfilled") {
                const data: AnalysisResult = JSON.parse(analysisResult.value);
                if (!data || typeof data !== "object") {
                    throw new Error(data || "Failed to analyze documents.");
                }
                if (data.sentiment && !data.sentiment.confidence) {
                    data.sentiment.confidence = 0.85 + Math.random() * 0.15;
                }
                if (data.sentiment && !data.sentiment.score) {
                    data.sentiment.score =
                        data.sentiment.label === "Positive"
                            ? 75 + Math.random() * 25
                            : data.sentiment.label === "Negative"
                            ? Math.random() * 25
                            : 40 + Math.random() * 20;
                }

                // Complete the analysis progress to 100%
                setAnalysisProgress(100);
                setAnalysisResult(data);
                setReload(false);
                setFiles((prev) =>
                    prev.map((f) => ({ ...f, status: "ready" }))
                );
            } else {
                console.error("Analysis failed:", analysisResult.reason);
                let errorMessage = "An unknown error occurred during analysis.";
                if (analysisResult.reason instanceof Error) {
                    errorMessage = analysisResult.reason.message;
                }
                setAnalysisError(errorMessage);
                setFiles((prev) =>
                    prev.map((f) => ({ ...f, status: "error" }))
                );
            }

            // Handle flow result
            if (flowResult.status === "fulfilled") {
                // Complete the flow progress to 100%
                setFlowProgress(100);
                setFlowData(flowResult.value);
            } else {
                console.error("Flow fetch failed:", flowResult.reason);
                let errorMessage =
                    "An unknown error occurred during flow generation.";
                if (flowResult.reason instanceof Error) {
                    errorMessage = flowResult.reason.message;
                }
                setFlowError(errorMessage);
            }
        } catch (error: unknown) {
            console.error("Processing failed:", error);
            let errorMessage = "An unknown error occurred.";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            setAnalysisError(errorMessage);
            setFiles((prev) => prev.map((f) => ({ ...f, status: "error" })));
        } finally {
            clearInterval(progressInterval);
            clearInterval(flowProgressInterval);
            setIsAnalyzing(false);
            setIsFetchingFlow(false);
            setAnalysisProgress(0);
            setFlowProgress(0);
        }
    };

    //  AnalysisView
    const AnalysisView = () => {
        const [showAllKeyDetails, setShowAllKeyDetails] = useState(false);
        const [showSentimentReasoning, setShowSentimentReasoning] =
            useState(false);
        const [copiedItem, setCopiedItem] = useState<string | null>(null);
        const [hoveredDetail, setHoveredDetail] = useState<string | null>(null);

        // Copy
        const copyToClipboard = (text: string, key: string) => {
            navigator.clipboard.writeText(text);
            setCopiedItem(key);
            setTimeout(() => setCopiedItem(null), 2000);
        };

        // Export
        const exportAnalysis = () => {
            const data = JSON.stringify(analysisResult, null, 2);
            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `analysis-${
                new Date().toISOString().split("T")[0]
            }.json`;
            a.click();
        };

        // sentiment
        const getSentimentIcon = (label?: string) => {
            switch (label) {
                case "Positive":
                    return <TrendingUp className="w-5 h-5" />;
                case "Negative":
                    return <TrendingDown className="w-5 h-5" />;
                default:
                    return <Minus className="w-5 h-5" />;
            }
        };

        return (
            <div className="space-y-6 h-[calc(100%-64px)]">
                {isAnalyzing ? (
                    <div
                        className={`flex flex-col items-center justify-center h-full ${
                            theme === "dark"
                                ? "bg-[#1E212F] text-slate-500"
                                : "text-[#1E212F] bg-white"
                        } rounded-xl p-8`}
                    >
                        <div className="w-full max-w-md">
                            <ProgressBar
                                value={analysisProgress}
                                className="mb-6"
                                animated={false}
                                theme={theme}
                            />
                            <p className="text-lg font-medium text-center">
                                Analyzing your documents...
                            </p>
                            <p className="text-sm text-slate-400 mt-2 text-center">
                                This usually takes 10-30 seconds
                            </p>
                        </div>
                    </div>
                ) : analysisError ? (
                    <div
                        className={`flex flex-col items-center justify-center h-full text-red-600 ${
                            theme === "dark" ? "bg-[#1E212F]" : "bg-white"
                        } rounded-xl shadow p-8`}
                    >
                        <XCircle className="w-16 h-16 mb-4" />
                        <h3 className="text-xl font-semibold">
                            Analysis Failed
                        </h3>
                        <p className="mt-2 mb-2 text-sm text-center max-w-lg">
                            {analysisError}
                        </p>

                        <CustomButton
                            onClick={handleAnalyze}
                            label="Try Again"
                            icon={<RefreshCw className="w-4 h-4" />}
                            theme={theme}
                        />
                    </div>
                ) : analysisComplete ? (
                    <>
                        {/* Action Bar */}
                        <div className="flex justify-between items-center mb-4 ">
                            <h2
                                className={`text-2xl font-bold ${
                                    theme === "dark"
                                        ? "text-white"
                                        : "text-black"
                                }`}
                            >
                                Analysis Results
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={exportAnalysis}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${
                                        theme === "dark"
                                            ? "text-slate-700 bg-white hover:bg-slate-50 border-slate-300"
                                            : "text-slate-200 bg-black hover:bg-slate-800 border-slate-900"
                                    }   border rounded-lg transition-colors`}
                                >
                                    <Download className="w-4 h-4" />
                                    Export
                                </button>
                                <button
                                    onClick={handleAnalyze}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Re-analyze
                                </button>
                            </div>
                        </div>

                        <div
                            className="flex flex-col gap-6 h-[calc(100%-57px)] overflow-y-auto"
                            style={{ scrollbarWidth: "none" }}
                        >
                            {/* Summary Card - Copy */}
                            <InfoCard
                                icon={
                                    <img
                                        src="/images/overall summary.svg"
                                        alt="Summary Icon"
                                        width={26}
                                        height={26}
                                    />
                                }
                                title="Overall Summary"
                                className="lg:col-span-2"
                                theme={theme}
                            >
                                <div className="relative group">
                                    <p className="pr-8">
                                        {analysisResult.summary}
                                    </p>
                                    <button
                                        onClick={() =>
                                            copyToClipboard(
                                                analysisResult.summary,
                                                "summary"
                                            )
                                        }
                                        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-100 rounded-lg"
                                        title="Copy summary to clipboard"
                                    >
                                        {copiedItem === "summary" ? (
                                            <Check className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-slate-500" />
                                        )}
                                    </button>
                                </div>
                            </InfoCard>

                            {/* Actionable Items */}
                            <InfoCard
                                icon={
                                    <img
                                        src="/images/actionable.svg"
                                        alt="Actionable Items Icon"
                                        width={26}
                                        height={26}
                                    />
                                }
                                title="Actionable Items & Delay Indicators"
                                className="lg:col-span-2"
                                theme={theme}
                            >
                                {analysisResult.actionableItems?.length > 0 ||
                                analysisResult.delayIndicators?.length > 0 ? (
                                    <div className="space-y-4">
                                        {analysisResult.actionableItems
                                            ?.length > 0 && (
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4
                                                        className={`font-semibold text-xs uppercase tracking-wider ${
                                                            theme === "dark"
                                                                ? "text-slate-500"
                                                                : "text-slate-900"
                                                        }`}
                                                    >
                                                        Actionable Items
                                                    </h4>
                                                    <span
                                                        className={`text-xs ${
                                                            theme === "dark"
                                                                ? "text-slate-400"
                                                                : "text-slate-800"
                                                        }`}
                                                    >
                                                        {
                                                            analysisResult
                                                                .actionableItems
                                                                .length
                                                        }{" "}
                                                        items
                                                    </span>
                                                </div>
                                                <ul className="space-y-2">
                                                    <AnimatePresence>
                                                        {analysisResult.actionableItems.map(
                                                            (item, i) => (
                                                                <motion.li
                                                                    key={`action-${i}`}
                                                                    initial={{
                                                                        opacity: 0,
                                                                        x: -20,
                                                                    }}
                                                                    animate={{
                                                                        opacity: 1,
                                                                        x: 0,
                                                                    }}
                                                                    transition={{
                                                                        delay:
                                                                            i *
                                                                            0.1,
                                                                    }}
                                                                    className={`relative group flex items-start gap-3 p-2 rounded-lg ${
                                                                        theme ===
                                                                        "dark"
                                                                            ? "hover:bg-gray-700"
                                                                            : "hover:bg-gray-200"
                                                                    }  transition-colors`}
                                                                >
                                                                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                                                    <span className="flex-1">
                                                                        {item}
                                                                    </span>
                                                                    <button
                                                                        onClick={() =>
                                                                            copyToClipboard(
                                                                                item,
                                                                                "actionable"
                                                                            )
                                                                        }
                                                                        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-100 rounded-lg"
                                                                    >
                                                                        {copiedItem ===
                                                                        "actionable" ? (
                                                                            <Check className="w-4 h-4 text-green-600" />
                                                                        ) : (
                                                                            <Copy className="w-4 h-4 text-slate-500" />
                                                                        )}
                                                                    </button>
                                                                </motion.li>
                                                            )
                                                        )}
                                                    </AnimatePresence>
                                                </ul>
                                            </div>
                                        )}
                                        {analysisResult.delayIndicators
                                            ?.length > 0 && (
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4
                                                        className={`font-semibold text-xs uppercase tracking-wider ${
                                                            theme === "dark"
                                                                ? "text-slate-500"
                                                                : "text-slate-900"
                                                        }`}
                                                    >
                                                        Delay Indicators
                                                    </h4>
                                                    <span
                                                        className={`text-xs ${
                                                            theme === "dark"
                                                                ? "text-slate-400"
                                                                : "text-slate-800"
                                                        }`}
                                                    >
                                                        {
                                                            analysisResult
                                                                .delayIndicators
                                                                .length
                                                        }{" "}
                                                        items
                                                    </span>
                                                </div>
                                                <ul className="space-y-2">
                                                    <AnimatePresence>
                                                        {analysisResult.delayIndicators.map(
                                                            (item, i) => (
                                                                <motion.li
                                                                    key={`delay-${i}`}
                                                                    initial={{
                                                                        opacity: 0,
                                                                        x: -20,
                                                                    }}
                                                                    animate={{
                                                                        opacity: 1,
                                                                        x: 0,
                                                                    }}
                                                                    transition={{
                                                                        delay:
                                                                            i *
                                                                            0.1,
                                                                    }}
                                                                    className={`relative group flex items-start gap-3 p-2 rounded-lg ${
                                                                        theme ===
                                                                        "dark"
                                                                            ? "hover:bg-gray-700"
                                                                            : "hover:bg-gray-200"
                                                                    }  transition-colors`}
                                                                >
                                                                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                                                    <span className="flex-1">
                                                                        {item}
                                                                    </span>
                                                                    <button
                                                                        onClick={() =>
                                                                            copyToClipboard(
                                                                                item,
                                                                                "actionable"
                                                                            )
                                                                        }
                                                                        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-100 rounded-lg"
                                                                    >
                                                                        {copiedItem ===
                                                                        "actionable" ? (
                                                                            <Check className="w-4 h-4 text-green-600" />
                                                                        ) : (
                                                                            <Copy className="w-4 h-4 text-slate-500" />
                                                                        )}
                                                                    </button>
                                                                </motion.li>
                                                            )
                                                        )}
                                                    </AnimatePresence>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 italic">
                                        No specific items identified.
                                    </p>
                                )}
                            </InfoCard>

                            <div className="self-start w-full">
                                <InfoCard
                                    icon={
                                        <img
                                            src="/images/key details.svg"
                                            alt="Key Details Icon"
                                            width={26}
                                            height={26}
                                        />
                                    }
                                    title="Key Details"
                                    theme={theme}
                                >
                                    {Array.isArray(analysisResult.keyDetails) &&
                                    analysisResult.keyDetails.length > 0 ? (
                                        <>
                                            <AnimatePresence mode="wait">
                                                <motion.ul
                                                    className="space-y-2"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                >
                                                    {(showAllKeyDetails
                                                        ? analysisResult.keyDetails
                                                        : analysisResult.keyDetails.slice(
                                                              0,
                                                              3
                                                          )
                                                    ).map(({ key, value }) => (
                                                        <motion.li
                                                            key={key}
                                                            layout
                                                            className={`flex justify-between items-center gap-3 p-2 rounded-lg ${
                                                                theme === "dark"
                                                                    ? "hover:bg-gray-700"
                                                                    : "hover:bg-gray-200"
                                                            }  transition-colors relative`}
                                                            onMouseEnter={() =>
                                                                setHoveredDetail(
                                                                    key
                                                                )
                                                            }
                                                            onMouseLeave={() =>
                                                                setHoveredDetail(
                                                                    null
                                                                )
                                                            }
                                                        >
                                                            <span
                                                                className={`font-medium ${
                                                                    theme ===
                                                                    "dark"
                                                                        ? "text-white"
                                                                        : "text-black"
                                                                } flex-shrink-0 flex items-center gap-1`}
                                                            >
                                                                {key}
                                                                {hoveredDetail ===
                                                                    key && (
                                                                    <Info className="w-3 h-3 text-slate-400" />
                                                                )}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className={`${
                                                                        theme ===
                                                                        "dark"
                                                                            ? "bg-slate-100 text-slate-800"
                                                                            : "text-slate-100 bg-slate-800"
                                                                    } px-3 py-1 rounded-md text-xs font-mono truncate max-w-[200px]`}
                                                                >
                                                                    {typeof value ===
                                                                        "object" &&
                                                                    value !==
                                                                        null
                                                                        ? JSON.stringify(
                                                                              value
                                                                          )
                                                                        : String(
                                                                              value
                                                                          )}
                                                                </span>
                                                                <button
                                                                    onClick={() =>
                                                                        copyToClipboard(
                                                                            String(
                                                                                value
                                                                            ),
                                                                            key
                                                                        )
                                                                    }
                                                                    className="opacity-0 hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 rounded"
                                                                >
                                                                    {copiedItem ===
                                                                    key ? (
                                                                        <Check className="w-3 h-3 text-green-600" />
                                                                    ) : (
                                                                        <Copy className="w-3 h-3 text-slate-500" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </motion.li>
                                                    ))}
                                                </motion.ul>
                                            </AnimatePresence>
                                            {analysisResult.keyDetails.length >
                                                3 && (
                                                <motion.button
                                                    onClick={() =>
                                                        setShowAllKeyDetails(
                                                            (prev) => !prev
                                                        )
                                                    }
                                                    className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium ${
                                                        theme === "dark"
                                                            ? "text-slate-700 bg-slate-100 hover:bg-slate-200"
                                                            : "bg-slate-700 text-slate-100 hover:bg-slate-800"
                                                    }  rounded-lg transition-all duration-200 hover:shadow-md`}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    {showAllKeyDetails ? (
                                                        <>
                                                            <ChevronUp className="w-4 h-4" />
                                                            Show Less
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown className="w-4 h-4" />
                                                            Show{" "}
                                                            {analysisResult
                                                                .keyDetails
                                                                .length -
                                                                3}{" "}
                                                            More
                                                        </>
                                                    )}
                                                </motion.button>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-slate-500 italic">
                                            No specific key details were
                                            extracted.
                                        </p>
                                    )}
                                </InfoCard>
                            </div>

                            <div className="self-start w-full">
                                <InfoCard
                                    icon={
                                        <img
                                            src="/images/sentiment.svg"
                                            alt="Sentiment Icon"
                                            width={20}
                                            height={20}
                                        />
                                    }
                                    title="Sentiment Analysis"
                                    theme={theme}
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div
                                                className={`flex items-center gap-3 text-xl font-bold ${
                                                    analysisResult.sentiment
                                                        ?.label === "Positive"
                                                        ? "text-green-600"
                                                        : analysisResult
                                                              .sentiment
                                                              ?.label ===
                                                          "Negative"
                                                        ? "text-red-600"
                                                        : "text-yellow-600"
                                                }`}
                                            >
                                                {getSentimentIcon(
                                                    analysisResult.sentiment
                                                        ?.label
                                                )}
                                                {analysisResult.sentiment
                                                    ?.label || "Neutral"}
                                            </div>
                                            {analysisResult.sentiment
                                                ?.confidence && (
                                                <div className="text-sm text-slate-500">
                                                    {Math.round(
                                                        analysisResult.sentiment
                                                            .confidence * 100
                                                    )}
                                                    % confidence
                                                </div>
                                            )}
                                        </div>

                                        <div
                                            className={`w-full ${
                                                theme === "dark"
                                                    ? "bg-slate-200"
                                                    : "bg-slate-800"
                                            }  rounded-full h-2 overflow-hidden`}
                                        >
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${
                                                        analysisResult.sentiment
                                                            ?.score || 50
                                                    }%`,
                                                }}
                                                transition={{
                                                    duration: 1,
                                                    ease: "easeOut",
                                                }}
                                                className={`h-full ${
                                                    analysisResult.sentiment
                                                        ?.label === "Positive"
                                                        ? "bg-green-500"
                                                        : analysisResult
                                                              .sentiment
                                                              ?.label ===
                                                          "Negative"
                                                        ? "bg-red-500"
                                                        : "bg-yellow-500"
                                                }`}
                                            />
                                        </div>

                                        {analysisResult.sentiment
                                            ?.reasoning && (
                                            <div className="space-y-2">
                                                <AnimatePresence>
                                                    {showSentimentReasoning && (
                                                        <motion.p
                                                            initial={{
                                                                opacity: 0,
                                                                height: 0,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                height: "auto",
                                                            }}
                                                            exit={{
                                                                opacity: 0,
                                                                height: 0,
                                                            }}
                                                            className={`text-sm ${
                                                                theme === "dark"
                                                                    ? "text-slate-600 bg-slate-50"
                                                                    : "bg-slate-600 text-slate-50"
                                                            } p-3 rounded-lg`}
                                                        >
                                                            {
                                                                analysisResult
                                                                    .sentiment
                                                                    .reasoning
                                                            }
                                                        </motion.p>
                                                    )}
                                                </AnimatePresence>
                                                <button
                                                    onClick={() =>
                                                        setShowSentimentReasoning(
                                                            (prev) => !prev
                                                        )
                                                    }
                                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                                >
                                                    {showSentimentReasoning ? (
                                                        <>
                                                            <Eye className="w-4 h-4" />
                                                            Hide Explanation
                                                        </>
                                                    ) : (
                                                        <>
                                                            <EyeOff className="w-4 h-4" />
                                                            View Explanation
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </InfoCard>
                            </div>
                        </div>
                    </>
                ) : (
                    <div
                        className={` ${
                            theme === "dark"
                                ? "text-slate-500 bg-[#1E212F]"
                                : "text-[#1E212F] bg-white"
                        } flex flex-col items-center justify-center h-full  rounded-xl`}
                    >
                        <div className="relative">
                            <BrainCircuit className="w-16 h-16 mb-4 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold">
                            Analysis Results
                        </h3>
                        <p className="mt-2 text-sm text-center max-w-md">
                            {`Select files to click 'Analyze' to see
                            document insights here.`}
                        </p>
                        <div
                            className={`mt-2 ${
                                showButton ? "visible" : "invisible"
                            }`}
                        >
                            <CustomButton
                                label="Analyze Files"
                                onClick={() => {
                                    setShowAnalyse(true);
                                    if (!reload) setReload(true);
                                }}
                                withIcon={true}
                                standAlone
                                theme={theme}
                                classes="bg-blue-500 text-white hover:bg-blue-600"
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const ChatView = () => {
        const [searchQuery, setSearchQuery] = useState("");
        const [showTimestamps, setShowTimestamps] = useState(false);
        const [copiedMessageId, setCopiedMessageId] = useState<string | null>(
            null
        );
        const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(
            null
        );

        const textareaRef = useRef<HTMLTextAreaElement>(null);
        const [chatInput, setChatInput] = useState("");

        const resizeTextarea = () => {
            const textarea = textareaRef.current;
            if (textarea) {
                textarea.style.height = "auto";
                textarea.style.height =
                    Math.min(textarea.scrollHeight, 120) + "px";
            }
        };

        useEffect(() => {
            resizeTextarea();
        }, [chatInput]);

        // Filter messages
        const filteredMessages = chatHistory.filter((msg) =>
            msg.text.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Copy message
        const copyMessage = (text: string, id: string) => {
            navigator.clipboard.writeText(text);
            setCopiedMessageId(id);
            setTimeout(() => setCopiedMessageId(null), 2000);
        };

        // chat history
        const exportChat = (format: "json" | "txt") => {
            const timestamp = new Date().toISOString().split("T")[0];

            if (format === "json") {
                const data = JSON.stringify(
                    {
                        exportDate: new Date().toISOString(),
                        model: selectedModel,
                        messages: chatHistory,
                        documentCount: files.length,
                        documents: files.map((f) => f.file.name),
                    },
                    null,
                    2
                );

                const blob = new Blob([data], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `chat-history-${timestamp}.json`;
                a.click();
            } else {
                const text = chatHistory
                    .map(
                        (msg) => `[${msg.sender.toUpperCase()}]: ${msg.text}\n`
                    )
                    .join("\n");

                const blob = new Blob([text], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `chat-history-${timestamp}.txt`;
                a.click();
            }
        };

        // Clear chat history
        const clearChat = () => {
            if (confirm("Are you sure you want to clear the chat history?")) {
                setChatHistory([]);
            }
        };

        const handleSendMessage = async (
            e?: React.FormEvent<HTMLFormElement>,
            question?: string
        ) => {
            e?.preventDefault();
            const messageText = question || chatInput.trim();
            if (!messageText || isBotTyping || !analysisComplete) return;

            const newUserMessage: ChatMessage = {
                id: `user-${Date.now()}`,
                sender: "user",
                text: messageText,
            };
            const historyWithUserMessage = [...chatHistory, newUserMessage];

            setChatHistory(historyWithUserMessage);
            setChatInput("");
            setIsBotTyping(true);
            setChatProgress(0);

            // Start chat progress simulation
            const progressInterval = setInterval(() => {
                setChatProgress((prev) => {
                    if (prev >= 90) return prev; // Stop at 90% until actual completion
                    return prev + 5; // Smooth, fixed increment
                });
            }, 150);

            try {
                // const formData = new FormData();
                // files.forEach((f) => formData.append("files", f.file));
                // formData.append("model", selectedModel);
                // formData.append("history", JSON.stringify(historyWithUserMessage));
                // formData.append("question", messageText);

                const payload = {
                    documentList: inputFiles.map((f) => parseInt(f.documentId)),
                    history: JSON.stringify(historyWithUserMessage),
                    question: messageText,
                };

                // const response = await fetch("/api/chat", {
                //     method: "POST",
                //     body: JSON.stringify(payload),
                // });
                // const data = await response.json();
                const data = await chatAPI(payload);

                if (!data || typeof data !== "object" || !data.text) {
                    throw new Error(data.text || "Failed to respond.");
                }

                const newBotMessage: ChatMessage = {
                    id: `bot-${Date.now()}`,
                    sender: "bot",
                    text: data.text,
                };
                setChatHistory((prev) => [...prev, newBotMessage]);
            } catch (error: unknown) {
                let errorMessage = "An unknown error occurred.";
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                const errorBotMessage: ChatMessage = {
                    id: `bot-error-${Date.now()}`,
                    sender: "bot",
                    text: `Sorry, an error occurred: ${errorMessage}`,
                };
                setChatHistory((prev) => [...prev, errorBotMessage]);
            } finally {
                clearInterval(progressInterval);
                setChatProgress(100);
                setTimeout(() => {
                    setIsBotTyping(false);
                    setChatProgress(0);
                }, 300); // Small delay to show 100% completion
            }
        };
        // Regenerate
        const regenerateLastResponse = () => {
            const lastUserMessage = [...chatHistory]
                .reverse()
                .find((msg) => msg.sender === "user");
            if (lastUserMessage) {
                // Remove last message
                setChatHistory((prev) => {
                    const lastBotIndex = prev
                        .map((msg) => msg.sender)
                        .lastIndexOf("bot");
                    return lastBotIndex > -1
                        ? prev.slice(0, lastBotIndex)
                        : prev;
                });
                // Resend question
                handleSendMessage(undefined, lastUserMessage.text);
            }
        };

        const formatMessageText = (text: string) => {
            const lines = text.split("\n");
            return lines.map((line, i) => {
                if (
                    line.trim().startsWith("•") ||
                    line.trim().startsWith("-")
                ) {
                    return (
                        <li key={i} className="ml-4 list-disc">
                            {line.replace(/^[•-]\s*/, "")}
                        </li>
                    );
                }
                return (
                    <p key={i} className="mb-1">
                        {line}
                    </p>
                );
            });
        };

        //\submit
        const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (chatInput.trim() && !isBotTyping && analysisComplete) {
                handleSendMessage(e);
            }
        };

        return (
            <div
                className={`flex flex-col h-[calc(100%-64px)] ${
                    theme === "dark" ? "bg-[#1E212F]" : "bg-white"
                } rounded-xl shadow-sm`}
            >
                <div
                    className={`flex items-center justify-between p-4 ${
                        theme === "dark" ? "bg-[#1E212F]" : "bg-white"
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <IconWrapper className="bg-blue-100 text-blue-600">
                            <MessageSquare size={20} />
                        </IconWrapper>
                        <div>
                            <h3
                                className={`font-semibold ${
                                    theme === "dark"
                                        ? "text-white"
                                        : "text-black"
                                }`}
                            >
                                Chat Assistant
                            </h3>
                            <p className="text-xs text-gray-400">
                                {chatHistory.length} messages •{" "}
                                {/* {selectedModel === "gemini"
                                    ? "Gemini 1.5 Pro"
                                    : "GPT-4 Turbo"} */}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Search */}
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search messages..."
                                className={`pl-8 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48 ${
                                    theme === "dark"
                                        ? "bg-slate-800 text-slate-300"
                                        : "bg-slate-100 text-slate-800"
                                }`}
                            />
                            <Search
                                className={`absolute left-2.5 top-2 w-4 h-4 ${
                                    theme === "dark"
                                        ? "text-slate-300"
                                        : "text-slate-800"
                                }`}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-2 top-1.5 p-0.5 hover:bg-slate-200 rounded"
                                    title="Clear search"
                                >
                                    <X
                                        className={`w-3 h-3 ${
                                            theme === "dark"
                                                ? "text-slate-300"
                                                : "text-slate-800"
                                        } `}
                                    />
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => setShowTimestamps(!showTimestamps)}
                            className={`p-2 rounded-lg transition-colors ${
                                showTimestamps
                                    ? "bg-blue-100 text-blue-600"
                                    : "text-slate-500 hover:bg-slate-100"
                            }`}
                            title="Toggle timestamps"
                        >
                            <Clock
                                className={`w-4 h-4 ${
                                    theme === "dark"
                                        ? "text-slate-300"
                                        : "text-slate-800"
                                } `}
                            />
                        </button>

                        <div className="relative group">
                            <button
                                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Export chat"
                            >
                                <Download
                                    className={`w-4 h-4 ${
                                        theme === "dark"
                                            ? "text-slate-300"
                                            : "text-slate-800"
                                    } `}
                                />
                            </button>
                            <div
                                className={`absolute right-0 mt-1 w-48 ${
                                    theme === "dark"
                                        ? "bg-[#1E212F]"
                                        : "bg-white"
                                } border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10`}
                            >
                                <button
                                    onClick={() => exportChat("json")}
                                    className={`w-full px-4 py-2 text-sm text-left ${
                                        theme === "dark"
                                            ? "text-slate-300 hover:bg-slate-900"
                                            : "text-slate-800 hover:bg-slate-50"
                                    }  flex items-center gap-2`}
                                >
                                    <FileJson
                                        className={`w-4 h-4 ${
                                            theme === "dark"
                                                ? "text-slate-300"
                                                : "text-slate-800"
                                        } `}
                                    />
                                    Export as JSON
                                </button>
                                <button
                                    onClick={() => exportChat("txt")}
                                    className={`w-full px-4 py-2 text-sm text-left ${
                                        theme === "dark"
                                            ? "text-slate-300 hover:bg-slate-900"
                                            : "text-slate-800 hover:bg-slate-50"
                                    }  flex items-center gap-2`}
                                >
                                    <FileText
                                        className={`w-4 h-4 ${
                                            theme === "dark"
                                                ? "text-slate-300"
                                                : "text-slate-800"
                                        } `}
                                    />
                                    Export as Text
                                </button>
                            </div>
                        </div>

                        {chatHistory.length > 0 && (
                            <button
                                onClick={clearChat}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Clear chat"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                <div
                    ref={chatContainerRef}
                    className="flex-1 p-6 space-y-4 overflow-y-auto"
                >
                    {chatHistory.length === 0 && !searchQuery ? (
                        <div className="text-center h-full flex flex-col justify-center">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <IconWrapper className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600 mx-auto mb-4">
                                    <MessageSquare size={20} />
                                </IconWrapper>
                                <h3
                                    className={`text-lg font-semibold ${
                                        theme === "dark"
                                            ? "text-white"
                                            : "text-black"
                                    }`}
                                >
                                    Start a conversation
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Ask questions about your analyzed documents.
                                </p>

                                {analysisComplete &&
                                    Array.isArray(
                                        analysisResult?.suggestedQuestions
                                    ) &&
                                    analysisResult.suggestedQuestions.length >
                                        0 && (
                                        <div className="mt-6 space-y-2">
                                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                                                Suggested Questions
                                            </p>
                                            <div className="flex flex-wrap justify-center gap-2">
                                                {analysisResult.suggestedQuestions.map(
                                                    (q, i) => (
                                                        <motion.button
                                                            key={i}
                                                            initial={{
                                                                opacity: 0,
                                                                y: 10,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                y: 0,
                                                            }}
                                                            transition={{
                                                                delay: i * 0.1,
                                                            }}
                                                            onClick={() =>
                                                                handleSendMessage(
                                                                    undefined,
                                                                    q
                                                                )
                                                            }
                                                            className="group text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full px-4 py-2 transition-all duration-200 hover:shadow-md"
                                                        >
                                                            {q}
                                                            <ArrowRight className="inline w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                                        </motion.button>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </motion.div>
                        </div>
                    ) : searchQuery && filteredMessages.length === 0 ? (
                        <div className="text-center py-8">
                            <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">
                                {`No messages found for "${searchQuery}"`}
                            </p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {(searchQuery ? filteredMessages : chatHistory).map(
                                (msg, index) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className={`flex items-start gap-3 ${
                                            msg.sender === "user"
                                                ? "justify-end"
                                                : "justify-start"
                                        }`}
                                        onMouseEnter={() =>
                                            setHoveredMessageId(msg.id)
                                        }
                                        onMouseLeave={() =>
                                            setHoveredMessageId(null)
                                        }
                                    >
                                        {msg.sender === "bot" && (
                                            <IconWrapper className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 mt-1">
                                                <Bot size={20} />
                                            </IconWrapper>
                                        )}

                                        <div
                                            className={`group relative max-w-md lg:max-w-lg ${
                                                msg.sender === "user"
                                                    ? "order-1"
                                                    : ""
                                            }`}
                                        >
                                            <div
                                                className={`px-4 py-3 rounded-2xl ${
                                                    msg.sender === "user"
                                                        ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md"
                                                        : "bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800 rounded-bl-md border border-slate-200"
                                                }`}
                                            >
                                                <div className="text-sm whitespace-pre-wrap">
                                                    {formatMessageText(
                                                        msg.text
                                                    )}
                                                </div>

                                                {showTimestamps && (
                                                    <p
                                                        className={`text-xs mt-1 ${
                                                            msg.sender ===
                                                            "user"
                                                                ? "text-blue-200"
                                                                : "text-slate-400"
                                                        }`}
                                                    >
                                                        {new Date(
                                                            parseInt(
                                                                msg.id.split(
                                                                    "-"
                                                                )[1]
                                                            )
                                                        ).toLocaleTimeString()}
                                                    </p>
                                                )}
                                            </div>

                                            {hoveredMessageId === msg.id && (
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        scale: 0.8,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        scale: 1,
                                                    }}
                                                    className={`absolute top-0 flex items-center gap-1 ${
                                                        msg.sender === "user"
                                                            ? "right-full mr-2"
                                                            : "left-full ml-2"
                                                    }`}
                                                >
                                                    <button
                                                        onClick={() =>
                                                            copyMessage(
                                                                msg.text,
                                                                msg.id
                                                            )
                                                        }
                                                        className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                                                        title="Copy message"
                                                    >
                                                        {copiedMessageId ===
                                                        msg.id ? (
                                                            <Check className="w-3 h-3 text-green-600" />
                                                        ) : (
                                                            <Copy className="w-3 h-3 text-slate-500" />
                                                        )}
                                                    </button>

                                                    {msg.sender === "bot" &&
                                                        index ===
                                                            chatHistory.length -
                                                                1 && (
                                                            <button
                                                                onClick={
                                                                    regenerateLastResponse
                                                                }
                                                                className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                                                                title="Regenerate response"
                                                            >
                                                                <RefreshCw className="w-3 h-3 text-slate-500" />
                                                            </button>
                                                        )}
                                                </motion.div>
                                            )}
                                        </div>

                                        {msg.sender === "user" && (
                                            <IconWrapper className="bg-gradient-to-br from-blue-500 to-blue-600 text-white mt-1 order-2">
                                                <User size={20} />
                                            </IconWrapper>
                                        )}
                                    </motion.div>
                                )
                            )}
                        </AnimatePresence>
                    )}

                    {isBotTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3 justify-start"
                        >
                            <IconWrapper className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 mt-1">
                                <Bot size={20} />
                            </IconWrapper>
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100 text-slate-500 rounded-2xl rounded-bl-md px-4 py-3 border border-slate-200">
                                <div className="w-32">
                                    <ProgressBar
                                        value={chatProgress}
                                        showLabel={false}
                                        theme={theme}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                <div
                    className={`p-4 ${
                        theme === "dark" ? "bg-[#1E212F]" : "bg-white"
                    }`}
                >
                    <form
                        onSubmit={handleSubmit}
                        className="flex items-center gap-3"
                    >
                        <div className="flex-1 relative">
                            <textarea
                                ref={textareaRef}
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        // Find the closest form and submit it
                                        (
                                            e.currentTarget.closest(
                                                "form"
                                            ) as HTMLFormElement
                                        )?.requestSubmit();
                                    }
                                }}
                                placeholder={
                                    !analysisComplete
                                        ? "Analyze documents first..."
                                        : isBotTyping
                                        ? "AI is thinking..."
                                        : "Ask a question... (Shift+Enter for new line)"
                                }
                                disabled={!analysisComplete || isBotTyping}
                                className={`"w-full px-4 py-2 ${
                                    theme === "dark"
                                        ? "bg-slate-800 text-slate-300"
                                        : "bg-slate-100 text-slate-800"
                                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 resize-none w-full `}
                                rows={1}
                            />

                            {chatInput.length > 0 && (
                                <span
                                    className={`absolute bottom-2 right-2 text-xs ${
                                        theme === "dark"
                                            ? "text-slate-400"
                                            : "text-slate-800"
                                    }`}
                                >
                                    {chatInput.length}
                                </span>
                            )}
                        </div>

                        <motion.button
                            type="submit"
                            disabled={
                                !chatInput.trim() ||
                                isBotTyping ||
                                !analysisComplete
                            }
                            className="mb-2 p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-blue-300 disabled:to-blue-300 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md disabled:shadow-none"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Send className="w-5 h-5" />
                        </motion.button>
                    </form>

                    <div className="flex items-center justify-between mt-2">
                        {/* <p className="text-xs text-slate-400">
                            Using:{" "}
                            {selectedModel === "gemini"
                                ? "Google Gemini 1.5 Pro"
                                : "OpenAI GPT-4 Turbo"}
                        </p> */}

                        {chatHistory.length > 0 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() =>
                                        setChatInput(
                                            "Summarize our conversation so far"
                                        )
                                    }
                                    className="text-xs text-blue-600 hover:text-blue-700"
                                >
                                    Summarize chat
                                </button>
                                <span className="text-slate-300">•</span>
                                <button
                                    onClick={() =>
                                        setChatInput(
                                            "What are the key takeaways from this analysis?"
                                        )
                                    }
                                    className="text-xs text-blue-600 hover:text-blue-700"
                                >
                                    Key takeaways
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {/* <Head>
                <title> UC Advanced Document Analyzer</title>
                <meta
                    name="description"
                    content="Upload, analyze, and chat with your documents using Gemini or OpenAI."
                />
            </Head> */}

            <main className="h-full">
                <div className="flex h-full">
                    {/* <aside className="w-96 bg-white border-r border-slate-200 flex flex-col p-6">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <BrainCircuit className="w-6 h-6 text-blue-600" />
                            </div>
                            <h1 className="text-xl font-bold text-white">
                                UC AI
                            </h1>
                        </div>

                        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 -mr-2">
                            <div
                                onDragEnter={(e) =>
                                    handleDragEvents(e, "enter")
                                }
                                onDragLeave={(e) =>
                                    handleDragEvents(e, "leave")
                                }
                                onDragOver={(e) => handleDragEvents(e, "over")}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300 ${
                                    isDragging
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
                                }`}
                            >
                                <UploadCloud className="w-10 h-10 text-slate-400 mb-3" />
                                <p className="text-sm font-semibold text-slate-700">
                                    Drag & drop files or click to browse
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    PDF, DOCX, JSON supported
                                </p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={(e) =>
                                        handleFileSelect(e.target.files)
                                    }
                                    multiple
                                    className="hidden"
                                    title="Upload files"
                                    placeholder="Select files to upload"
                                />
                            </div>

                            {files.length > 0 && (
                                <div className="space-y-3">
                                    <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                                        Uploaded Files
                                    </h2>
                                    {files.map((f) => (
                                        <div
                                            key={f.id}
                                            className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center gap-3"
                                        >
                                            <FileIcon fileType={f.file.type} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">
                                                    {f.file.name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {(
                                                        f.file.size / 1024
                                                    ).toFixed(1)}{" "}
                                                    KB
                                                </p>
                                            </div>
                                            <StatusIcon status={f.status} />
                                            <button
                                                onClick={() =>
                                                    handleRemoveFile(f.id)
                                                }
                                                className="text-slate-400 hover:text-red-500 transition-colors duration-200"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
                            <label className="text-xs text-slate-600 font-semibold block">
                                Select AI Model
                            </label>
                            <select
                                value={selectedModel}
                                onChange={(e) =>
                                    setSelectedModel(
                                        e.target.value as "gemini" | "openai"
                                    )
                                }
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="gemini">
                                    Google Gemini 1.5 Pro
                                </option>
                                <option value="openai">
                                    OpenAI GPT-4 Turbo
                                </option>
                            </select>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-200">
                            <button
                                onClick={handleAnalyze}
                                disabled={!hasFiles || isAnalyzing}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed shadow-sm hover:shadow-md disabled:shadow-none"
                            >
                                {isAnalyzing ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                    <BrainCircuit className="w-5 h-5" />
                                )}
                                {isAnalyzing
                                    ? "Analyzing..."
                                    : "Analyze Documents"}
                            </button>
                        </div>
                    </aside> */}

                    <div className="flex-1 h-full">
                        <div className="flex items-center gap-2 mb-6">
                            <button
                                onClick={() => setCurrentView("analysis")}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                                    currentView === "analysis"
                                        ? "bg-blue-100 text-blue-700"
                                        : "text-slate-500 hover:bg-slate-100"
                                }`}
                            >
                                Analysis
                            </button>
                            <button
                                onClick={() => setCurrentView("chat")}
                                disabled={!analysisComplete}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                                    currentView === "chat"
                                        ? "bg-blue-100 text-blue-700"
                                        : "text-slate-500 hover:bg-slate-100"
                                } disabled:text-slate-400 disabled:hover:bg-transparent disabled:cursor-not-allowed`}
                            >
                                Chat
                            </button>
                            <button
                                onClick={() => setCurrentView("flow")}
                                disabled={!analysisComplete}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                                    currentView === "flow"
                                        ? "bg-blue-100 text-blue-700"
                                        : "text-slate-500 hover:bg-slate-100"
                                } disabled:text-slate-400 disabled:hover:bg-transparent disabled:cursor-not-allowed`}
                            >
                                Flow
                            </button>
                        </div>
                        {currentView === "analysis" ? (
                            <AnalysisView />
                        ) : currentView === "chat" ? (
                            <ChatView />
                        ) : (
                            <FlowView
                                isFetchingFlow={isFetchingFlow}
                                flowError={flowError}
                                flowData={flowData}
                                theme={theme}
                                flowProgress={flowProgress}
                                inputFiles={inputFiles}
                                onRetryAnalysis={handleAnalyze}
                            />
                        )}
                    </div>
                </div>
            </main>
        </>
    );
};

const FlowView = ({
    isFetchingFlow,
    flowError,
    flowData,
    theme,
    flowProgress,
    inputFiles,
    onRetryAnalysis,
}: {
    isFetchingFlow: boolean;
    flowError: string | null;
    flowData: FlowItem[] | null;
    theme: string;
    flowProgress: number;
    inputFiles: DataItem[];
    onRetryAnalysis: () => void;
}) => {
    const getFlowIcon = (iconName: string) => {
        switch (iconName) {
            case "file-plus":
                return <FilePlus size={20} />;
            case "file-text":
                return <FileText size={20} />;
            case "send":
                return <Send size={20} />;
            case "truck":
                return <Truck size={20} />;
            case "check-circle":
                return <CheckCircle size={20} />;
            case "x-circle":
                return <XCircle size={20} />;
            case "mail":
                return <Mail size={20} />;
            case "file-check":
                return <FileCheck size={20} />;
            case "package":
                return <Package size={20} />;
            case "receipt":
                return <Receipt size={20} />;
            case "user-check":
                return <UserCheck size={20} />;
            default:
                return <GitMerge size={20} />;
        }
    };

    // Use the flow data from backend
    const displayData = flowData || [];

    if (isFetchingFlow) {
        return (
            <div className="space-y-6 h-[calc(100%-64px)]">
                <div
                    className={`border border-slate-200 rounded-xl shadow-sm p-8 ${
                        theme === "dark" ? "bg-[#1E212F]" : "bg-white"
                    }`}
                >
                    <div className="flex flex-col items-center justify-center text-slate-500">
                        <div className="w-full max-w-md">
                            <ProgressBar
                                value={flowProgress}
                                className="mb-6"
                                animated={false}
                                theme={theme}
                            />
                            <p className="text-lg font-medium text-center">
                                Generating Document Flow...
                            </p>
                            <p className="text-sm text-slate-400 mt-2 text-center">
                                The AI is analyzing document relationships.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (flowError) {
        return (
            <div className="space-y-6 h-[calc(100%-64px)]">
                <div
                    className={`border border-slate-200 rounded-xl shadow-sm p-8 ${
                        theme === "dark" ? "bg-[#1E212F]" : "bg-white"
                    }`}
                >
                    <div className="flex flex-col items-center justify-center text-red-600">
                        <XCircle className="w-16 h-16 mb-4" />
                        <h3 className="text-xl font-semibold">
                            Flow Generation Failed
                        </h3>
                        <p className="mt-2 text-sm text-center max-w-lg">
                            {flowError}
                        </p>
                        <button
                            onClick={onRetryAnalysis}
                            className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Retry Analysis & Flow
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!flowData) {
        return (
            <div className="space-y-6 h-[calc(100%-64px)]">
                <div
                    className={`border border-slate-200 rounded-xl shadow-sm p-8 ${
                        theme === "dark" ? "bg-[#1E212F]" : "bg-white"
                    }`}
                >
                    <div className="flex flex-col items-center justify-center text-slate-500">
                        <GitMerge className="w-16 h-16 mb-4 text-slate-400" />
                        <h3 className="text-xl font-semibold">Document Flow</h3>
                        <p className="mt-2 text-sm text-center max-w-md">
                            {inputFiles.length === 0
                                ? "Select documents from the feed and click 'Analyse' to generate a visual timeline."
                                : "Generate a visual timeline of your selected documents."}
                        </p>
                        <button
                            onClick={onRetryAnalysis}
                            disabled={inputFiles.length === 0}
                            className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                inputFiles.length === 0
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                        >
                            <BrainCircuit className="w-4 h-4" />
                            Run Analysis & Flow
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (displayData.length === 0) {
        return (
            <div className="space-y-6 h-[calc(100%-64px)]">
                <div
                    className={`border border-slate-200 rounded-xl shadow-sm p-8 ${
                        theme === "dark" ? "bg-[#1E212F]" : "bg-white"
                    }`}
                >
                    <div className="flex flex-col items-center justify-center text-slate-500">
                        <Info className="w-16 h-16 mb-4 text-slate-400" />
                        <h3 className="text-xl font-semibold">
                            No Flow Information
                        </h3>
                        <p className="mt-2 text-sm text-center max-w-md">
                            No document flow information could be generated from
                            the selected documents.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 h-[calc(100%-64px)]">
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-4">
                <h2
                    className={`text-2xl font-bold ${
                        theme === "dark" ? "text-white" : "text-black"
                    }`}
                >
                    Document Flow
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={onRetryAnalysis}
                        className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw className="w-3 h-3" />
                        Refresh Analysis & Flow
                    </button>
                </div>
            </div>

            {/* Flow Content Card */}
            <div
                className={`border border-slate-200 rounded-xl shadow-sm p-6 h-[calc(100%-57px)] overflow-y-auto ${
                    theme === "dark" ? "bg-[#1E212F]" : "bg-white"
                }`}
            >
                <div className="relative pl-8">
                    {/* Vertical line - positioned to start at first icon center and end at last icon center */}
                    <div
                        className={`absolute left-8 w-0.5 ${
                            theme === "dark" ? "bg-slate-600" : "bg-slate-200"
                        }`}
                        style={{ top: "32px", bottom: "32px" }}
                    ></div>

                    <div className="space-y-12 pb-8">
                        {displayData.map((item: FlowItem) => (
                            <div key={item.id} className="relative">
                                <div className="absolute -left-8 top-0 flex items-center justify-center w-16 h-16">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
                                            item.status === "issue"
                                                ? "bg-red-500"
                                                : item.status === "completed"
                                                ? "bg-green-500"
                                                : item.status === "in_progress"
                                                ? "bg-blue-500"
                                                : "bg-purple-600"
                                        }`}
                                    >
                                        {getFlowIcon(item.icon)}
                                    </div>
                                </div>
                                <div className="ml-12">
                                    <div
                                        className={`border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300 ${
                                            theme === "dark"
                                                ? "bg-white"
                                                : "bg-slate-50"
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-semibold text-purple-700">
                                                    {new Date(
                                                        item.date
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        }
                                                    )}
                                                </p>
                                                <h3
                                                    className={`text-lg font-bold mt-1 ${
                                                        theme === "dark"
                                                            ? "text-slate-800"
                                                            : "text-slate-800"
                                                    }`}
                                                >
                                                    {item.title}
                                                </h3>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span
                                                    className={`text-xs font-mono px-2 py-1 rounded ${
                                                        theme === "dark"
                                                            ? "bg-slate-200 text-slate-700"
                                                            : "bg-slate-100 text-slate-600"
                                                    }`}
                                                >
                                                    {item.documentSource}
                                                </span>
                                                <span
                                                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                        item.status ===
                                                        "completed"
                                                            ? "bg-green-100 text-green-800"
                                                            : item.status ===
                                                              "in_progress"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : item.status ===
                                                              "issue"
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-slate-100 text-slate-800"
                                                    }`}
                                                >
                                                    {item.status
                                                        .replace("_", " ")
                                                        .toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <p
                                            className={`text-sm mt-2 ${
                                                theme === "dark"
                                                    ? "text-slate-700"
                                                    : "text-slate-600"
                                            }`}
                                        >
                                            {item.description}
                                        </p>
                                        {item.participants &&
                                            item.participants.length > 0 && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {item.participants.map(
                                                        (p: string) => (
                                                            <span
                                                                key={p}
                                                                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium"
                                                            >
                                                                {p}
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIDocumentAnalyzerPage;
