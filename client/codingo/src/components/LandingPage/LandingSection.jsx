import React from 'react'
import { useNavigate } from "react-router-dom";
import Robo from './Robo';


const   LandingSection = () => {
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate("/Login");
  };
  const handleRegister = () => {
    navigate("/Register");
  }

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col font-sans text-white">
      <section className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center py-12 md:py-16 px-4 sm:px-6 lg:px-16 xl:px-24">
        <div className="space-y-6">

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
            <span className=" text-cyan-200 ">
              MASTER YOUR CODE
            </span>
          </h1>

          <p className="text-gray-300 max-w-xl">
            Interactive courses for <strong>Python</strong>, <strong>Java</strong>, <strong>JavaScript</strong>, <strong>C++</strong>, and more — built with hands-on projects, challenges, and leaderboards.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button onClick={handleRegister} className="px-6 py-3 rounded-md font-semibold shadow-lg hover:scale-105 transform transition text-left sm:text-center">
              EXPLORE COURSES
            </button>
            <button onClick={handleLogin} className="px-6 py-3 rounded-md border border-white/10 text-sm hover:bg-white/5 transition text-left sm:text-center">
              Learn More
            </button>
          </div>
        </div>

        {/* ---------- CODE EDITOR MOCK ---------- */}
        <div className="relative rounded-lg w-full max-w-xl mx-auto lg:ml-auto">
          <div className="absolute inset-0 blur-2xl animate-pulse bg-cyan-800/40"></div>
          <div className="relative rounded-2xl overflow-hidden border bg-gray-900 border-white/5">
            {/* top bar */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-800">
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="ml-auto text-xs text-gray-400">Test your codes here</div>
            </div>

            {/* code area */}
            <pre className="p-4 sm:p-6 text-xs sm:text-sm leading-relaxed font-mono opacity-65 text-green-500 overflow-x-auto">
              {`class Octobanner {
    String name = "shield";
    Octoitem = new Octototem("window_banner_shield");
    System.out.println("Data set for loot octotem socket"); 
}

void onAwaken() {
    name = Octototem("Unleash Your Dev");
    result = 4;
    return result;
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pt-4 pb-4 px-6 mt-auto bg-gray-900 border-t border-b border-gray-800">
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