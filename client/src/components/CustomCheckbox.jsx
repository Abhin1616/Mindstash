import React from "react";

export const CustomCheckbox = ({ checked, onChange, className = "", ...props }) => {
    return (
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className={`w-4 h-4 accent-blue-600 rounded-sm border-gray-400 dark:border-gray-600
        focus:ring-blue-500 transition-all ${className}`}
            {...props}
        />
    );
};
