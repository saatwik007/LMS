import './App.css'
import LandingPage from './pages/Landingpage'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from './pages/LoginPage.jsx'
import RegisterationPage from './pages/RegisterationPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import SignupNextPage from './pages/SignupNextPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import WelcomePage from './pages/WelcomePage.jsx';

function App() {


  return (
    // <>
    // <LandingPage/>
    // <Route path="/Login" element={<LoginPage />} />
    // </>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/Login" element={<LoginPage />} />
        <Route path="/Register" element={<RegisterationPage />} />
        <Route path="/signup" element={<SignupPage  />} />
        <Route path="/next-step" element={<SignupNextPage  />} />
        <Route path="/Dashboard" element={<DashboardPage  />} />
        <Route path="/Welcome" element={<WelcomePage  />} />

        {/* Add more routes as needed */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
