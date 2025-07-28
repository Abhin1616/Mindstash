import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

const UploadMaterial = ({ currentUserId }) => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState({})
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [uploading, setUploading] = useState(false);
    useEffect(() => {
        api.get("/profile", { withCredentials: true })
            .then((res) => {
                console.log(res)
                setCurrentUser(res.data);
            })
            .catch((err) => {
                console.log(err);
            })

    }, [currentUserId])
    const validate = () => {
        const errs = {};
        if (!title.trim()) errs.title = 'Title is required';
        else if (title.length > 100) errs.title = 'Max 100 characters allowed';

        if (!description.trim()) errs.description = 'Description is required';
        else if (description.length > 500) errs.description = 'Max 500 characters allowed';

        if (!file) errs.file = 'Please upload a file';
        else {
            const allowed = ['application/pdf', 'image/png', 'image/jpg', 'image/jpeg'];
            if (!allowed.includes(file.type)) errs.file = 'Only PDF, PNG, JPG, JPEG allowed';
        }

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
        try {
            const res = await api.post('/materials', formData, { withCredentials: true });
            console.log(formData)
            console.log(res)
            setTitle('');
            setDescription('');
            setFile(null);
            setErrors({});
            toast.success("Material uploaded")
            navigate("/uploads", { replace: true })
        } catch (err) {
            const msg = err?.response?.data?.error || 'Upload failed';
            setErrors({ file: msg });
        } finally {
            setUploading(false);
        }
    };

    return (
        <motion.div
            className="min-h-screen bg-gradient-to-b from-white via-zinc-50 to-zinc-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-700 py-12 px-4"

            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="max-w-3xl mx-auto">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-8 space-y-6"
                >
                    <h2 className="text-3xl font-semibold text-zinc-800 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-700 pb-4 mb-4">
                        Upload Material
                    </h2>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={100}
                            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            placeholder="Title of the material..."
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={500}
                            rows={4}
                            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none min-h-[120px] max-h-[200px] sm:min-h-[140px] sm:max-h-[240px]"
                            placeholder="Brief summary about the material..."
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            File (PDF, JPG, PNG)
                        </label>
                        <input
                            type="file"
                            accept=".pdf, .jpg, .jpeg, .png"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 dark:hover:file:bg-blue-800 transition"
                        />
                        {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
                    </div>

                    {/* Info Tags */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Program</label>
                            <div className="mt-1 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                {currentUser?.program || '—'}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Branch</label>
                            <div className="mt-1 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                {currentUser?.branch || '—'}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Semester</label>
                            <div className="mt-1 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                {currentUser?.semester || '—'}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={uploading}
                            className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition shadow-md w-full md:w-auto"

                        >
                            {uploading ? (
                                <>
                                    <Loader className="animate-spin w-4 h-4" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    Upload
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );

};

export default UploadMaterial;
