import React from "react";

export const CustomButton = ({
    children,
    onClick,
    type = "button",
    className = "",
    disabled = false,
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200
        ${disabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-95"}
        text-white dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white
        ${className}`}
        >
            {children}
        </button>
    );
};
