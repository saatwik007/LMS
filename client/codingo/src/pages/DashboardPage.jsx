import React from "react";
import { FaRegStar, FaTrophy, FaChartLine, FaUsers, FaUser, FaEllipsisH } from "react-icons/fa";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#151f23] flex font-sans text-white">
      {/* Sidebar */}
      <aside className="flex flex-col min-w-[70px] w-56 bg-[#1a2834] border-r border-[#222] py-6 px-1">
        <div className="text-2xl font-extrabold text-lime-400 pl-7 mb-10">codyssey</div>
        <nav className="flex flex-col gap-2 font-bold">
          <SidebarLink active icon={<FaRegStar />} label="Learn" />
          <SidebarLink icon={<FaChartLine />} label="Letters" />
          <SidebarLink icon={<FaTrophy />} label="Leaderboards" />
          <SidebarLink icon={<FaUsers />} label="Guests" />
          <SidebarLink icon={<FaUser />} label="Profile" />
          <SidebarLink icon={<FaEllipsisH />} label="More" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row p-4 md:p-8 gap-8">
        {/* Learning Path (center) */}
        <section className="flex-1 flex items-start justify-center">
          <div className="w-full max-w-lg flex flex-col items-center">
            {/* Section Banner */}
            <div className="bg-lime-500 rounded-lg px-6 py-3 text-gray-950 mb-6 font-extrabold w-full text-center">
              &lt; SECTION 1, UNIT 1 <br />
              Pair letters and sounds
            </div>
            {/* Learning Steps */}
            <div className="flex flex-col items-center gap-4 mt-4">
              {/* Step 1 */}
              <StepCircle active>
                <span className="text-green-400 font-bold">START</span>
              </StepCircle>
              {/* Progress Line */}
              <StepLine />
              {/* Step 2 - locked */}
              <StepCircle locked />
              <StepLine />
              {/* Step 3 - locked */}
              <StepCircle locked />
              {/* Chest/Goal */}
              <StepLine />
              <div className="w-16 h-16 bg-[#1a2834] rounded-full border-4 border-gray-600 flex items-center justify-center">
                {/* Chest or trophy placeholder */}
                <FaTrophy className="text-yellow-400 text-3xl" />
              </div>
              {/* Mascot (placeholder SVG) */}
              <div className="mt-10"><OwlMascot /></div>
              <div className="mt-4 text-base text-white/70">Pair letters and sounds</div>
              {/* Jump Here Button */}
              <button className="mt-4 px-8 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg">
                JUMP HERE!
              </button>
            </div>
          </div>
        </section>

        {/* Right Sidebar */}
        <aside className="w-full md:w-80 flex-shrink-0 flex flex-col gap-4">
          {/* Upgrade Card */}
          <div className="bg-[#212d3b] rounded-2xl p-4 mb-2 shadow border border-[#223]">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-gradient-to-tr from-cyan-400 to-violet-500 rounded-full p-2">
                {/* Cute mascot/star/feather here */}
                <FaRegStar className="text-white text-2xl" />
              </span>
              <div className="font-extrabold text-base text-white">Try Super for free</div>
            </div>
            <p className="text-xs text-white/70 mb-2">No ads, personalized practice, and unlimited Legendary</p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-2 px-5 w-full font-bold mt-2 shadow">
              TRY 1 WEEK FREE
            </button>
          </div>
          {/* Leaderboard Card */}
          <div className="bg-[#212d3b] rounded-2xl p-4 mb-2 shadow border border-[#223]">
            <div className="font-bold mb-2 text-white">Good job!</div>
            <p className="text-sm text-white/70 mb-2">You finished #15 and kept your position in the Sapphire League.</p>
            <button className="bg-[#244a61] hover:bg-blue-900 text-white rounded-xl py-2 px-3 w-full font-bold shadow">
              GO TO LEADERBOARDS
            </button>
          </div>
          {/* Daily Quests Card */}
          <div className="bg-[#212d3b] rounded-2xl p-4 shadow border border-[#223]">
            <div className="flex items-center justify-between">
              <div className="font-bold text-white">Daily Quests</div>
              <button className="text-blue-300 text-xs font-bold hover:underline">VIEW ALL</button>
            </div>
            <ul className="mt-2 text-sm">
              <li className="flex items-center gap-3 mb-1">
                <span className="text-yellow-400 text-lg">★</span>
                Earn 10 XP
              </li>
              <li className="flex items-center gap-3 mb-1">
                <span className="text-cyan-400 text-lg">🕒</span>
                Spend 5 minutes learning
              </li>
              <li className="flex items-center gap-3">
                <span className="text-orange-400 text-lg">🔥</span>
                Get 10 in a row correct in 2 lessons
              </li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}

// Sidebar link component
function SidebarLink({ icon, label, active }) {
  return (
    <div
      className={`flex items-center px-7 py-2 rounded-lg gap-4 text-lg cursor-pointer ${
        active ? "bg-lime-600 text-gray-950" : "hover:bg-gray-800 text-lime-200"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}
// Step circle for progress path
function StepCircle({ active, locked, children }) {
  if (locked)
    return <div className="w-12 h-12 bg-gray-900 rounded-full border-2 border-gray-700 flex items-center justify-center text-gray-500 text-xl">★</div>;
  if (active)
    return (<div className="w-12 h-12 bg-lime-400 rounded-full border-2 border-lime-500 flex items-center justify-center text-gray-950 font-extrabold">{children}</div>);
  return (<div className="w-12 h-12 bg-gray-800 rounded-full border-2 border-gray-500 flex items-center justify-center"></div>);
}
function StepLine() {
  return <div className="w-1 h-8 bg-gray-700 rounded mx-auto"></div>;
}
// Mascot placeholder SVG
function OwlMascot() {
  return (
    <svg width="90" height="90" viewBox="0 0 90 90">
      <ellipse cx="45" cy="55" rx="30" ry="28" fill="#a3e635" />
      <ellipse cx="32" cy="53" rx="7" ry="9" fill="#fff" />
      <ellipse cx="58" cy="51" rx="7" ry="9" fill="#fff" />
      <ellipse cx="34" cy="56" rx="2" ry="3" fill="#222" />
      <ellipse cx="56" cy="54" rx="2" ry="3" fill="#222" />
      <ellipse cx="45" cy="70" rx="7" ry="4" fill="#2dd4bf" />
    </svg>
  );
}