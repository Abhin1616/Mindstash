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
            icon: <ShieldAlert className="w-8 h-8 text-blue-500" />,
            path: "/report-moderation",
            bg: "bg-blue-100 dark:bg-blue-950"
        },
        {
            title: "Bans",
            description: "Ban or unban users who violate guidelines.",
            icon: <Ban className="w-8 h-8 text-red-500" />,
            path: "/ban-users",
            bg: "bg-red-100 dark:bg-red-950"
        }
    ];

    return (
        <div className="min-h-screen px-4 py-8 bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Moderator Dashboard</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {cards.map((card, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className={`rounded-2xl shadow-md p-6 cursor-pointer transition-colors ${card.bg}`}
                            onClick={() => navigate(card.path)}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-full shadow">
                                    {card.icon}
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{card.title}</h2>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">{card.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ModDashboard;
