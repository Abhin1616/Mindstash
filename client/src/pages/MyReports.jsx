import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import api from "../config/api";
dayjs.extend(relativeTime);

const MyReports = () => {
    const [reports, setReports] = useState([]);
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [rulesRes, reportsRes] = await Promise.all([
                    api.get("/rules"),
                    api.get("/reports/myreports", { withCredentials: true })
                ]);
                setRules(rulesRes.data);
                setReports(reportsRes.data);
            } catch (err) {
                console.error("Failed to fetch reports or rules", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    const getBrokenRuleDetails = (brokenRuleIds) => {
        return rules.filter(rule => brokenRuleIds.includes(rule.id));
    };

    if (loading) {
        return <div className="text-center mt-10 text-gray-500 dark:text-gray-300">Loading your reports...</div>;
    }

    if (reports.length === 0) {
        return <div className="text-center mt-10 text-gray-500 dark:text-gray-300">You haven’t submitted any reports yet.</div>;
    }

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">My Reports</h2>
            <div className="space-y-4">
                {reports.map((report) => {
                    const brokenRules = getBrokenRuleDetails(report.brokenRules);
                    return (
                        <div
                            key={report._id}
                            className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm bg-white dark:bg-zinc-900"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                    {report.materialTitle}
                                </h3>
                                <span
                                    className={`text-xs px-2 py-1 rounded-full ${report.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                        : report.status === "accepted"
                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                        }`}
                                >
                                    {report.status}
                                </span>
                            </div>

                            {report.isMaterialDeleted && (
                                <div className="flex items-center text-sm text-red-600 dark:text-red-400 mb-2">
                                    <AlertTriangle className="h-4 w-4 mr-1" />
                                    This material has been deleted.
                                </div>
                            )}

                            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                Reported {dayjs(report.createdAt).fromNow()}
                            </div>

                            <div className="mb-2">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Reason:</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{report.reason}</p>
                            </div>

                            {brokenRules.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Violated Rules:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        {brokenRules.map((rule) => (
                                            <li key={rule.id} className="text-sm text-gray-600 dark:text-gray-300">
                                                <span className="font-semibold">{rule.title}</span>: {rule.description}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {report.moderatorComment && report.moderatorComment.trim() !== "" && (
                                <div className="mt-3">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Moderator Comment:</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{report.moderatorComment}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MyReports;
