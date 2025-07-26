import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ReportMaterial = ({ materialId, onClose }) => {
    const [reason, setReason] = useState('');
    const navigate = useNavigate();
    const [brokenRules, setBrokenRules] = useState([]);
    const [availableRules, setAvailableRules] = useState([]);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingRules, setLoadingRules] = useState(true);

    useEffect(() => {
        const fetchRules = async () => {
            try {
                const res = await axios.get('http://localhost:3000/rules');
                setAvailableRules(res.data || []);
            } catch (err) {
                console.error('Failed to fetch rules:', err);
                setAvailableRules([]);
            } finally {
                setLoadingRules(false);
            }
        };
        fetchRules();
    }, []);

    const toggleRule = (ruleId) => {
        setBrokenRules((prev) =>
            prev.includes(ruleId)
                ? prev.filter((r) => r !== ruleId)
                : [...prev, ruleId]
        );
    };

    const validate = () => {
        const errors = {};
        const trimmed = reason.trim();

        if (!trimmed) {
            errors.reason = 'Reason is required';
        } else if (trimmed.length > 200) {
            errors.reason = 'Reason must be under 200 characters';
        }

        if (brokenRules.length === 0) {
            errors.brokenRules = 'Select at least one broken rule';
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        const validationErrors = validate();
        setFieldErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post('http://localhost:3000/reports', {
                materialId,
                reason: reason.trim(),
                brokenRules,
            }, { withCredentials: true });

            if (res.status === 201) {
                setSuccess(true);
                setReason('');
                setBrokenRules([]);
                setFieldErrors({});
                navigate('/reports', { replace: true });
                toast.success("Report added sucessfully!")
            }
        } catch (err) {
            if (err.response?.data?.error === "You have already reported this material.") {
                toast.error("You have already reported this material")
                onClose()
            }
            const msg = err.response?.data?.error || 'Something went wrong';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-red-500"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-100">
                    Report Material
                </h2>

                {success && (
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md mb-4 dark:bg-green-900 dark:text-green-300">
                        Report submitted successfully.
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 text-red-800 px-4 py-2 rounded-md mb-4 dark:bg-red-900 dark:text-red-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="reason"
                            className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1"
                        >
                            Reason
                        </label>
                        <textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full h-28 resize-none border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Explain what's wrong with this material..."
                        />
                        {fieldErrors.reason && (
                            <p className="text-sm text-red-500 mt-1">{fieldErrors.reason}</p>
                        )}
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">
                            Select Broken Rules
                        </h3>
                        {loadingRules ? (
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Loading rules...</p>
                        ) : availableRules.length === 0 ? (
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">No rules found.</p>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {availableRules.map((rule) => (
                                    <label
                                        key={rule.id}
                                        className="flex items-start gap-2 bg-zinc-50 dark:bg-zinc-800 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={brokenRules.includes(rule.id)}
                                            onChange={() => toggleRule(rule.id)}
                                            className="mt-1"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                                                {rule.title}
                                            </p>
                                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                                {rule.description}
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                        {fieldErrors.brokenRules && (
                            <p className="text-sm text-red-500 mt-1">{fieldErrors.brokenRules}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Submit Report'}
                    </button>
                </form>
            </div>
        </motion.div>
    );
};

export default ReportMaterial;
