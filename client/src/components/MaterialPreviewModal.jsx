import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Flag, ThumbsUp } from 'lucide-react';
import getDownloadUrl from '../utils/getDownloadUrl';

const MaterialPreviewModal = ({ isOpen, onClose, material, onReport }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [previewKey, setPreviewKey] = useState(0);

    useEffect(() => {
        if (material) {
            setIsLoading(true);
            setPreviewKey(prev => prev + 1);
        }
    }, [material]);

    if (!material) return null;

    const { _id, title, description, fileUrl, fileType, program, branch, semester } = material;
    const isPDF = fileType === 'pdf';

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center px-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center px-4 py-3 border-b dark:border-zinc-700">
                            <h2 className="text-lg font-semibold truncate">{title}</h2>
                            <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
                            {/* Preview Area */}
                            <div className="relative flex-1 flex items-center justify-center bg-gray-50 dark:bg-zinc-800 p-4">
                                {isPDF ? (
                                    <iframe
                                        key={previewKey}
                                        src={fileUrl}
                                        title="PDF Preview"
                                        onLoad={() => setTimeout(() => setIsLoading(false), 300)}
                                        className="w-full h-[300px] md:h-[400px] rounded-md shadow"
                                    />
                                ) : (
                                    <img
                                        key={previewKey}
                                        src={fileUrl}
                                        onLoad={() => setTimeout(() => setIsLoading(false), 300)}
                                        alt={title}
                                        className="max-h-[300px] md:max-h-[400px] w-auto mx-auto rounded-md shadow"
                                    />
                                )}

                                {isLoading && (
                                    <div className="absolute inset-0 bg-white/70 dark:bg-zinc-900/70 flex items-center justify-center z-10">
                                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>

                            {/* Info + Actions */}
                            <div className="md:w-[40%] w-full p-4 flex flex-col md:justify-between space-y-4 border-t md:border-l md:border-t-0 dark:border-zinc-700">
                                <p className="text-[0.93rem] text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap">
                                    {description}
                                </p>
                                {/* Button group */}
                                <div className="flex flex-wrap gap-3 justify-center md:mt-auto md:pt-10">
                                    <button
                                        onClick={() => {
                                            const downloadUrl = getDownloadUrl(program, branch, semester, fileUrl);
                                            const link = document.createElement('a');
                                            link.href = downloadUrl;
                                            link.download = ''; // filename is handled by Cloudinary
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        }}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm"
                                    >
                                        <Download size={16} /> Download
                                    </button>
                                    <button
                                        onClick={() => onReport(_id)}
                                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm"
                                    >
                                        <Flag size={16} /> Report
                                    </button>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MaterialPreviewModal;
