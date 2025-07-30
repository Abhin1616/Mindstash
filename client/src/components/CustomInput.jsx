import React from "react";

export const CustomInput = ({ className = "", ...props }) => {
    return (
        <input
            className={`w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
        bg-white dark:bg-gray-900 text-gray-800 dark:text-white 
        focus:outline-none focus:ring-2 focus:ring-blue-500
        ${className}`}
            {...props}
        />
    );
};
