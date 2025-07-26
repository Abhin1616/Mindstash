import React, { useEffect } from "react";
import axios from "axios";
import { FiBell } from "react-icons/fi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const MyNotifications = ({ notifications, setNotifications }) => {
    useEffect(() => {
        const markAllSeen = async () => {
            try {
                await axios.patch(
                    "http://localhost:3000/notifications/mark-all-seen",
                    {},
                    { withCredentials: true }
                );
                setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
            } catch (err) {
                console.error("Failed to mark notifications as seen", err);
            }
        };
        markAllSeen();
    }, []);

    if (!notifications || notifications.length === 0) {
        return (
            <div className="text-center mt-10 text-gray-500 dark:text-gray-300">
                You haven’t received any notifications yet.
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                My Notifications
            </h2>

            <div className="space-y-4">
                {notifications.map((notif) => (
                    <div
                        key={notif._id}
                        className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm bg-white dark:bg-zinc-900"
                    >
                        <div className="flex justify-between items-start mb-1">
                            <p className="text-sm text-gray-800 dark:text-white leading-relaxed">
                                {notif.message}
                            </p>
                            {!notif.seen && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 ml-2">
                                    New
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            {dayjs(notif.createdAt).fromNow()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyNotifications;
