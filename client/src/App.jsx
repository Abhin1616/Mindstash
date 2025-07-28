import React, { useEffect, useState } from 'react';
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

  const toggleSort = () => setSortByRecent(prev => !prev);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const progRes = await api.get('/programs');
        setPrograms(progRes.data);

        const authRes = await api.get('/verify-token', { withCredentials: true });

        if (authRes.status === 200 && authRes.data?.user) {
          setCurrentUserId(authRes.data.user.id);
          setRole(authRes.data.user.role);
          setLoggedIn(true);
        } else {
          setCurrentUserId(null);
          setRole(null);
          setLoggedIn(false);
        }
      } catch {
        setCurrentUserId(null);
        setRole(null);
        setLoggedIn(false);
      }
    };

    fetchInitialData();
  }, [role, loggedIn]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications', { withCredentials: true });
        setNotifications(res.data.notifications);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };

    if (currentUserId) fetchNotifications();
  }, [currentUserId]);

  const handleLogout = async () => {
    try {
      await api.get('/logout', { withCredentials: true });
      setRole(null);
      setLoggedIn(false);
      setCurrentUserId(null);
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white min-h-screen transition-colors duration-300">
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
          <Route path="/report-moderation" element={<ModerationReports />} />
          <Route path="/ask-ai" element={<Chat />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
