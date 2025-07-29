import React, { useState } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import api from "../config/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const BanUserModal = ({ user, onClose }) => {
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const handleBan = async (e) => {
        e.preventDefault();
        if (!reason.trim()) return setError("Reason is required");
        if (reason.trim().length() < 10) return setError("The reason must be atleast 10 characters");

        setLoading(true);
        try {
            const res = await api.post(
                `/ban-user/${user.id}`,
                { reason: reason.trim() },
                { withCredentials: true }
            );

            toast.success("User banned successfully");
            onClose();
            navigate('/ban-moderation', { replace: true })
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Failed to ban user");
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
                    Ban User
                </h2>

                <form onSubmit={handleBan} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                            Name
                        </label>
                        <input
                            disabled
                            value={user.name}
                            className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                            Email
                        </label>
                        <input
                            disabled
                            value={user.email}
                            className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                            Reason for Ban
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-3 py-2 h-24 resize-none rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                            placeholder="Provide a clear reason for banning..."
                        />
                        {error && (
                            <p className="text-sm text-red-500 mt-1">{error}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                    >
                        {loading ? "Banning..." : "Confirm Ban"}
                    </button>
                </form>
            </div>
        </motion.div>
    );
};

export default BanUserModal;
