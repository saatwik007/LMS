import './App.css'
import { BrowserRouter, Routes, Route, useParams, useNavigate } from "react-router-dom";
import LoginPage from './pages/LoginPage.jsx'
import RegisterationPage from './pages/RegisterationPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import SignupNextPage from './pages/SignupNextPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import WelcomePage from './pages/WelcomePage.jsx';
import LevelsPage from './pages/LevelsPage';
import LanguagePage from './pages/LanguagePage.jsx';
import { useEffect, useState } from 'react';
import LandingPage from './pages/LandingPage.jsx';

function App() {

const [currentLang, setCurrentLang] = useState(null);

  if (currentLang) {
    return (
      <LanguagePage
        langId={currentLang}
        onBack={() => setCurrentLang(null)}
      />
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/language/:langId" element={<LanguagePageWrapper />} />
        <Route path="/Login" element={<LoginPage />} />
        <Route path="/Register" element={<RegisterationPage />} />
        <Route path="/signup" element={<SignupPage  />} />
        <Route path="/next-step" element={<SignupNextPage  />} />
        <Route path="/Dashboard" element={<DashboardPage  />} />
        <Route path="/Welcome" element={<WelcomePage  />} />
        <Route path="/levels" element={<LevelsPage />} />
        <Route path="/levels/:courseId" element={<LevelsPageWrapper />} />
        <Route path="/languagepage" element={<LanguagePage />} /> 
        {/* Add more routes as needed */}
      </Routes>
    </BrowserRouter>
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [courseId]);

  return <LevelsPage courseId={courseId} onBack={() => navigate("/dashboard")} />;
}

export default App
