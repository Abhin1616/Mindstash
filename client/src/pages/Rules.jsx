import React, { useEffect, useState } from "react";
import api from '../config/api.js';
import { ShieldAlert } from "lucide-react";

const Rules = () => {
    const [rules, setRules] = useState([]);

    useEffect(() => {
        const fetchRules = async () => {
            try {
                const res = await api.get("http://localhost:3000/rules", {
                    withCredentials: true,
                });
                setRules(res.data);
            } catch (error) {
                console.error("Failed to fetch rules:", error);
            }
        };
        fetchRules();
    }, []);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-12 text-center">
                <div className="inline-flex items-center justify-center gap-2 flex-wrap">
                    <ShieldAlert className="text-red-500 dark:text-red-400 shrink-0" size={26} />
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-gray-100">
                        Community Guidelines
                    </h2>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                    These are the rules that help keep our platform respectful, safe, and enjoyable for everyone.
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rules.map((rule) => (
                    <div
                        key={rule.id}
                        className="group bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                        <div className="flex items-start gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                                {rule.title}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {rule.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Rules;