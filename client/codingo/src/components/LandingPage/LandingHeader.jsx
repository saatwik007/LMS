import React from 'react'
import { useNavigate } from "react-router-dom";

const LandingHeader = () => {
  const navigate = useNavigate();
  const handleRegister = () => {
    navigate("/Register");
  }
  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-gray-950 bg-opacity-95 backdrop-blur-md border-b border-gray-800">
      <div className="flex justify-between items-center px-4 lg:px-20 pt-4 pb-4 bg-gray-950 w-full">
        <span className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-emerald-400 via-cyan-400 to-violet-400 tracking-tight">CODYSSEY</span>
        <button onClick={handleRegister} className="bg-linear-to-br from-cyan-400 via-emerald-400 to-cyan-600 hover:from-cyan-500 hover:to-emerald-500 text-gray-950 font-bold text-lg px-6 py-2 rounded-xl shadow-lg transition">GET STARTED</button>
      </div>
    </div>
  )
}

export default LandingHeader