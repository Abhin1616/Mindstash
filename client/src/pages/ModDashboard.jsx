import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Ban } from "lucide-react";
import { motion } from "framer-motion";

const ModDashboard = () => {
    const navigate = useNavigate();

    const cards = [
        {
            title: "Reports",
            description: "Review and moderate reported materials.",
            icon: <ShieldAlert className="w-8 h-8 text-blue-600 group-hover:drop-shadow-glow" />,
            path: "/report-moderation",
            bg: "from-blue-100 to-blue-200 dark:from-blue-950 dark:to-blue-900"
        },
        {
            title: "Bans",
            description: "Ban or unban users who violate guidelines.",
            icon: <Ban className="w-8 h-8 text-red-600 group-hover:drop-shadow-glow" />,
            path: "/ban-moderation",
            bg: "from-red-100 to-red-200 dark:from-red-950 dark:to-red-900"
        }
    ];

    return (
        <div className="min-h-screen px-4 py-10 bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-8">
                    Moderator Dashboard
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {cards.map((card, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate(card.path)}
                            className={`group cursor-pointer rounded-2xl p-6 bg-gradient-to-br ${card.bg} shadow hover:shadow-lg transition-all duration-300`}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-inner">
                                    {card.icon}
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                                    {card.title}
                                </h2>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                                {card.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ModDashboard;
