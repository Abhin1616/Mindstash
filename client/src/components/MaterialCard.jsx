import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Download, Flag, ThumbsUp, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import getDownloadUrl from '../utils/getDownloadUrl';
dayjs.extend(relativeTime);

const MaterialCard = ({
    material,
    currentUserId,
    onDelete,
    onUpvote,
    setPreviewMaterial,
    confirmingDeleteId,
    setConfirmingDeleteId,
    isDeleting,
    onReport,
    role,
    setModRemoveMaterialId,
    setBanUser
}) => {
    const {
        title,
        description,
        fileUrl,
        fileType,
        program,
        branch,
        semester,
        createdAt,
        uploadedBy,
        upvotes = [],
        _id,
    } = material;
    const isConfirming = confirmingDeleteId === _id;
    const isUploader = currentUserId === uploadedBy._id;
    const hasUpvoted = upvotes.includes(currentUserId);
    const [isLocked, setIsLocked] = useState(false);
    const [showEmail, setShowEmail] = useState(false);
    const toggleEmail = () => {
        setShowEmail((prev) => !prev);
    };
    console.log(currentUserId, isUploader)
    const formatNumber = (num) => {
        if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
        return num.toString();
    };

    return (
        <motion.div
            className="p-3 sm:p-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            viewport={{ once: true }}
        >
            <div className="relative bg-white/80 dark:bg-[#111827cc] backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-md dark:shadow-lg hover:shadow-lg dark:hover:shadow-xl rounded-2xl p-5 flex flex-col justify-between min-h-[260px] transition-all duration-300 group">

                {/* Title & Type */}
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white max-w-[80%] leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 break-words">
                        {title}
                    </h3>
                    <span className="text-xs bg-gray-800 text-white px-2 py-0.5 rounded-full uppercase tracking-wide font-semibold">
                        {fileType?.toUpperCase() || 'FILE'}
                    </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 mb-3 max-h-[88px] overflow-y-auto pr-1 leading-relaxed break-words scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700">
                    {description}
                </p>

                {/* Uploader & Time */}
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Uploaded by{" "}
                    {role === "moderator" && !isUploader ? (
                        <button
                            onClick={toggleEmail}
                            className="inline-flex items-center font-medium text-indigo-600 dark:text-indigo-400 hover:underline focus:outline-none"
                            title="Click to show/hide email"
                        >
                            {uploadedBy?.name || "Anonymous"}
                            {showEmail ? (
                                <ChevronUp className="w-4 h-4 ml-1" />
                            ) : (
                                <ChevronDown className="w-4 h-4 ml-1" />
                            )}
                        </button>
                    ) : (
                        <span className="font-medium text-gray-800 dark:text-white">
                            {uploadedBy?.name || "Anonymous"}
                        </span>
                    )}{" "}
                    • {dayjs(createdAt).fromNow()}
                    {role === "moderator" && showEmail && uploadedBy?.email && (
                        <div className="text-xs mt-1 ml-1 flex flex-col sm:flex-row sm:items-center gap-1">
                            <span className="text-indigo-700 dark:text-indigo-300">{uploadedBy.email}</span>
                            <button
                                onClick={() => setBanUser({ id: uploadedBy?._id, name: uploadedBy?.name, email: uploadedBy?.email })}
                                className="text-red-600 dark:text-red-400 border border-red-500 dark:border-red-400 hover:bg-red-100 dark:hover:bg-red-800 px-2 py-0.5 rounded-md text-xs transition-all"
                            >
                                Ban User
                            </button>
                        </div>
                    )}
                </div>



                {/* Program Info */}
                <div className="text-xs italic text-gray-400 dark:text-gray-500 mb-3">
                    {program} • {branch} • Semester {semester}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap justify-between items-center gap-4 mt-auto">
                    {/* Left buttons */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setPreviewMaterial(material)}
                            disabled={isDeleting}
                            className="px-3 py-2 text-sm rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                            <ArrowUpRight size={16} className="inline mr-1" />
                            Preview
                        </button>

                        <button
                            onClick={() => {
                                const downloadUrl = getDownloadUrl(program, branch, semester, fileUrl);
                                const link = document.createElement('a');
                                link.href = downloadUrl;
                                link.download = '';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                            disabled={isDeleting}
                            className="px-3 py-2 text-sm rounded-xl bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
                        >
                            <Download size={16} className="inline mr-1" />
                            Download
                        </button>

                        {!isUploader && role !== 'moderator' && (
                            <button
                                onClick={onReport}
                                disabled={!currentUserId || isDeleting}
                                className="px-3 py-2 text-sm rounded-xl bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition disabled:opacity-50"
                            >
                                <Flag size={16} className="inline mr-1" />
                                Report
                            </button>
                        )}

                        {role === 'moderator' && (
                            <button
                                onClick={() => setModRemoveMaterialId(_id)}
                                disabled={isDeleting}
                                className="px-3 py-2 text-sm rounded-xl bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                            >
                                <Trash2 size={16} className="inline mr-1" />
                                Remove
                            </button>
                        )}

                        {isUploader && (
                            <button
                                onClick={() => setConfirmingDeleteId(_id)}
                                disabled={isDeleting}
                                className="p-2 rounded-xl bg-red-500 hover:bg-red-700 text-white transition disabled:opacity-50"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>

                    {/* Upvote */}
                    <motion.button
                        onClick={() => {
                            if (!isLocked && !isDeleting) {
                                setIsLocked(true);
                                onUpvote(_id);
                                setTimeout(() => setIsLocked(false), 500);
                            }
                        }}
                        whileTap={{ scale: 1.2 }}
                        animate={hasUpvoted ? { scale: [1, 1.05, 1] } : {}}
                        transition={hasUpvoted ? { repeat: Infinity, duration: 1.5, ease: 'easeInOut' } : {}}
                        disabled={!currentUserId || isDeleting || isLocked}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition ${hasUpvoted
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-white/20'
                            } ${!currentUserId || isDeleting || isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md hover:scale-[1.02]'}`}
                    >
                        <ThumbsUp size={16} /> {formatNumber(upvotes.length)}
                    </motion.button>
                </div>

                {/* Confirm Delete Modal */}
                {isConfirming && !isDeleting && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 dark:bg-black/40 backdrop-blur rounded-2xl">
                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-lg border dark:border-zinc-700 w-64">
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                                Are you sure you want to delete this material? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setConfirmingDeleteId(null)}
                                    className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setConfirmingDeleteId(null);
                                        onDelete(_id);
                                    }}
                                    className="px-3 py-1 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Deleting overlay */}
                {isDeleting && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-gray-200 dark:bg-zinc-900/70 backdrop-blur rounded-2xl">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 animate-pulse">
                            Deleting...
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default MaterialCard;
