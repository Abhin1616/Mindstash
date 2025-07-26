import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Download, Flag, ThumbsUp, Trash2 } from 'lucide-react';
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
    onReport
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
    const [isLocked, setIsLocked] = React.useState(false);
    const formatNumber = (num) => {
        if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
        if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
        return num.toString();
    };

    return (
        <motion.div
            className="p-2 sm:p-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.005 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            viewport={{ once: true }}
        >
            <div className="relative bg-gradient-to-br from-white/80 to-zinc-100/70 dark:from-zinc-800/60 dark:to-zinc-900/50 border border-gray-200 dark:border-white/10 backdrop-blur-md shadow-md shadow-black/5 dark:shadow-black/20 hover:shadow-lg dark:hover:shadow-xl rounded-2xl p-6 transition-all duration-300 min-h-[250px] group flex flex-col justify-between">

                {/* Title */}
                <div className="flex justify-between items-start">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white max-w-[80%] leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 break-words">
                        {title}
                    </h3>
                    <span className="text-[10px] sm:text-xs bg-gray-800 text-white px-2 py-1 rounded-full uppercase tracking-wide font-medium">
                        {fileType?.toUpperCase() || 'FILE'}
                    </span>
                </div>

                {/* Description */}
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-2 mb-4 max-h-[84px] overflow-y-auto pr-1 leading-relaxed scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700 break-words overflow-x-hidden">
                    {description}
                </div>

                {/* Uploader Info */}
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Uploaded by{' '}
                    <span className="font-medium text-gray-800 dark:text-white">
                        {uploadedBy?.name || 'Anonymous'}
                    </span>{' '}
                    • {dayjs(createdAt).fromNow()}
                </div>

                {/* Program Info */}
                <div className="text-xs text-gray-400 dark:text-gray-500 italic mb-4">
                    {program} • {branch} • Semester {semester}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap justify-between items-center gap-4 mt-auto">
                    <div className="flex gap-2 flex-wrap">
                        <button
                            disabled={isDeleting}
                            onClick={() => setPreviewMaterial(material)}
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowUpRight size={16} /> Preview
                        </button>

                        <button
                            disabled={isDeleting}
                            onClick={() => {
                                const downloadUrl = getDownloadUrl(program, branch, semester, fileUrl);
                                const link = document.createElement('a');
                                link.href = downloadUrl;
                                link.download = '';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-300 dark:focus:ring-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download size={16} /> Download
                        </button>

                        {!isUploader && (
                            <button
                                disabled={currentUserId == null || isDeleting}
                                onClick={onReport}
                                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-xl bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 focus:ring-2 focus:ring-red-300 dark:focus:ring-red-600 transition ${currentUserId == null || isDeleting ? "cursor-not-allowed opacity-50" : ""
                                    }`}
                            >
                                <Flag size={16} /> Report
                            </button>
                        )}


                        {/* Delete Button */}
                        {isUploader && (
                            <button
                                disabled={isDeleting}
                                onClick={() => setConfirmingDeleteId(_id)}
                                className="p-2 rounded-xl bg-red-500 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800 shadow-sm hover:shadow-md focus:ring-2 focus:ring-red-300 dark:focus:ring-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}

                        {/* Confirm Box */}
                        {isConfirming && !isDeleting && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 dark:bg-black/30 rounded-xl backdrop-blur-[1px]">
                                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-xl border dark:border-zinc-700 w-64">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                                        Are you sure you want to delete this material? This action cannot be undone.
                                    </p>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setConfirmingDeleteId(null)}
                                            className="px-3 py-1 rounded-md text-sm bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => {
                                                setConfirmingDeleteId(null);
                                                onDelete(_id);
                                            }}
                                            className="px-3 py-1 rounded-md text-sm bg-red-600 hover:bg-red-700 text-white"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Upvote Button */}
                    <motion.button
                        animate={hasUpvoted ? { scale: [1, 1.05, 1] } : {}}
                        transition={hasUpvoted ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" } : {}}
                        disabled={isLocked || isDeleting || currentUserId == null}
                        onClick={() => {
                            if (isLocked || isDeleting) return;
                            setIsLocked(true);
                            onUpvote(_id);
                            setTimeout(() => setIsLocked(false), 500);
                        }}
                        whileTap={{ scale: 1.2 }}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${hasUpvoted
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-white/20"
                            } ${isLocked || isDeleting || currentUserId == null ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:shadow-md hover:scale-[1.02]"}`}
                        title="Upvote"
                    >
                        <ThumbsUp size={16} /> {formatNumber(upvotes.length)}
                    </motion.button>
                </div>
                {/* Deleting overlay */}
                {isDeleting && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-gray-200 dark:bg-zinc-900/70 backdrop-blur-sm rounded-2xl">
                        <p className=" text-sm font-semibold text-gray-700 dark:text-gray-200 animate-pulse">
                            Deleting...
                        </p>
                    </div>
                )}

            </div>
        </motion.div>

    );
};
export default MaterialCard;
