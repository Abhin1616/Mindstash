import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiBell } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";

export default function Navbar({ handleLogout, setLoggedIn, loggedIn }) {
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await axios.get("http://localhost:3000/verify-token", {
                    withCredentials: true,
                });
                if (res.status === 200 && res.data?.user) {
                    console.log(res.data?.user)
                    setLoggedIn(true);
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


    return (
        <header className="bg-white/90 backdrop-blur border-b border-gray-200 shadow-md fixed top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link to="/" className="text-xl font-bold text-blue-600 tracking-tight">
                    MindStash
                </Link>

                {/* Desktop Menu */}
                <nav className="hidden md:flex space-x-6 items-center text-sm font-medium">
                    <Link to="/" className={`text-sm font-medium ${isActive("/") ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-600"}`}
                    >Dashboard</Link>

                    <Link
                        to={loggedIn ? "/uploads" : "#"}
                        onClick={(e) => {
                            if (!loggedIn) {
                                e.preventDefault();
                                toast.error("Log in first!");
                                navigate("/auth", { replace: true });
                            }
                        }}
                        className={`text-sm font-medium ${isActive("/uploads")
                            ? "text-blue-600 font-semibold"
                            : "text-gray-700 hover:text-blue-600"
                            }`}
                    >
                        My Uploads
                    </Link>

                    <Link
                        to={loggedIn ? "/reports" : "#"}
                        onClick={(e) => {
                            if (!loggedIn) {
                                e.preventDefault();
                                toast.error("Log in first!");
                                navigate("/auth", { replace: true });
                            }
                        }}
                        className={`text-sm font-medium ${isActive("/reports")
                            ? "text-blue-600 font-semibold"
                            : "text-gray-700 hover:text-blue-600"
                            }`}
                    >
                        My Reports
                    </Link>
                    <Link to="/chat" className={`text-sm font-medium ${isActive("/chat") ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-600"}`}
                    >AI Chat</Link>

                    <Link to="/notifications" className={`text-sm font-medium ${isActive("/notifications") ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-600"}`}
                        title="Notifications">
                        <FiBell size={20} />
                    </Link>

                    {loggedIn ? (
                        <button
                            onClick={handleLogout}
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

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-gray-700 focus:outline-none"
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

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white px-4 py-3 border-t border-gray-200 shadow-sm space-y-1">
                    <button
                        onClick={(e) => handleMobileNav(e, "/", false)}
                        className={`block w-full text-left px-3 py-2 rounded-md transition-all active:scale-95 ${isActive("/") ? "bg-blue-100 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        Dashboard
                    </button>

                    <button
                        onClick={(e) => handleMobileNav(e, "/uploads", true)}
                        className={`block w-full text-left px-3 py-2 rounded-md transition-all active:scale-95 ${isActive("/uploads") ? "bg-blue-100 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        My Uploads
                    </button>
                    <button
                        onClick={(e) => handleMobileNav(e, "/reports", true)}
                        className={`block w-full text-left px-3 py-2 rounded-md transition-all active:scale-95 ${isActive("/reports") ? "bg-blue-100 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        My Reports
                    </button>
                    <button
                        onClick={(e) => handleMobileNav(e, "/chat", false)}
                        className={`block w-full text-left px-3 py-2 rounded-md transition-all active:scale-95 ${isActive("/chat") ? "bg-blue-100 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        AI Chat
                    </button>
                    <button
                        onClick={(e) => handleMobileNav(e, "/notifications", true)}
                        className={`block w-full text-left px-3 py-2 rounded-md transition-all active:scale-95 ${isActive("/notifications") ? "bg-blue-100 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        Notifications
                    </button>

                    {loggedIn ? (
                        <button
                            onClick={handleLogout}
                            className="w-full mt-2 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition active:scale-95"
                        >
                            Logout
                        </button>
                    ) : (
                        <Link
                            to="/auth"
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
