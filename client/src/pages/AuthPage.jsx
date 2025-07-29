import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import classNames from 'classnames';
import { BsChevronDown } from 'react-icons/bs';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { Eye, EyeOff } from "lucide-react";
import { supportEmail } from '../constants';

const AuthPage = ({ programs, setLoggedIn, setCurrentUserId }) => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        program: '',
        branch: '',
        semester: '',
    });
    const [errors, setErrors] = useState({});
    const [openDropdown, setOpenDropdown] = useState(null);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const branches = programs.find(p => p.name === formData.program)?.branches || [];
    const semesters = branches.find(b => b.name === formData.branch)?.semesters || 0;
    const semesterOptions = Array.from({ length: semesters }, (_, i) => (i + 1).toString());

    const handleChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'program' ? { branch: '', semester: '' } : {}),
            ...(name === 'branch' ? { semester: '' } : {}),
        }));
        setOpenDropdown(null);
    };

    const validate = () => {
        const errs = {};
        if (!isLogin) {
            if (!formData.name.trim()) {
                errs.name = 'Name is required';
            } else if (formData.name.trim().length < 2 || formData.name.trim().length > 40) {
                errs.name = 'Name must be between 2 and 40 characters';
            } else if (/\s{2,}/.test(formData.name)) {
                errs.name = 'Multiple spaces are not allowed';
            } else if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(formData.name.trim())) {
                errs.name = 'Only alphabetic characters and single spaces allowed';
            }
        }

        if (!formData.email.trim()) {
            errs.email = 'Email is required';
        } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,8}$/.test(formData.email)) {
            errs.email = 'Invalid email format';
        }

        if (!formData.password) {
            errs.password = 'Password is required';
        } else if (!isLogin) {
            if (formData.password.length < 8 || formData.password.length > 30) {
                errs.password = 'Password must be 8-30 characters';
            } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
                errs.password = 'Must include uppercase, lowercase, number, and special character';
            }
        }

        if (!isLogin) {
            if (!formData.program) errs.program = 'Program is required';
            if (!formData.branch) errs.branch = 'Branch is required';
            if (!formData.semester) {
                errs.semester = 'Semester is required';
            } else if (Number(formData.semester) < 1 || Number(formData.semester) > semesters) {
                errs.semester = `Must be between 1 and ${semesters}`;
            }
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        const endpoint = isLogin ? '/login' : '/register';

        try {
            const { data } = await api.post(endpoint, formData, { withCredentials: true });

            if (data.banned) {
                toast.error("This account has been suspended for violating our community guidelines.", { duration: 4000 });
                toast(`Contact ${supportEmail} to appeal.`, {
                    duration: 7000,
                    icon: "📩",
                });
                return;

            }

            setLoggedIn(true);
            setCurrentUserId(data.userId);
            toast.success(data.message);
            navigate('/', { replace: true });
        } catch (err) {
            const error = err.response?.data?.error || err.response?.data?.message || 'Something went wrong';
            toast.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setGoogleLoading(true);
        try {
            window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
        } catch (err) {
            console.error('Google Auth failed:', err);
            setGoogleLoading(false);
        }
    };

    const CustomDropdown = ({ label, field, options, disabled }) => {
        const localRef = useRef();

        useEffect(() => {
            const handleOutside = (e) => {
                if (localRef.current && !localRef.current.contains(e.target)) {
                    setOpenDropdown(null);
                }
            };
            document.addEventListener('mousedown', handleOutside);
            return () => document.removeEventListener('mousedown', handleOutside);
        }, []);

        return (
            <div className="relative" ref={localRef}>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">{label}</label>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setOpenDropdown(openDropdown === field ? null : field)}
                    className={`w-full p-2 rounded border bg-white dark:bg-zinc-700 dark:border-white/10 dark:text-white text-left focus:outline-none flex justify-between items-center ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span>{formData[field] || `Select ${label}`}</span>
                    <BsChevronDown className={`transition-transform ${openDropdown === field ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown === field && (
                    <div className="absolute z-50 w-full mt-1 max-h-40 overflow-y-auto bg-white dark:bg-zinc-800 border dark:border-white/10 rounded shadow-lg">
                        {options.length > 0 ? (
                            options.map((val, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleChange(field, val)}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-100 dark:hover:bg-zinc-700 ${formData[field] === val ? 'bg-blue-100 dark:bg-zinc-700 font-semibold' : ''}`}
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
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[600px] bg-gradient-to-br from-blue-400 to-purple-500 dark:from-indigo-800 dark:to-purple-900 opacity-25 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative w-full max-w-md bg-white/80 dark:bg-white/[0.05] backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-2xl rounded-2xl p-6 space-y-6 z-10"
            >
                <div className="flex justify-center mb-2">
                    {['Login', 'Register'].map((type, idx) => {
                        const active = (idx === 0) === isLogin;
                        return (
                            <button
                                key={type}
                                onClick={() => setIsLogin(idx === 0)}
                                className={classNames(
                                    'px-4 py-2 text-sm font-medium border transition-all duration-300',
                                    idx === 0 ? 'rounded-l-lg' : 'rounded-r-lg',
                                    active
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white dark:bg-transparent text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-700'
                                )}
                            >
                                {type}
                            </button>
                        );
                    })}
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="w-full p-2 rounded border dark:border-white/10 dark:bg-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className="w-full p-2 rounded border dark:border-white/10 dark:bg-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                className="w-full p-2 pr-10 border rounded bg-white dark:bg-zinc-700 dark:text-white dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter password"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    {!isLogin && (
                        <>
                            <CustomDropdown label="Program" field="program" options={programs.map(p => p.name)} />
                            <CustomDropdown label="Branch" field="branch" options={branches.map(b => b.name)} disabled={!formData.program} />
                            <CustomDropdown label="Semester" field="semester" options={semesterOptions} disabled={!formData.branch} />
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded shadow transition transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLogin ? 'Login' : 'Register'}
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">or</p>
                    <button
                        onClick={handleGoogleAuth}
                        disabled={googleLoading}
                        className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-800 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-gray-200 font-medium py-2 rounded transition transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {googleLoading ? (
                            <span className="animate-spin">⏳</span>
                        ) : (
                            <FcGoogle size={18} />
                        )}
                        Continue with Google
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthPage;
