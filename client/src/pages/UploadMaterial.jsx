import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Loader, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

const UploadMaterial = ({ currentUserId, programs }) => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState({});
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [uploading, setUploading] = useState(false);
    const [editableSemester, setEditableSemester] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null);

    const dropdownRef = useRef(null);

    useEffect(() => {
        api.get('/profile', { withCredentials: true })
            .then((res) => {
                setCurrentUser(res.data);
                setEditableSemester(res.data.semester?.toString() || '');
            })
            .catch((err) => console.error(err));
    }, [currentUserId]);

    useEffect(() => {
        const closeOnOutsideClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', closeOnOutsideClick);
        return () => document.removeEventListener('mousedown', closeOnOutsideClick);
    }, []);

    const branches = programs.find(p => p.name === currentUser.program)?.branches || [];
    const semestersCount = branches.find(b => b.name === currentUser.branch)?.semesters || 0;
    const semesterOptions = Array.from({ length: semestersCount }, (_, i) => (i + 1).toString());

    const validate = () => {
        const errs = {};
        if (!title.trim()) errs.title = 'Title is required';
        else if (title.length > 100) errs.title = 'Max 100 characters allowed';

        if (!description.trim()) errs.description = 'Description is required';
        else if (description.length > 500) errs.description = 'Max 500 characters allowed';

        if (!file) {
            errs.file = 'Please upload a file';
        } else {
            const allowed = ['application/pdf', 'image/png', 'image/jpg', 'image/jpeg'];
            if (!allowed.includes(file.type)) {
                errs.file = 'Only PDF, PNG, JPG, JPEG allowed';
            } else if (file.size > 10 * 1024 * 1024) {
                errs.file = 'File size must be under 10MB';
            }
        }

        if (!editableSemester) errs.semester = 'Semester is required';

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        formData.append('file', file);
        formData.append('program', currentUser.program);
        formData.append('branch', currentUser.branch);
        formData.append('semester', editableSemester);

        try {
            await api.post('/materials', formData, { withCredentials: true });
            setTitle('');
            setDescription('');
            setFile(null);
            setErrors({});
            toast.success('Material uploaded');
            navigate('/uploads', { replace: true });
        } catch (err) {
            const msg = err?.response?.data?.error || 'Upload failed';
            setErrors({ file: msg });
        } finally {
            setUploading(false);
        }
    };

    const renderDropdown = () => (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Semester</label>
            <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'semester' ? null : 'semester')}
                className="w-full flex justify-between items-center px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            >
                <span>{editableSemester || 'Select Semester'}</span>
                <ChevronDown className="w-4 h-4 ml-2" />
            </button>

            <AnimatePresence>
                {openDropdown === 'semester' && (
                    <motion.ul
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute z-50 mt-1 w-full max-h-32 overflow-y-auto bg-white dark:bg-zinc-700 shadow-lg rounded border border-zinc-300 dark:border-zinc-600 text-sm"
                    >
                        {semesterOptions.map((sem, index) => (
                            <li
                                key={index}
                                onClick={() => {
                                    setEditableSemester(sem);
                                    setOpenDropdown(null);
                                }}
                                className="px-3 py-2 hover:bg-blue-100 dark:hover:bg-zinc-600 cursor-pointer"
                            >
                                {sem}
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>

            {errors.semester && <p className="text-red-500 text-sm mt-1">{errors.semester}</p>}
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen py-12 px-4 bg-zinc-100 dark:bg-zinc-900 transition-colors"
        >
            <div className="max-w-3xl mx-auto">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-2xl shadow-lg p-8 space-y-6"
                >
                    <h2 className="text-3xl font-semibold text-zinc-800 dark:text-zinc-100">
                        Upload Material
                    </h2>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={100}
                            placeholder="Title of the material..."
                            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={500}
                            rows={4}
                            placeholder="Brief summary about the material..."
                            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-none"
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Upload File <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1">(Max 10MB)</span>
                        </label>
                        <input
                            type="file"
                            accept=".pdf, .jpg, .jpeg, .png"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="block w-full text-sm file:px-4 file:py-2 file:rounded-md file:border-0 file:bg-blue-100 dark:file:bg-blue-800 file:text-blue-800 dark:file:text-blue-200 hover:file:bg-blue-200 dark:hover:file:bg-blue-700 focus:outline-none"
                        />
                        {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
                    </div>

                    {/* Info Tags + Custom Semester Dropdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Program */}
                        <div>
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Program</label>
                            <div className="mt-1 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 select-none cursor-not-allowed">
                                {currentUser.program || '—'}
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 italic">
                                Program is fixed and can't be edited here.
                            </p>
                        </div>

                        {/* Branch */}
                        <div>
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Branch</label>
                            <div className="mt-1 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 select-none cursor-not-allowed">
                                {currentUser.branch || '—'}
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 italic">
                                Branch is based on your profile and not editable.
                            </p>
                        </div>

                        {/* Semester Dropdown */}
                        <div>{renderDropdown()}</div>
                    </div>

                    <button
                        type="submit"
                        disabled={uploading}
                        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-colors ${uploading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {uploading ? <Loader className="animate-spin w-5 h-5" /> : <Upload className="w-5 h-5" />}
                        {uploading ? 'Uploading...' : 'Upload Material'}
                    </button>
                </form>
            </div>
        </motion.div>
    );
};

export default UploadMaterial;