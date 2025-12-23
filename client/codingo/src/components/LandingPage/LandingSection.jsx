import React from 'react'
import { useNavigate } from "react-router-dom";
import Robo from './Robo';


const LandingSection = () => {
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate("/Login");
  };
  const handleRegister = () => {
    navigate("/Register");
  }

  return (
    <div className="bg-gray-950 min-h-screen flex flex-col font-sans text-white">
      {/* HEADER */}
      {/* MAIN SECTION */}
      <main className="flex flex-col md:flex-row items-center flex-1 px-6 md:px-0 max-w-6xl mx-auto gap-12 md:gap-32">
        {/* Hero image/illustration */}
        <div className="w-full md:w-1/2">
          <Robo />
        </div>
        {/* Main content */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Level Up <span className="text-cyan-400">Your Coding</span> Journey!
          </h1>
          <p className="text-lg md:text-xl font-medium text-gray-400 mb-10 max-w-md mx-auto md:mx-0">
            Learn, compete, and conquer <span className="text-emerald-400">coding challenges</span> — gamified for ultimate fun and mastery.
          </p>
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5 justify-center md:justify-start">
            <button
              onClick={handleRegister}
              className="bg-linear-to-br from-cyan-400 via-emerald-400 to-cyan-600 hover:from-cyan-500 hover:to-emerald-500 text-gray-950 font-bold px-8 py-4 rounded-xl shadow-xl text-lg transition duration-150">
              Get Started
            </button>
            <button
              onClick={handleLogin}
              className="bg-gray-800/70 border border-gray-700 hover:border-cyan-500 text-cyan-400 font-semibold px-8 py-4 rounded-xl shadow-none text-base transition"
            >
              I already have an account
            </button>
          </div>
        </div>
      </main>
      {/* FOOTER */}
      <footer className="pt-4 pb-4 px-6 mt-auto bg-gray-950 border-t border-b border-gray-800">
        <div className="flex flex-wrap gap-4 justify-center items-center text-gray-500 text-sm">
          {/* <span>&copy; {new Date().getFullYear()} Codyssey</span> */}
          {/* <span>|</span> */}
          <span className="text-cyan-400 font-bold">PYTHON</span>
          <span className="text-emerald-400 font-bold">JAVASCRIPT</span>
          <span className="font-bold">JAVA</span>
          <span className="font-bold">C++</span>
          <span className="font-bold">GO</span>
          <span className="font-bold">TYPESCRIPT</span>
        </div>
      </footer>
    </div>
  )
}

export default LandingSection