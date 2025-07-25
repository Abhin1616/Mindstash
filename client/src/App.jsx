import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard.jsx';
import axios from 'axios';
import AuthPage from './pages/AuthPage.jsx';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess.jsx';
import CompleteProfile from './components/CompleteProfile.jsx';

const MyUploads = () => <div className="p-4">Uploads Page</div>;
const Chat = () => <div className="p-4">AI Chat Page</div>;
const Notifications = () => <div className="p-4">Notifications Page</div>;

const App = () => {
  const [programs, setPrograms] = useState([]);
  const [sortByRecent, setSortByRecent] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [filters, setFilters] = useState({
    program: 'all',
    branch: 'all',
    semester: 'all',
  });
  const [currentUserId, setCurrentUserId] = useState(null);

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
        } else {
          setCurrentUserId(null);
        }
      } catch (err) {
        setCurrentUserId(null);
      }
    };

    fetchInitialData();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3000/logout", {
        withCredentials: true
      });
      setLoggedIn(false);
      setCurrentUserId(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      <Navbar handleLogout={handleLogout} setLoggedIn={setLoggedIn} loggedIn={loggedIn} />
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
          <Route path="/uploads" element={<MyUploads />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/auth" element={<AuthPage programs={programs} setLoggedIn={setLoggedIn} setCurrentUserId={setCurrentUserId} />} />
          <Route path="/complete-profile" element={<CompleteProfile programs={programs} setLoggedIn={setLoggedIn} setCurrentUserId={setCurrentUserId} />} />
        </Routes>
      </main>
    </>
  );
};

export default App;
