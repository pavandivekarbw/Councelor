import * as React from "react";

interface ProgressBarProps {
    value: number;
    className?: string;
    showLabel?: boolean;
    animated?: boolean;
    theme?: string;
}

export function ProgressBar({
    value,
    className = "",
    showLabel = true,
    animated = false,
    theme = "light",
}: ProgressBarProps) {
    const [animatedValue, setAnimatedValue] = React.useState(0);

    React.useEffect(() => {
        if (animated) {
            const interval = setInterval(() => {
                setAnimatedValue((prev) => {
                    if (prev >= value) return value;
                    return prev + Math.random() * 15 + 5;
                });
            }, 200);

            return () => clearInterval(interval);
        } else {
            setAnimatedValue(value);
        }
    }, [value, animated]);

    const displayValue = animated ? animatedValue : value;

    return (
        <div className={`w-full ${className}`}>
            {showLabel && (
                <div
                    className={`flex justify-between text-sm mb-2 ${
                        theme === "dark" ? "text-slate-400" : "text-slate-600"
                    }`}
                >
                    <span>Processing...</span>
                    <span>{Math.round(displayValue)}%</span>
                </div>
            )}
            <div
                className={`w-full rounded-full h-3 overflow-hidden ${
                    theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                }`}
            >
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(displayValue, 100)}%` }}
                />
            </div>
        </div>
    );
}

export function ProgressDemo() {
    const [progress, setProgress] = React.useState(13);

    React.useEffect(() => {
        const timer = setTimeout(() => setProgress(66), 500);
        return () => clearTimeout(timer);
    }, []);

    return <ProgressBar value={progress} className="w-[60%]" />;
}
