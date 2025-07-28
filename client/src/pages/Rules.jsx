import React, { useEffect, useState } from "react";
import api from "../config/api.js";
import { ShieldAlert } from "lucide-react";

const Rules = () => {
    const [rules, setRules] = useState([]);

    useEffect(() => {
        const fetchRules = async () => {
            try {
                const res = await api.get("/rules", { withCredentials: true });
                setRules(res.data);
            } catch (error) {
                console.error("Failed to fetch rules:", error);
            }
        };
        fetchRules();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="mb-14 text-center">
                <div className="inline-flex items-center justify-center gap-3 flex-wrap">
                    <ShieldAlert className="text-red-500 dark:text-red-400 shrink-0" size={30} />
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100">
                        Community Guidelines
                    </h2>
                </div>
                <p className="mt-3 text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    We believe in a respectful and constructive learning environment. These rules help ensure that.
                </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {rules.map((rule) => (
                    <div
                        key={rule.id}
                        className="group bg-white/90 dark:bg-zinc-900/90 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200 mb-2">
                            {rule.title}
                        </h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {rule.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Rules;
