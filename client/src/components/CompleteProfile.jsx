import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Ensure axios is imported
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const CompleteProfile = ({ programs, setLoggedIn, setCurrentUserId }) => {
    const params = new URLSearchParams(window.location.search);
    const [formData, setFormData] = useState({
        program: "",
        branch: "",
        semester: "",
    });
    const [errors, setErrors] = useState({});
    const [openDropdown, setOpenDropdown] = useState(null);
    const navigate = useNavigate(); // Initialize useNavigate hook

    const branches = programs.find(p => p.name === formData.program)?.branches || [];
    const semesters = branches.find(b => b.name === formData.branch)?.semesters || 0;
    const semesterOptions = Array.from({ length: semesters }, (_, i) => (i + 1).toString());

    const handleChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === "program" ? { branch: "", semester: "" } : {}),
            ...(name === "branch" ? { semester: "" } : {}),
        }));
        setOpenDropdown(null);
    };

    const validate = () => {
        const errs = {};
        if (!formData.program) errs.program = "Program is required";
        if (!formData.branch) errs.branch = "Branch is required";
        if (!formData.semester) {
            errs.semester = "Semester is required";
        } else if (
            Number(formData.semester) < 1 ||
            Number(formData.semester) > semesters
        ) {
            errs.semester = `Semester must be between 1 and ${semesters}`;
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const userId = params.get("userId");
            await axios.post(`http://localhost:3000/complete-profile?userId=${userId}`, formData, { withCredentials: true });
            setLoggedIn(true);
            setCurrentUserId(userId);
            navigate("/", { replace: true });

        } catch (err) {
            console.error("Profile completion failed:", err);
            const msg = err.response?.data?.error || "Failed to complete profile. Please try again.";
            setErrors({ submit: msg });
        }
    };

    const CustomDropdown = ({ label, field, options, disabled }) => {
        const localRef = useRef(null);

        useEffect(() => {
            const handleClickOutside = (e) => {
                if (localRef.current && !localRef.current.contains(e.target) && openDropdown === field) {
                    setOpenDropdown(null);
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, [openDropdown, field]);

        return (
            <div className="relative" ref={localRef}>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">{label}</label>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setOpenDropdown(openDropdown === field ? null : field)}
                    className={`w-full p-2 flex justify-between items-center rounded border dark:border-white/10 dark:bg-zinc-700 dark:text-white bg-white text-left focus:outline-none ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    <span className="truncate">{formData[field] || `Select ${label}`}</span>
                    <ChevronDown className={`w-4 h-4 opacity-50 transform transition-transform duration-200 ${openDropdown === field ? 'rotate-180' : 'rotate-0'}`} />
                </button>
                {openDropdown === field && (
                    <div
                        className="absolute z-40 mt-1 w-full overflow-y-auto bg-white dark:bg-zinc-700 border border-gray-300 dark:border-white/10 rounded shadow"
                        style={{ maxHeight: '10rem' }}
                    >
                        {options.length > 0 ? (
                            options.map((val, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleChange(field, val)}
                                    className={`px-3 py-2 cursor-pointer text-sm hover:bg-blue-100 dark:hover:bg-zinc-600 ${formData[field] === val ? "bg-blue-100 dark:bg-zinc-600 font-semibold" : ""}`}
                                >
                                    {val}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No options available</div>
                        )}
                    </div>
                )}
                {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
            </div>
        );
    };


    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                <div className="w-[600px] h-[600px] bg-gradient-to-br from-blue-500 to-purple-500 opacity-20 dark:from-blue-700 dark:to-purple-700 rounded-full blur-3xl" />
            </div>

            <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative w-full max-w-md bg-white dark:bg-zinc-800 border dark:border-white/10 shadow-xl rounded-2xl p-6 space-y-6 z-10 backdrop-blur-md"
            >
                <h1 className="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-white">
                    Complete Your Profile
                </h1>

                <CustomDropdown label="Program" field="program" options={programs.map(p => p.name)} />
                <CustomDropdown label="Branch" field="branch" options={branches.map(b => b.name)} disabled={!formData.program} />
                <CustomDropdown label="Semester" field="semester" options={semesterOptions} disabled={!formData.branch} />

                {errors.submit && <p className="text-red-500 text-sm text-center">{errors.submit}</p>}

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded shadow transition transform hover:scale-[1.01]"
                >
                    Finish Profile
                </button>
            </motion.form>
        </div>
    );
};

export default CompleteProfile;