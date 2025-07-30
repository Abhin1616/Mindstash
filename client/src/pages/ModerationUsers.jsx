import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Search } from "lucide-react";
import { CustomButton } from "../components/CustomButton.jsx";
import { CustomCheckbox } from "../components/CustomCheckbox.jsx";
import { CustomInput } from "../components/CustomInput.jsx";
import api from "../config/api.js";

const ModerationUsers = () => {
    const [users, setUsers] = useState([]);
    const [bannedOnly, setBannedOnly] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [actioningId, setActioningId] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = {
                page,
                banned: bannedOnly ? "true" : undefined,
                search: search.trim() ? search.trim() : undefined,
            };
            const res = await api.get("/users", { params });
            setUsers(res.data.users);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, bannedOnly]);

    const handleBanToggle = async (userId, isBanned) => {
        try {
            setActioningId(userId);
            const url = `/api/moderation/users/${userId}/ban`;
            if (isBanned) {
                await api.patch(url, { unban: true });
                toast.success("User unbanned");
            } else {
                const reason = prompt("Enter ban reason (min 10 characters):")?.trim();
                if (!reason || reason.length < 10) {
                    return toast.error("Ban reason must be at least 10 characters.");
                }
                await api.patch(url, { reason });
                toast.success("User banned");
            }
            fetchUsers();
        } catch (err) {
            toast.error("Ban/unban failed");
        } finally {
            setActioningId(null);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
                User Moderation
            </h1>

            {/* Search & Filters */}
            <form
                onSubmit={handleSearchSubmit}
                className="flex flex-col md:flex-row items-center gap-4 mb-6"
            >
                <CustomInput
                    placeholder="Search by email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1"
                />
                <CustomButton type="submit" variant="outline" className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Search
                </CustomButton>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <CustomCheckbox
                        checked={bannedOnly}
                        onChange={() => setBannedOnly((v) => !v)}
                    />
                    Show only banned
                </label>
            </form>

            {/* Loading */}
            {loading ? (
                <div className="text-center py-10">
                    <Loader2 className="animate-spin w-6 h-6 mx-auto text-blue-500" />
                </div>
            ) : (
                <div className="space-y-4">
                    {/* No Users */}
                    {users.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400">
                            No users found.
                        </p>
                    ) : (
                        users.map((user) => (
                            <div
                                key={user._id}
                                className="border dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                            >
                                <div>
                                    <p className="font-semibold text-lg text-gray-800 dark:text-white">
                                        {user.name}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {user.email}
                                    </p>
                                    {user.isBanned && (
                                        <p className="text-sm text-red-600 mt-1">
                                            🚫 <span className="italic">Banned:</span> {user.banReason}
                                        </p>
                                    )}
                                </div>
                                <CustomButton
                                    variant={user.isBanned ? "secondary" : "destructive"}
                                    onClick={() => handleBanToggle(user._id, user.isBanned)}
                                    className="w-full sm:w-auto"
                                    disabled={actioningId === user._id}
                                >
                                    {actioningId === user._id ? (
                                        <Loader2 className="animate-spin w-4 h-4" />
                                    ) : user.isBanned ? (
                                        "Unban"
                                    ) : (
                                        "Ban"
                                    )}
                                </CustomButton>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2 flex-wrap">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <CustomButton
                            key={p}
                            onClick={() => setPage(p)}
                            variant={p === page ? "default" : "outline"}
                            className="px-3 py-1 text-sm"
                        >
                            {p}
                        </CustomButton>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ModerationUsers;
