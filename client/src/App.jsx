import React, { useEffect, useState, useRef } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard.jsx';
import AuthPage from './pages/AuthPage.jsx';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess.jsx';
import CompleteProfile from './components/CompleteProfile.jsx';
import MyUploads from './pages/MyUploads.jsx';
import UploadMaterial from './pages/UploadMaterial.jsx';
import Profile from './pages/Profile.jsx';
import MyReports from './pages/MyReports.jsx';
import MyNotifications from './pages/MyNotifications.jsx';
import Rules from './pages/Rules.jsx';
import ModerationReports from './pages/ModerationReports.jsx';
import Chat from './pages/Chat.jsx';
import api from './config/api.js';
import { toast } from 'react-hot-toast';
import ModDashboard from './pages/ModDashboard.jsx';
import ModerationUsers from './pages/ModerationUsers.jsx';

const App = () => {
  const navigate = useNavigate();

  const [programs, setPrograms] = useState([]);
  const [sortByRecent, setSortByRecent] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [filters, setFilters] = useState({
    program: 'all',
    branch: 'all',
    semester: 'all',
    search: '',
  });
  const [currentUserId, setCurrentUserId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [role, setRole] = useState([]);
  const [isBanned, setIsBanned] = useState(false);
  const banHandledRef = useRef(false);

  const toggleSort = () => setSortByRecent(prev => !prev);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const progRes = await api.get('/programs');
        setPrograms(progRes.data);

        const authRes = await api.get('/verify-token', { withCredentials: true });

        if (authRes.status === 200 && authRes.data?.user) {
          setCurrentUserId(authRes.data.user.userId);
          setRole(authRes.data.user.role);
          setIsBanned(authRes.data.user.isBanned)
          setLoggedIn(true);
        } else {
          setCurrentUserId(null);
          setRole(null);
          setIsBanned(false);
          setLoggedIn(false);
        }
      } catch {
        setCurrentUserId(null);
        setRole(null);
        setIsBanned(false);
        setLoggedIn(false);
      }
    };

    fetchInitialData();
  }, [role, loggedIn]);

  useEffect(() => {
    if (isBanned && !banHandledRef.current) {
      banHandledRef.current = true;

      const handleBan = async () => {
        toast.error("You’ve been banned and logged out");

        try {
          await api.get("/logout", { withCredentials: true });
          document.cookie = "acc_token=; Max-Age=0; path=/;";

        } catch (err) {
          console.error("Logout during ban failed:", err);
        }

        setLoggedIn(false);
        setCurrentUserId(null);
        setRole(null);
        navigate("/auth");
      };

      handleBan();
    }
  }, [isBanned, navigate]);




  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get("/verify-token", { withCredentials: true });
        if (res.data?.user?.isBanned) {
          setIsBanned(true);
        }
      } catch (err) {
        console.error("Verify-token polling failed", err);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);


  const handleLogout = async () => {
    try {
      await api.get('/logout', { withCredentials: true });
      setRole(null);
      setLoggedIn(false);
      setCurrentUserId(null);
      navigate('/', { replace: true });
      toast.success("Logged out sucessfully")
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  useEffect(() => {
    if (!loggedIn) return;

    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications", { withCredentials: true });
        if (res.data?.notifications) {
          setNotifications(res.data.notifications);
        }
      } catch (err) {
        console.error("Error fetching notifications", err);
      }
    };

    fetchNotifications(); // Initial fetch

    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [loggedIn]);


  return (
    <div className="bg-zinc-50 dark:bg-zinc-900 text-gray-900 dark:text-white min-h-screen transition-colors duration-300">
      <Navbar
        key={role}
        handleLogout={handleLogout}
        setLoggedIn={setLoggedIn}
        loggedIn={loggedIn}
        notifications={notifications}
        filters={filters}
        setFilters={setFilters}
        role={role}
        setRole={setRole}
      />

      <main className="pt-16 px-2 sm:px-4 md:px-6 lg:px-8 pb-12">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                key={role}
                role={role}
                programs={programs}
                filters={filters}
                sortByRecent={sortByRecent}
                setFilters={setFilters}
                toggleSort={toggleSort}
                currentUserId={currentUserId}
              />
            }
          />
          <Route path="/google-auth-success" element={<GoogleAuthSuccess />} />
          <Route path="/uploads" element={<MyUploads currentUserId={currentUserId} />} />
          <Route path="/community-guidelines" element={<Rules />} />
          <Route path="/reports" element={<MyReports />} />
          <Route path="/profile" element={<Profile programs={programs} />} />
          <Route path="/upload-material" element={<UploadMaterial currentUserId={currentUserId} programs={programs} />} />
          <Route path="/chat" element={<Chat />} />
          {notifications && (
            <Route
              path="/notifications"
              element={<MyNotifications notifications={notifications} setNotifications={setNotifications} />}
            />
          )}
          <Route
            path="/auth"
            element={
              <AuthPage
                programs={programs}
                setLoggedIn={setLoggedIn}
                setCurrentUserId={setCurrentUserId}
              />
            }
          />
          <Route
            path="/complete-profile"
            element={
              <CompleteProfile
                programs={programs}
                setLoggedIn={setLoggedIn}
                setCurrentUserId={setCurrentUserId}
              />
            }
          />
          <Route path="/moderation" element={<ModDashboard />} />
          <Route path="/user-moderation" element={<ModerationUsers />} />
          <Route path="/report-moderation" element={<ModerationReports />} />
          <Route path="/ask-ai" element={<Chat />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
