import React from "react";
import "./Loader.css";

const Loader: React.FC<{ message?: string }> = ({
    message = "Please wait...",
}) => {
    return (
        <div className="loader-overlay">
            <div className="loader"></div>
            <p className="loader-message text-black">{message}</p>
        </div>
    );
};

export default Loader;
