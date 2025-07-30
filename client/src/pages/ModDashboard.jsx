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
        <div className="min-h-screen px-6 py-12 bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-12 text-center">
                    Moderator Dashboard
                </h1>

                <div className="grid gap-12 md:grid-cols-2">
                    {moderationSections.map((section, i) => (
                        <div key={i}>
                            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">
                                {section.header}
                            </h2>
                            <div className="grid gap-6">
                                {section.cards.map((card, idx) => (
                                    <motion.div
                                        key={idx}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate(card.path)}
                                        className={`group cursor-pointer rounded-2xl p-6 bg-gradient-to-br ${card.bg} shadow-md hover:shadow-xl transition-all duration-300`}
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
        </div>
    );
};

export default ModDashboard;
