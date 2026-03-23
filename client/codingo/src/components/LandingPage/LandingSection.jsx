import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from "react-router-dom";
import Robo from './Robo';
import CodeEditor from '../CodeEditor';

const useCounter = (target, suffix = "", dur = 1800, active = false) => {
  const [val, setVal] = useState("0");
  useEffect(() => {
    if (!active) return;
    const t0 = performance.now();
    const id = setTimeout(() => {
      const tick = (now) => {
        const t = Math.min((now - t0) / dur, 1);
        setVal(Math.floor((1 - Math.pow(1 - t, 3)) * target).toLocaleString() + suffix);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 350);
    return () => clearTimeout(id);
  }, [active, target, suffix, dur]);
  return val;
};

const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
};


const LandingSection = () => {
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate("/Login");
  };
  const handleRegister = () => {
    navigate("/Register");
  }

<<<<<<< HEAD
  const [ref, vis] = useInView(0.05);
  const c0 = useCounter(52000, "+", 1800, vis);
  const c1 = useCounter(18, "+", 1200, vis);
  const c2 = useCounter(1200000, "+", 2200, vis);

  return (
    <div className="min-h-screen justify-between flex flex-col text-white">
      <div className='max-w-lg mx-25 mt-25'></div>
      {/* ---------- HERO ---------- */}
      <section ref={ref} className="min-h-screen pb-20 grid grid-cols-1 lg:grid-cols-2 gap-1 items-center max-w-7xl mx-auto">
        {/* Left */}
        <div className={`fu-init ${vis ? "fu-vis" : ""}`} style={{ transitionDelay: "100ms" }}>
          <h1 className="font-black leading-[1.05] tracking-[-0.03em] mb-5" style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(42px,5vw,68px)" }}>
            Learn to Code<br />
            <span className="g-hero">Without the Bore.</span>
=======
  return (
    <div className="bg-gray-900 min-h-screen flex flex-col font-sans text-white">
      <section className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center py-12 md:py-16 px-4 sm:px-6 lg:px-16 xl:px-24">
        <div className="space-y-6">

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
            <span className=" text-cyan-200 ">
              MASTER YOUR CODE
            </span>
>>>>>>> e00a5573103f84dcb993544902de6c298ac7ce59
          </h1>

          <p className="text-gray-400 leading-[1.75] max-w-110 mb-9" style={{ fontSize: 16 }}>
            Master HTML, CSS, JavaScript, Python and more through hands-on challenges, live code editors, and a curriculum designed to keep you hooked.
          </p>

<<<<<<< HEAD
          <div className="flex items-center gap-4 flex-wrap">
            <button onClick={handleRegister} className="btn-glow inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl border-none cursor-pointer" style={{ fontFamily: "'Syne',sans-serif", fontSize: 14 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              Start Learning
            </button>
            <button className="inline-flex items-center gap-2 px-6 py-3.5 bg-transparent text-gray-200 font-semibold rounded-xl border border-white/10 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-900/20 cursor-pointer transition-all duration-200" style={{ fontFamily: "'Syne',sans-serif", fontSize: 14 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>
              Watch Demo
=======
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button onClick={handleRegister} className="px-6 py-3 rounded-md font-semibold shadow-lg hover:scale-105 transform transition text-left sm:text-center">
              EXPLORE COURSES
            </button>
            <button onClick={handleLogin} className="px-6 py-3 rounded-md border border-white/10 text-sm hover:bg-white/5 transition text-left sm:text-center">
              Learn More
>>>>>>> e00a5573103f84dcb993544902de6c298ac7ce59
            </button>
          </div>

          <div className="flex gap-8 mt-11 pt-8 border-t border-white/[0.07]">
            {[{ v: c0, l: "Active Learners" }, { v: c1, l: "Courses Available" }, { v: c2, l: "Challenges Solved" }].map(s => (
              <div key={s.l}>
                <div className="font-black text-blue-400" style={{ fontFamily: "'Syne',sans-serif", fontSize: 26 }}>{s.v}</div>
                <div className="text-gray-500 mt-0.5" style={{ fontSize: 12 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

<<<<<<< HEAD
        {/* Right editor */}
        <div className={`fu-init absolute right-20 bottom-30 ${vis ? "fu-vis" : ""} hidden lg:block`} style={{ transitionDelay: "300ms" }}>
          <div className="absolute inset-0 blur-2xl animate-pulse bg-cyan-800"></div>
          <CodeEditor />
=======
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
>>>>>>> e00a5573103f84dcb993544902de6c298ac7ce59
        </div>
      </section>
    </div>
  )
}

export default LandingSection