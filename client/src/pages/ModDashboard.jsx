import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Users2 } from "lucide-react";
import { motion } from "framer-motion";

const ModDashboard = () => {
    const navigate = useNavigate();

    const moderationSections = [
        {
            header: "Content Moderation",
            cards: [
                {
                    title: "Reports",
                    description: "Review and moderate reported materials.",
                    icon: (
                        <ShieldAlert className="w-8 h-8 text-blue-600 group-hover:drop-shadow-glow" />
                    ),
                    path: "/report-moderation",
                    bg: "from-blue-100 to-blue-200 dark:from-blue-950 dark:to-blue-900",
                },
            ],
        },
        {
            header: "User Moderation",
            cards: [
                {
                    title: "Users",
                    description: "Manage user bans and violations.",
                    icon: (
                        <Users2 className="w-8 h-8 text-purple-600 group-hover:drop-shadow-glow" />
                    ),
                    path: "/user-moderation",
                    bg: "from-purple-100 to-purple-200 dark:from-purple-950 dark:to-purple-900",
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen px-4 py-10 bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-10">
                    Moderator Dashboard
                </h1>

                {moderationSections.map((section, i) => (
                    <div key={i} className="mb-10">
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
                            {section.header}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {section.cards.map((card, idx) => (
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
                                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                                            {card.title}
                                        </h3>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        {card.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ModDashboard;
