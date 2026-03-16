import './App.css'
import axios from 'axios';
import { BrowserRouter, Routes, Route, useParams, useNavigate, Navigate, useLocation } from "react-router-dom";
import LoginPage from './pages/LoginPage.jsx'
import RegisterationPage from './pages/RegisterationPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import SignupNextPage from './pages/SignupNextPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import WelcomePage from './pages/WelcomePage.jsx';
import LevelsPage from './pages/LevelsPage';
import LanguagePage from './pages/LanguagePage.jsx';
import LearnPage from './pages/LearnPage.jsx';
import { useEffect, useState } from 'react';
import LandingPage from './pages/LandingPage.jsx';
import LandingHeader from './components/LandingPage/LandingHeader.jsx';
import AppSidebar from './components/Layout/AppSidebar.jsx';

function ProtectedRoute({ children }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function checkAuth() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('token');

        const response = await axios.get(`${apiUrl}/api/auth/user/me`, {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (!isActive) return;
        if (response.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          setIsAllowed(true);
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setIsAllowed(false);
        }
      } catch {
        if (!isActive) return;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setIsAllowed(false);
      } finally {
        if (isActive) setIsChecking(false);
      }
    }

    checkAuth();
    return () => {
      isActive = false;
    };
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-[60vh] bg-[#0f1419] text-gray-200 grid place-items-center">
        Checking your session...
      </div>
    );
  }

  return isAllowed ? children : <Navigate to="/login" replace />;
}

function App() {

  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

function AppShell() {
  const location = useLocation();
  const sidebarHiddenRoutes = ['/', '/login', '/Login', '/signup', '/next-step'];
  const showSidebar = !sidebarHiddenRoutes.includes(location.pathname);

  return (
    <>
      <LandingHeader />
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        {showSidebar ? <AppSidebar /> : null}
        <div className="flex-1 min-w-0">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/language/:langId" element={<LanguagePageWrapper />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/Login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterationPage />} />
          <Route path="/Register" element={<RegisterationPage />} />
          <Route path="/signup" element={<SignupPage  />} />
          <Route path="/next-step" element={<SignupNextPage  />} />
          <Route
            path="/dashboard"
            element={(
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/Dashboard"
            element={(
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            )}
          />
          <Route path="/welcome" element={<WelcomePage  />} />
          <Route path="/Welcome" element={<WelcomePage  />} />
          <Route
            path="/levels"
            element={(
              <ProtectedRoute>
                <LevelsPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/learn"
            element={(
              <ProtectedRoute>
                <LearnPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/Learn"
            element={(
              <ProtectedRoute>
                <LearnPage />
              </ProtectedRoute>
            )}
          />
          <Route path="/levels/:courseId" element={<LevelsPageWrapper />} />
          <Route path="/languagepage" element={<LanguagePage />} />
        </Routes>
        </div>
      </div>
    </>
  )
}

function LanguagePageWrapper() {
  const { langId } = useParams();
  const navigate = useNavigate();

    useEffect(() => {
    window.scrollTo(0, 0);
  }, [langId]);

  return (
    <LanguagePage
      langId={langId}
      onBack={() => navigate("/")}
    />
  );
}

function LevelsPageWrapper() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const hasSession = Boolean(localStorage.getItem('user') || localStorage.getItem('token'));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [courseId]);

  if (!hasSession) {
    return <Navigate to="/login" replace />;
  }

  return <LevelsPage courseId={courseId} onBack={() => navigate("/dashboard")} />;
}

export default App
