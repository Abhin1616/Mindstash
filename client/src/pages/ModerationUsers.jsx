import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2, Search } from "lucide-react";
import { CustomButton } from "../components/CustomButton";
import { CustomCheckbox } from "../components/CustomCheckBox";
import { CustomInput } from "../components/CustomInput";

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
            const res = await axios.get("/users", { params });
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
                await axios.patch(url, { unban: true });
                toast.success("User unbanned");
            } else {
                const reason = prompt("Enter ban reason (min 10 characters):")?.trim();
                if (!reason || reason.length < 10) {
                    return toast.error("Ban reason must be at least 10 characters.");
                }
                await axios.patch(url, { reason });
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
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-center">User Moderation</h1>

            <form
                onSubmit={handleSearchSubmit}
                className="flex flex-col sm:flex-row gap-2 mb-4 items-center"
            >
                <CustomInput
                    placeholder="Search by email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-auto flex-1"
                />
                <CustomButton type="submit" variant="outline" className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Search
                </CustomButton>
                <label className="flex items-center gap-2">
                    <CustomCheckbox checked={bannedOnly} onCheckedChange={() => setBannedOnly((v) => !v)} />
                    Show only banned
                </label>
            </form>

            {loading ? (
                <div className="text-center py-10">
                    <Loader2 className="animate-spin w-6 h-6 mx-auto" />
                </div>
            ) : (
                <div className="space-y-4">
                    {users.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400">No users found</p>
                    ) : (
                        users.map((user) => (
                            <div
                                key={user._id}
                                className="border dark:border-gray-700 p-4 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center"
                            >
                                <div className="flex flex-col">
                                    <p className="font-medium text-lg">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                    {user.isBanned && (
                                        <p className="text-red-500 text-sm mt-1">
                                            🚫 Banned: <span className="italic">{user.banReason}</span>
                                        </p>
                                    )}
                                </div>
                                <CustomButton
                                    variant={user.isBanned ? "secondary" : "destructive"}
                                    className="mt-3 sm:mt-0"
                                    onClick={() => handleBanToggle(user._id, user.isBanned)}
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

            {totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <CustomButton
                            key={p}
                            onClick={() => setPage(p)}
                            variant={p === page ? "default" : "outline"}
                            className="px-3"
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
