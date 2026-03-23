import {useEffect, useState} from 'react'
import { FiSearch } from 'react-icons/fi';
import { useNavigate } from "react-router-dom";

function CodifyGlow() {  
  return (
   <svg width="200" height="20" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <rect width="100%" height="100%" fill="#050505" />

  <text 
    x="50%" 
    y="55%" 
    fill="#00EAFF" 
    fontFamily="Arial Rounded MT Bold, Helvetica, sans-serif" 
    fontSize="50" 
    fontWeight="bold"
    textAnchor="middle" 
    dominantBaseline="middle"
    filter="url(#neonGlow)"
    style={{letterSpacing: 1}}
  >
    Codify
  </text> 
</svg>
  );
}

const LandingHeader = ({ onBack }) => {
  const navigate = useNavigate();
  
  const handleRegister = () => {
    navigate("/Register");
  }
  
const [searchVal, setSearchVal] = useState("");
const [scrolled, setScrolled] = useState(false);
        useEffect(() => {
          const fn = () => setScrolled(window.scrollY> 20);
          window.addEventListener("scroll", fn);
          return () => window.removeEventListener("scroll", fn);
        }, []);

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 flex items-center gap-5 px-8 border-b border-white/[0.07] transition-all duration-300 ${scrolled ? "bg-gray-900/95 backdrop-blur-xl shadow-[0_4px_40px_rgba(0,0,0,0.65)]" : "bg-gray-900/80 backdrop-blur-lg"}`} style={{ height: 62 }}>
      <div className="flex justify-between items-center lg:px-9 pt-4 pb-4 bg-gray-900 w-full">
        <div className="flex items-center justify-center">
          <button onClick={onBack} className="text-2xl font-black tracking-tight select-none" style={{ color: "#60a5fa", textShadow: "0 0 18px #3b82f6, 0 0 40px #1d4ed8" }}>
          Codify
        </button>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </span>
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search languages, topics…"
              className="w-full bg-gray-800/60 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500/50 transition"
            />
          </div>
        </div>

        {/* <div className="relative bg-gray-700 mr-150 w-80 h-10 rounded-full">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <FiSearch className="w-5 h-5 text-gray-300" />
          </div>
          <input
            type="text"
            aria-label="Search"
            placeholder="Search on Codify"
            className="pl-10 pr-4 w-full h-full bg-transparent text-sm placeholder-gray-400 border-none focus:outline-none"
          />
        </div> */}
        
        <div className="flex items-center gap-4">
          <nav className="md:flex gap-7 items-center text-sm ">
            <a className="hover:text-gray-300 text-gray-400 cursor-pointer hover:scale-110 transition">Contact Us</a>
            <a className="text-sm bg-gray-700/60 cursor-pointer hover:bg-gray-600/70 text-gray-200 border border-white/10 rounded-full px-4 py-1.5 transition" onClick={handleRegister}>Sign Up</a>
            {/* <a className="hover:text-white border-cyan-500 cursor-pointer hover:scale-110 transition" onClick={handleRegister}>Get Started</a> */}
          </nav>
        </div>
      </div>
    </div>
  );
}

export default LandingHeader;