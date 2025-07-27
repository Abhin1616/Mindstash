import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiBell } from "react-icons/fi";
import toast from "react-hot-toast";
import { Search } from 'lucide-react'
import api from "../config/api";
export default function Navbar({ handleLogout, setLoggedIn, loggedIn, notifications, filters, setFilters, role, setRole }) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
    const hasUnseen = notifications?.some(n => !n.seen);
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await api.get("/verify-token", {
                    withCredentials: true,
                });
                if (res.status === 200 && res.data?.user) {
                    setLoggedIn(true);
                    setRole(res.data?.user.role)
                } else {
                    setLoggedIn(false);
                }
            } catch (err) {
                setLoggedIn(false);
            }
        };

        checkAuth();
    }, []);

    const handleMobileNav = (e, path, requiresAuth = false) => {
        if (requiresAuth && !loggedIn) {
            e.preventDefault();
            toast.error("Log in first!");
            navigate("/auth", { replace: true });
            setIsOpen(false);
            return;
        }
        setIsOpen(false);
        navigate(path);
    };
    const [localSearch, setLocalSearch] = useState(filters.search || '');

    const handleSearchClick = () => {
        setFilters(prev => ({ ...prev, search: localSearch.trim() }));
        setLocalSearch("");
    };
    return (
        <header className="bg-white/90 backdrop-blur border-b border-gray-200 shadow-md fixed top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link to="/" className="text-xl font-bold text-blue-600 tracking-tight">
                    MindStash
                </Link>

                {/* Desktop Menu */}
                <nav className="hidden mdnav:flex space-x-6 items-center text-sm font-medium">
                    <div className="relative w-64">
                        <input
                            type="text"
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearchClick();
                            }}
                            placeholder="Search materials..."
                            className="w-full pl-4 pr-10 py-2 rounded-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 dark:text-white"
                        />
                        <button
                            onClick={handleSearchClick}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                    </div>

                    <Link
                        to="/community-guidelines"
                        className={`text-sm font-medium ${isActive("/community-guidelines") ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-600"}`}
                    >
                        Rules
                    </Link>
                    <Link
                        to="/"
                        className={`text-sm font-medium ${isActive("/") ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-600"}`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        to={loggedIn ? "/profile" : "#"}
                        onClick={(e) => {
                            if (!loggedIn) {
                                e.preventDefault();
                                toast.error("Log in first!");
                                navigate("/auth", { replace: true });
                            }
                        }}
                        className={`text-sm font-medium ${isActive("/profile") ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-600"}`}
                    >
                        Profile
                    </Link>
                    <Link
                        to={loggedIn ? "/uploads" : "#"}
                        onClick={(e) => {
                            if (!loggedIn) {
                                e.preventDefault();
                                toast.error("Log in first!");
                                navigate("/auth", { replace: true });
                            }
                        }}
                        className={`text-sm font-medium ${isActive("/uploads") ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-600"}`}
                    >
                        My Uploads
                    </Link>
                    <Link
                        to={loggedIn ? (role == "moderator" ? "/report-moderation" : "/reports") : "#"}
                        onClick={(e) => {
                            if (!loggedIn) {
                                e.preventDefault();
                                toast.error("Log in first!");
                                navigate("/auth", { replace: true });
                            }
                        }}
                        className={`text-sm font-medium ${isActive("/reports") || isActive("/report-moderation")
                            ? "text-blue-600 font-semibold"
                            : "text-gray-700 hover:text-blue-600"
                            }`}
                    >
                        {role == "moderator" ? "Moderation" : "My Reports"}
                    </Link>
                    <Link
                        to="/chat"
                        className={`text-sm font-medium ${isActive("/chat") ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-600"}`}
                    >
                        AI Chat
                    </Link>

                    <Link
                        to="/notifications"
                        onClick={(e) => {
                            if (!loggedIn) {
                                e.preventDefault();
                                toast.error("Log in first!");
                                navigate("/auth", { replace: true });
                            }
                        }}
                        className={`relative text-sm font-medium ${isActive("/notifications") ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-600"
                            }`}
                        title="Notifications"
                    >
                        <FiBell size={20} />
                        {hasUnseen && (
                            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full" />
                        )}
                    </Link>

                    {loggedIn ? (
                        <button
                            onClick={() => {
                                handleLogout()
                                setLoggedIn(false)
                            }}
                            className="ml-4 px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition active:scale-95"
                        >
                            Logout
                        </button>
                    ) : (
                        <Link
                            to="/auth"
                            className="ml-4 px-4 py-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition active:scale-95"
                        >
                            Login
                        </Link>
                    )}
                </nav>

                {/* Mobile Right Icons */}
                <div className="mdnav:hidden flex items-center gap-4">
                    <button
                        onClick={(e) => handleMobileNav(e, "/notifications", true)}
                        title="Notifications"
                        className="text-gray-700 hover:text-blue-600 transition"
                    >
                        <FiBell size={22} />
                    </button>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="text-gray-700 focus:outline-none"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="mdnav:hidden bg-white px-4 py-3 border-t border-gray-200 shadow-sm space-y-1">
                    <div className="relative w-full">
                        <input
                            type="text"
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearchClick();
                            }}
                            placeholder="Search materials..."
                            className="w-full pl-4 pr-10 py-2 rounded-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 dark:text-white"
                        />
                        <button
                            onClick={() => {
                                handleSearchClick()
                                setIsOpen(false)
                            }}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                    </div>
                    <button
                        onClick={(e) => handleMobileNav(e, "/community-guidelines", false)}
                        className={`block w-full text-left px-3 py-2 rounded-md transition-all active:scale-95 ${isActive("/community-guidelines") ? "bg-blue-100 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-100"}`}
                    >
                        Rules
                    </button>
                    <button
                        onClick={(e) => handleMobileNav(e, "/", false)}
                        className={`block w-full text-left px-3 py-2 rounded-md transition-all active:scale-95 ${isActive("/") ? "bg-blue-100 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-100"}`}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={(e) => handleMobileNav(e, "/profile", true)}
                        className={`block w-full text-left px-3 py-2 rounded-md transition-all active:scale-95 ${isActive("/profile") ? "bg-blue-100 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-100"}`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={(e) => handleMobileNav(e, "/uploads", true)}
                        className={`block w-full text-left px-3 py-2 rounded-md transition-all active:scale-95 ${isActive("/uploads") ? "bg-blue-100 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-100"}`}
                    >
                        My Uploads
                    </button>
                    <button
                        onClick={(e) => handleMobileNav(e, role === "moderator" ? "/report-moderation" : "/reports", true)}
                        className={`block w-full text-left px-3 py-2 rounded-md transition-all active:scale-95 ${isActive("/reports") || isActive("/report-moderation")
                            ? "bg-blue-100 text-blue-600 font-semibold"
                            : "text-gray-700 hover:text-blue-600"
                            }`}
                    >
                        {role === "moderator" ? "Moderation" : "My Reports"}
                    </button>

                    <button
                        onClick={(e) => handleMobileNav(e, "/chat", false)}
                        className={`block w-full text-left px-3 py-2 rounded-md transition-all active:scale-95 ${isActive("/chat") ? "bg-blue-100 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-100"}`}
                    >
                        AI Chat
                    </button>

                    {loggedIn ? (
                        <button
                            onClick={() => {
                                handleLogout()
                                setLoggedIn(false)
                            }}
                            to="/"
                            className="w-full mt-2 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition active:scale-95"
                        >
                            Logout

                        </button>
                    ) : (
                        <Link
                            to="/auth"
                            onClick={() => {
                                setIsOpen(false)
                            }}
                            className="block w-full mt-2 text-center py-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition active:scale-95"
                        >
                            Login
                        </Link>
                    )}
                </div>
            )}
        </header>
    );
}
