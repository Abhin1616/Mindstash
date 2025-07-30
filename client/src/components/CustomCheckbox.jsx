import React from "react";

export const CustomCheckbox = ({
    checked,
    onChange,
    label = "",
    className = "",
    ...props
}) => {
    return (
        <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
                {...props}
            />
            <span className="text-sm text-gray-800 dark:text-gray-100">{label}</span>
        </label>
    );
};
