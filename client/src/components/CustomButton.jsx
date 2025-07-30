import React from "react";

export const CustomButton = ({
    children,
    className = "",
    ...props
}) => {
    return (
        <button
            className={`px-4 py-2 rounded-md bg-blue-600 text-white font-medium
        hover:bg-blue-700 active:scale-95 transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
