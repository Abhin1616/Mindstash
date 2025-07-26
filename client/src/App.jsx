import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, replace } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard.jsx';
import axios from 'axios';
import AuthPage from './pages/AuthPage.jsx';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess.jsx';
import CompleteProfile from './components/CompleteProfile.jsx';
import MyUploads from './pages/MyUploads.jsx';
import UploadMaterial from './pages/UploadMaterial.jsx';
import Profile from './pages/Profile.jsx';
import MyReports from './pages/MyReports.jsx';
import MyNotifications from './pages/MyNotifications.jsx';
import Rules from './pages/Rules.jsx';

const Chat = () => <div className="p-4">AI Chat Page</div>;

const App = () => {
  const navigate = useNavigate()
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
  const toggleSort = () => {
    setSortByRecent(prev => !prev);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch programs
        const progRes = await axios.get('http://localhost:3000/programs');
        setPrograms(progRes.data);

        // Verify token and get user
        const authRes = await axios.get('http://localhost:3000/verify-token', {
          withCredentials: true,
        });

        if (authRes.status === 200 && authRes.data?.user) {
          setCurrentUserId(authRes.data.user.id);
          setLoggedIn(true);
        } else {
          setCurrentUserId(null);
          setLoggedIn(false);
        }
      } catch (err) {
        setCurrentUserId(null);
        setLoggedIn(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get('http://localhost:3000/notifications', {
          withCredentials: true,
        });
        setNotifications(res.data.notifications);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };

    if (currentUserId) {
      fetchNotifications();
    }
  }, [currentUserId]);


  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3000/logout", {
        withCredentials: true
      });
      setLoggedIn(false);
      setCurrentUserId(null);
      navigate('/', { replace: true })
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };


  return (
    <>
      <Navbar handleLogout={handleLogout} setLoggedIn={setLoggedIn} loggedIn={loggedIn} notifications={notifications} filters={filters} setFilters={setFilters} />
      <main className="bg-gray-50 min-h-screen pt-16">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
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
          <Route path="/upload-material" element={<UploadMaterial />} />
          <Route path="/chat" element={<Chat />} />
          {notifications && <Route path="/notifications" element={<MyNotifications notifications={notifications} setNotifications={setNotifications} />} />}
          <Route path="/auth" element={<AuthPage programs={programs} setLoggedIn={setLoggedIn} setCurrentUserId={setCurrentUserId} />} />
          <Route path="/complete-profile" element={<CompleteProfile programs={programs} setLoggedIn={setLoggedIn} setCurrentUserId={setCurrentUserId} />} />

        </Routes>
      </main>
    </>
  );
};

export default App;
