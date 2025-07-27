import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { BsChevronDown } from 'react-icons/bs';
import api from '../config/api';

const Profile = ({ programs }) => {
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', program: '', branch: '', semester: '' });
    const [errors, setErrors] = useState({});
    const [openDropdown, setOpenDropdown] = useState(null);

    useEffect(() => {
        api.get('http://localhost:3000/profile', { withCredentials: true })
            .then(res => {
                setUserData(res.data);
                setFormData({
                    name: res.data.name,
                    program: res.data.program,
                    branch: res.data.branch,
                    semester: res.data.semester.toString(),
                });
            })
            .catch(() => toast.error('Failed to fetch profile'));
    }, []);

    const branches = programs.find(p => p.name === formData.program)?.branches || [];
    const semesters = branches.find(b => b.name === formData.branch)?.semesters || 0;
    const semesterOptions = Array.from({ length: semesters }, (_, i) => (i + 1).toString());

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
            ...(field === 'program' ? { branch: '', semester: '' } : {}),
            ...(field === 'branch' ? { semester: '' } : {}),
        }));
        setOpenDropdown(null);
    };

    const validate = () => {
        const errs = {};
        if (!formData.name.trim()) {
            errs.name = 'Name is required';
        } else if (formData.name.trim().length < 2 || formData.name.trim().length > 40) {
            errs.name = 'Name must be between 2 and 40 characters';
        } else if (/\s{2,}/.test(formData.name)) {
            errs.name = 'Multiple spaces are not allowed between words';
        } else if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(formData.name.trim())) {
            errs.name = 'Name must contain only alphabetic characters and single spaces';
        }

        if (!formData.program) errs.program = 'Program is required';
        if (!formData.branch) errs.branch = 'Branch is required';
        if (!formData.semester) {
            errs.semester = 'Semester is required';
        } else if (Number(formData.semester) < 1 || Number(formData.semester) > semesters) {
            errs.semester = `Semester must be between 1 and ${semesters}`;
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        try {
            await api.patch('http://localhost:3000/profile', formData, { withCredentials: true });
            toast.success('Profile updated');
            setUserData(prev => ({ ...prev, ...formData, semester: Number(formData.semester) }));
            setIsEditing(false);
        } catch {
            toast.error('Update failed');
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
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, [openDropdown, field]);

        return (
            <div className="relative" ref={localRef}>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">{label}</label>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setOpenDropdown(openDropdown === field ? null : field)}
                    className={`w-full flex justify-between items-center px-3 py-2 rounded border dark:border-white/10 dark:bg-zinc-700 dark:text-white ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-600 transition'}`}
                >
                    <span>{formData[field] || `Select ${label}`}</span>
                    <BsChevronDown className="ml-2 text-xs" />
                </button>
                {openDropdown === field && (
                    <motion.ul
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute z-20 mt-1 w-full max-h-32 overflow-y-auto bg-white dark:bg-zinc-700 shadow rounded border dark:border-white/10 text-sm"
                    >
                        {options.map((opt, i) => (
                            <li
                                key={i}
                                onClick={() => handleChange(field, opt)}
                                className="px-3 py-2 hover:bg-blue-100 dark:hover:bg-zinc-600 cursor-pointer"
                            >
                                {opt}
                            </li>
                        ))}
                    </motion.ul>
                )}
                {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
            </div>
        );
    };

    if (!userData) return <div className="text-center p-10">Loading...</div>;

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
            {/* Glow Background */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-0">
                <div className="w-[600px] h-[600px] bg-gradient-to-br from-blue-500 to-purple-500 opacity-20 dark:from-blue-700 dark:to-purple-700 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative w-full max-w-md bg-white dark:bg-zinc-800 border dark:border-white/10 shadow-xl rounded-2xl p-6 space-y-6 z-10 backdrop-blur-md"
            >
                <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white">Profile</h2>

                <div className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Name</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="w-full p-2 rounded border dark:border-white/10 dark:bg-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                        ) : (
                            <div className="px-3 py-2 rounded bg-gray-100 dark:bg-zinc-700 text-sm text-gray-800 dark:text-white">
                                {userData.name}
                            </div>
                        )}
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Email</label>
                        <div className="px-3 py-2 rounded bg-gray-100 dark:bg-zinc-700 text-sm text-gray-800 dark:text-white">
                            {userData.email}
                        </div>
                    </div>

                    {/* Dropdowns */}
                    {isEditing ? (
                        <>
                            <CustomDropdown label="Program" field="program" options={programs.map(p => p.name)} />
                            <CustomDropdown label="Branch" field="branch" options={branches.map(b => b.name)} disabled={!formData.program} />
                            <CustomDropdown label="Semester" field="semester" options={semesterOptions} disabled={!formData.branch} />
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Program</label>
                                <div className="px-3 py-2 rounded bg-gray-100 dark:bg-zinc-700 text-sm text-gray-800 dark:text-white">
                                    {userData.program}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Branch</label>
                                <div className="px-3 py-2 rounded bg-gray-100 dark:bg-zinc-700 text-sm text-gray-800 dark:text-white">
                                    {userData.branch}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Semester</label>
                                <div className="px-3 py-2 rounded bg-gray-100 dark:bg-zinc-700 text-sm text-gray-800 dark:text-white">
                                    {userData.semester}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between gap-4 pt-4">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                                >
                                    Save
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                            >
                                Edit
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Profile;