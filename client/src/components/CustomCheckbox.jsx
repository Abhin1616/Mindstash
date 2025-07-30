const CustomCheckbox = ({ id, checked, onChange, label }) => {
    return (
        <label htmlFor={id} className="flex items-center gap-2 cursor-pointer">
            <input
                type="checkbox"
                id={id}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="w-4 h-4 accent-blue-600"
            />
            {label && <span className="text-sm text-gray-800 dark:text-gray-200">{label}</span>}
        </label>
    );
};

export default CustomCheckbox;
