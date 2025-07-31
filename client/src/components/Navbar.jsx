import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiBell } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../config/api";

export default function Navbar({ handleLogout, setLoggedIn, loggedIn, notifications, filters, setFilters, role, setRole }) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    // isActive now checks for exact match by default
    const isActive = (path) => location.pathname === path;
    const hasUnseen = notifications?.some(n => !n.seen);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await api.get("/verify-token", { withCredentials: true });
                if (res.status === 200 && res.data?.user) {
                    setLoggedIn(true);
                    setRole(res.data?.user.role);
                } else {
                    setLoggedIn(false);
                }
            } catch {
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

    // Consolidated nav links data
    const navLinks = [
        { to: "/community-guidelines", label: "Rules" },
        { to: "/", label: "Dashboard" },
        { to: "/profile", label: "Profile", auth: true },
        { to: "/uploads", label: "My Uploads", auth: true },
        // Conditional link for reports/moderation
        {
            to: role === "moderator" ? "/moderation" : "/reports",
            label: role === "moderator" ? "Moderation" : "My Reports",
            auth: true,
            // Custom active check for moderator paths
            activeCheck: (pathname) => {
                if (role === "moderator") {
                    return ["/moderation", "/user-moderation", "/report-moderation"].some(modPath =>
                        pathname.startsWith(modPath)
                    );
                }
                return pathname === "/reports"; // Fallback for regular users
            }
        },
        { to: "/chat", label: "AI Chat", auth: true }
    ];

    return (
        <header className="bg-white/90 dark:bg-[#111827E6] backdrop-blur border-b border-gray-200 dark:border-gray-700 shadow-md fixed top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">
                    MindStash
                </Link>

                {/* Desktop Menu */}
                <nav className="hidden mdnav:flex space-x-6 items-center text-sm font-medium">
                    {navLinks.map(({ to, label, auth, activeCheck }) => {
                        const isLinkActive = activeCheck ? activeCheck(location.pathname) : isActive(to);
                        return (
                            <Link
                                key={to}
                                to={loggedIn || !auth ? to : "#"}
                                onClick={(e) => {
                                    if (auth && !loggedIn) {
                                        e.preventDefault();
                                        toast.error("Log in first!");
                                        navigate("/auth", { replace: true });
                                    }
                                }}
                                className={`text-sm font-medium transition-colors ${isLinkActive
                                    ? "text-blue-600 dark:text-blue-400 font-semibold"
                                    : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                                    }`}
                            >
                                {label}
                            </Link>
                        );
                    })}

                    {/* Notifications link is handled separately due to the unread badge */}
                    <Link
                        to="/notifications"
                        onClick={(e) => {
                            if (!loggedIn) {
                                e.preventDefault();
                                toast.error("Log in first!");
                                navigate("/auth", { replace: true });
                            }
                        }}
                        className={`relative text-sm font-medium transition-colors ${isActive("/notifications")
                            ? "text-blue-600 dark:text-blue-400 font-semibold"
                            : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                            }`}
                        title="Notifications"
                    >
                        <FiBell size={20} />
                        {hasUnseen && <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full" />}
                    </Link>

                    {loggedIn ? (
                        <button
                            onClick={() => {
                                handleLogout();
                                setLoggedIn(false);
                            }}
                            className="ml-4 px-4 py-2 bg-red-100 dark:bg-red-800/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-700/30 rounded-lg transition active:scale-95"
                        >
                            Logout
                        </button>
                    ) : (
                        <Link
                            to="/auth"
                            className="ml-4 px-4 py-2 bg-blue-100 dark:bg-blue-800/20 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-700/30 rounded-lg transition active:scale-95"
                        >
                            Login
                        </Link>
                    )}
                </nav>

                {/* Mobile Icons */}
                <div className="mdnav:hidden flex items-center gap-4">
                    <Link
                        to="/notifications"
                        title="Notifications"
                        onClick={(e) => {
                            if (!loggedIn) {
                                e.preventDefault();
                                toast.error("Log in first!");
                                navigate("/auth", { replace: true });
                            }
                        }}
                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                    >
                        <FiBell size={22} />
                        {hasUnseen && <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full" />}
                    </Link>

                    <button
                        className="text-gray-700 dark:text-gray-300"
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

            {/* Mobile Dropdown */}
            {isOpen && (
                <div className="mdnav:hidden bg-white dark:bg-gray-900 px-4 py-3 border-t border-gray-200 dark:border-gray-700 shadow space-y-2 pb-3">
                    {navLinks.map(({ to, label, auth, activeCheck }) => {
                        const isLinkActive = activeCheck ? activeCheck(location.pathname) : isActive(to);
                        return (
                            <button
                                key={to}
                                onClick={(e) => handleMobileNav(e, to, auth)}
                                className={`block w-full text-left px-3 py-2 rounded-md transition active:scale-95 ${isLinkActive
                                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-semibold"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    }`}
                            >
                                {label}
                            </button>
                        );
                    })}

                    {loggedIn ? (
                        <button
                            onClick={() => {
                                handleLogout();
                                setLoggedIn(false);
                            }}
                            className="w-full mt-2 py-2 bg-red-100 dark:bg-red-800/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-700/30 rounded-lg transition active:scale-95 mb-3"
                        >
                            Logout
                        </button>
                    ) : (
                        <Link
                            to="/auth"
                            onClick={() => setIsOpen(false)}
                            className="block w-full mt-2 text-center py-2 bg-blue-100 dark:bg-blue-800/20 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-700/30 rounded-lg transition active:scale-95 mb-3"
                        >
                            Login
                        </Link>
                    )}
                </div>
            )}
        </header>
    );
}