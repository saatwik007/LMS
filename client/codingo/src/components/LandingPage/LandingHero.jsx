import React from "react";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();
  const handleRegister = () => {
    navigate("/Register"); // Navigate to registration page
  }
  return (
    <section className="relative bg-gray-950 overflow-hidden min-h-100">
      <div className="flex flex-col items-center pt-10">
        <h1 className="bg-clip-text text-transparent tracking-wide bg-linear-to-r from-emerald-400 via-cyan-400 to-cyan-600 font-extrabold text-3xl md:text-5xl text-center mb-8 leading-tight">
          learn a language<br />with duolingo
        </h1>
        <button onClick={handleRegister} className="bg-linear-to-br from-cyan-400 via-emerald-400 to-cyan-600 hover:from-cyan-500 hover:to-emerald-500 text-gray-950 transition  font-extrabold px-16 py-3 text-lg md:text-xl rounded-lg shadow mb-8">
          GET STARTED
        </button>
        {/* Mascot and Gamification Illustration */}
        <div className="relative w-full flex justify-center items-center mt-4 h-64">
          {/* Example coins, diamonds, hearts, etc. */}
          <span className="absolute left-10 top-12 text-4xl">💎</span>
          <span className="absolute left-32 top-4 text-4xl">💰</span>
          <span className="absolute left-1/4 -top-4 text-4xl">🪙</span>
          <span className="absolute left-1/2 -translate-x-1/2 -top-6 text-5xl">🔥</span>
          <span className="absolute right-1/4 top-2 text-4xl">💎</span>
          <span className="absolute right-28 top-8 text-4xl">🕒</span>
          <span className="absolute right-12 top-16 text-4xl">💛</span>
          {/* Mascot in a jar placeholder */}
          <div className="relative z-10 mt-8">
            <svg viewBox="0 0 200 180" width="210" height="180" fill="none">
              {/* Jar background */}
              <rect x="30" y="20" width="140" height="130" rx="40" fill="#e6ffda" stroke="#10b981" strokeWidth="10"/>
              {/* Eyes (placeholder for mascot) */}
              <ellipse cx="85" cy="105" rx="14" ry="18" fill="#fff"/>
              <ellipse cx="122" cy="100" rx="13" ry="16" fill="#fff"/>
              <ellipse cx="85" cy="110" rx="5" ry="6" fill="#444"/>
              <ellipse cx="122" cy="107" rx="5" ry="5" fill="#444"/>
              {/* Beak */}
              <ellipse cx="104" cy="119" rx="5" ry="3" fill="#fcaf58"/>
              {/* Mascot base */}
              {/* <ellipse cx="104" cy="135" rx="38" ry="16" fill="#70e000"/> */}
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom green wave */}
      <div className="absolute left-0 right-0 bottom-0 h-36 bg-linear-to-r from-cyan-400 to-emerald-400  rounded-t-[60%]"></div>
    </section>
  );
}