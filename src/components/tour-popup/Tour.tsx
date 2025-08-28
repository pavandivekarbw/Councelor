// components/TourPopup.tsx
import { X } from "lucide-react";
import React from "react";

type TourPopupProps = {
    step: number;
    totalSteps: number;
    title: string;
    description: string;
    onNext: () => void;
    onSkip: () => void;
    onClose: () => void;
};

const TourPopup: React.FC<TourPopupProps> = ({
    step,
    totalSteps,
    title,
    description,
    onNext,
    onSkip,
    onClose,
}) => {
    return (
        // <div className="absolute left-[100%] z-50 max-w-sm w-full bg-gray-800 text-white shadow-lg rounded-lg p-4">
        //     <div className="flex justify-between items-center text-sm text-gray-300 mb-2">
        //         <span>
        //             {step} of {totalSteps}
        //         </span>
        //         <button
        //             onClick={onClose}
        //             className="text-gray-400 hover:text-white"
        //         >
        //             &times;
        //         </button>
        //     </div>
        //     <h3 className="text-lg font-semibold mb-1">{title}</h3>
        //     <p className="text-sm text-gray-300 mb-4">{description}</p>
        //     <div className="flex justify-end gap-2">
        //         <button
        //             onClick={onSkip}
        //             className="text-gray-300 hover:text-white text-sm"
        //         >
        //             Skip
        //         </button>
        //         <button
        //             onClick={onNext}
        //             className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1 rounded"
        //         >
        //             Next
        //         </button>
        //     </div>
        // </div>
        <div
            className="relative w-[325px]"
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
        >
            {/* Arrow */}
            <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-[#4B5362] rotate-45 z-[1]"></div>

            {/* Popup Content */}
            <div className="max-w-sm w-full bg-[#4B5362] text-white shadow-lg rounded-lg p-4 relative z-[2]">
                <div className="flex justify-between items-center text-sm text-gray-300 mb-2">
                    <span>
                        {step} of {totalSteps}
                    </span>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <h3 className="text-lg font-semibold mb-1">{title}</h3>
                <p className="text-sm text-gray-300 mb-4">{description}</p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onSkip}
                        className="text-gray-300 hover:text-white text-sm"
                    >
                        Skip
                    </button>
                    <button
                        onClick={onNext}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1 rounded"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TourPopup;
