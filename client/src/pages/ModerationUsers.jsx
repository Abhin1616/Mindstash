import React, { useEffect, useState } from "react";
import { Loader2, Search, Users } from "lucide-react";
import toast from "react-hot-toast";
import api from "../config/api.js";
import BanUserModal from "./BanUserModal.jsx";

const ModerationUsers = () => {
    const [users, setUsers] = useState([]);
    const [userCount, setUserCount] = useState(0);
    const [bannedOnly, setBannedOnly] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [actioningId, setActioningId] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [banModalUser, setBanModalUser] = useState(null);
    const handleModalClose = () => setBanModalUser(null);
    const [isSearching, setIsSearching] = useState(false);

    const fetchUsers = async (pageToFetch = 1, reset = false, searchOverride = null) => {
        if (loading || (!hasMore && !reset)) return;

        try {
            setLoading(true);
            const params = {
                page: pageToFetch,
                banned: bannedOnly ? "true" : undefined,
                search: searchOverride !== null ? searchOverride.trim() : search.trim() || undefined,
            };

            const res = await api.get("/users", { params });

            if (reset) {
                setUsers(res.data.users);
            } else {
                setUsers((prev) => [...prev, ...res.data.users]);
            }

            setUserCount(res.data.userCount || 0);
            setPage(pageToFetch);
            setTotalPages(res.data.totalPages);
            setHasMore(pageToFetch < res.data.totalPages);
        } catch (err) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const bottomReached =
                window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;
            if (bottomReached && hasMore && !loading) {
                fetchUsers(page + 1);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [page, hasMore, loading]);

    useEffect(() => {
        setUsers([]);
        setPage(1);
        setHasMore(true);
        fetchUsers(1, true);
    }, [bannedOnly]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!search.trim()) return;

        setIsSearching(true);
        setUsers([]);
        setPage(1);
        setHasMore(false);
        fetchUsers(1, true);
    };

    const handleClearSearch = () => {
        setSearch("");
        setIsSearching(false);
        setUsers([]);
        setPage(1);
        setHasMore(true);
        fetchUsers(1, true, "");
    };


    const handleBanToggle = async (userId, isBanned) => {
        try {
            setActioningId(userId);
            const banUrl = `/ban-user/${userId}`;
            const unBanUrl = `/unban-user/${userId}`;

            if (isBanned) {
                await api.patch(unBanUrl, { unban: true });
                toast.success("User unbanned");
            } else {
                const reason = prompt("Enter ban reason (min 10 characters):")?.trim();
                if (!reason || reason.length < 10) {
                    return toast.error("Ban reason must be at least 10 characters.");
                }
                await api.post(banUrl, { reason });
                toast.success("User banned");
            }

            setUsers((prev) =>
                prev.map((user) =>
                    user._id === userId ? { ...user, isBanned: !isBanned } : user
                )
            );
        } catch (err) {
            toast.error("Ban/unban failed");
        } finally {
            setActioningId(null);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 text-gray-800 dark:text-gray-100">
            <h1 className="text-3xl font-bold mb-8">User Moderation</h1>

            {/* Search and Filter */}
            <form
                onSubmit={handleSearch}
                className="flex flex-col md:flex-row gap-4 items-center mb-4"
            >
                <div className="flex w-full md:w-auto flex-1">
                    <input
                        type="text"
                        placeholder="Search by email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-2 border rounded-l-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-md flex items-center gap-2"
                    >
                        <Search className="w-4 h-4" />
                        Search
                    </button>
                </div>
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={bannedOnly}
                        onChange={() => setBannedOnly((prev) => !prev)}
                        className="w-4 h-4 accent-blue-600"
                    />
                    Show only banned
                </label>
            </form>

            {/* User Count */}
            {!loading && (
                <div className="w-full text-center mb-8">
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Total users: {" "}
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {userCount}
                        </span>
                    </p>
                </div>
            )}
            {isSearching && (
                <div className="text-center mb-6">
                    <button
                        onClick={handleClearSearch}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Clear search
                    </button>
                </div>
            )}

            {/* User List */}
            {users.length === 0 && !loading ? (
                <p className="text-center text-gray-500 dark:text-gray-400">No users found.</p>
            ) : (
                <div className="space-y-4">
                    {users.map((user) => (
                        <div
                            key={user._id}
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow transition hover:shadow-md"
                        >
                            <div>
                                <p className="font-semibold text-lg">{user.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {user.email}
                                </p>
                                {user.isBanned && (
                                    <p className="text-sm text-red-600 mt-1">
                                        🚫 <span className="italic">Banned:</span> {user.banReason}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() =>
                                    user.isBanned
                                        ? handleBanToggle(user._id, true)
                                        : setBanModalUser({ ...user, id: user._id, _id: user._id })
                                }
                                disabled={actioningId === user._id}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition ${user.isBanned
                                    ? "bg-gray-500 hover:bg-gray-600 text-white"
                                    : "bg-red-600 hover:bg-red-700 text-white"
                                    } ${actioningId === user._id ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                {actioningId === user._id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : user.isBanned ? (
                                    "Unban"
                                ) : (
                                    "Ban"
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {loading && (
                <div className="text-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                </div>
            )}
            {!loading && !hasMore && users.length > 0 && search.trim() === "" && (
                <p className="text-center text-gray-500 mt-6">No more users to load.</p>
            )}

            {banModalUser && (
                <BanUserModal
                    user={banModalUser}
                    onClose={(banInfo) => {
                        handleModalClose();
                        if (banInfo?.success && banInfo.id) {
                            setUsers((prev) =>
                                prev.map((u) =>
                                    u._id === banInfo.id
                                        ? { ...u, isBanned: true, banReason: banInfo.reason }
                                        : u
                                )
                            );
                        }
                    }}
                />
            )}
        </div>
    );
};

export default ModerationUsers;