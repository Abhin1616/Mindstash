import React from "react";

export const CustomInput = ({
    type = "text",
    value,
    onChange,
    placeholder = "",
    className = "",
    ...props
}) => {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
        bg-white dark:bg-gray-900 text-black dark:text-white
        focus:outline-none focus:ring-2 focus:ring-blue-500
        ${className}`}
            {...props}
        />
    );
};
