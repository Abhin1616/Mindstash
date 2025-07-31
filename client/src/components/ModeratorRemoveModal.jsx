import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../config/api';

const ModeratorRemoveModal = ({ materialId, onClose, onRemoved }) => {
    const [availableRules, setAvailableRules] = useState([]);
    const [brokenRules, setBrokenRules] = useState([]);
    const [fieldError, setFieldError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRules = async () => {
            try {
                const res = await api.get('/rules');
                setAvailableRules(res.data || []);
            } catch {
                toast.error('Failed to load rules');
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

    const handleSubmit = async () => {
        if (brokenRules.length === 0) {
            setFieldError('Select at least one broken rule');
            return;
        }

        setLoading(true);
        try {
            await api.delete(`/materials/${materialId}/mod`, {
                data: { brokenRules },
                withCredentials: true,
            });
            toast.success('Material removed successfully');
            onRemoved(materialId);
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to delete');
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
                    Remove Material
                </h2>

                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    Select the rules this material violates:
                </p>

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

                {fieldError && (
                    <p className="text-sm text-red-500 mt-2">{fieldError}</p>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full mt-6 py-2 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                >
                    {loading ? 'Removing...' : 'Remove Material'}
                </button>
            </div>
        </motion.div>
    );
};

export default ModeratorRemoveModal;
