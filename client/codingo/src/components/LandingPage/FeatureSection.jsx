import React from "react";

// You can replace these emoji and bg gradients with your own SVGs/images
const Features = [
  {
    title: "free. fun. effective.",
    color: "text-cyan-400",
    bg: "bg-gradient-to-tr from-gray-800 via-cyan-900 to-gray-800",
    desc: (
      <>
        Learning with <span className="font-bold text-cyan-400">Codyssey</span> is fun.<br />
        With quick, bite-sized coding challenges, you'll earn XP, unlock levels, and master skills step by step.
      </>
    ),
    img: (
      <div className="flex flex-col items-center">
        {/* Phone + #1 badge + coder emoji */}
        <div className="relative">
          <div className="w-36 h-56 rounded-xl border-4 border-cyan-500 bg-gray-900 flex flex-col items-center">
            <div className="w-24 h-3 rounded-xl bg-gray-700 mt-6 mb-5">
              <div className="h-full bg-emerald-400 rounded-xl w-2/3"></div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 mb-4">
              <div className="w-12 h-12 flex items-center justify-center bg-gray-800 rounded-lg text-2xl">🦉</div>
              <div className="w-12 h-12 flex items-center justify-center bg-gray-800 rounded-lg text-2xl text-yellow-400">⭐</div>
              <div className="w-12 h-12 flex items-center justify-center bg-gray-800 rounded-lg text-2xl text-cyan-300">{`{}`}</div>
              <div className="w-12 h-12 flex items-center justify-center bg-gray-800 rounded-lg text-2xl">👩‍💻</div>
            </div>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 flex flex-col items-center">
            <div className="bg-yellow-400 text-gray-900 px-4 py-1 text-md font-bold rounded-full border-4 border-gray-950 shadow">#1</div>
            <span className="text-4xl mt-2">🧑‍💻</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "backed by science",
    color: "text-emerald-400",
    bg: "bg-gradient-to-tr from-gray-800 via-emerald-900 to-gray-800",
    desc: (
      <>
        We use research-backed teaching methods and real-world problem-solving to foster coding mastery, critical thinking, and confidence.
      </>
    ),
    img: (
      <div className="flex flex-col items-center">
        <div className="w-32 h-32 rounded-xl bg-gray-900 flex items-center justify-center text-6xl shadow-lg">
          👩‍🔬
        </div>
        <div className="pt-3 text-lg text-emerald-300 font-semibold">Learn by doing</div>
      </div>
    ),
  },
  {
    title: "stay motivated",
    color: "text-cyan-400",
    bg: "bg-gradient-to-bl from-gray-800 via-cyan-900 to-gray-800",
    desc: (
      <>
        Join friendly leaderboards, earn streaks and badges, and climb to the top. Gamified learning keeps you engaged (and addicted—in a good way)!
      </>
    ),
    img: (
      <div className="flex flex-col items-center">
        <div className="w-32 h-32 rounded-xl bg-gray-900 flex items-center justify-center text-6xl shadow-lg">
          🏆
        </div>
        <div className="pt-3 text-lg text-cyan-300 font-semibold">Top of the board</div>
      </div>
    ),
  },
  {
    title: "personalized learning",
    color: "text-emerald-400",
    bg: "bg-gradient-to-br from-gray-800 via-emerald-900 to-gray-800",
    desc: (
      <>
        AI-driven skill maps and adaptive challenges become your coding co-pilot—
        helping you grow at your own pace and fill your gaps faster.
      </>
    ),
    img: (
      <div className="flex flex-col items-center">
        <div className="w-32 h-32 rounded-xl bg-gray-900 flex items-center justify-center text-6xl shadow-lg">
          🤖
        </div>
        <div className="pt-3 text-lg text-emerald-300 font-semibold">Smart & adaptive</div>
      </div>
    ),
  },
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-gray-950 w-full px-2 py-8 flex flex-col">


      {/* Features grid */}
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-24 md:gap-32">
        {Features.map((f, idx) => (
          <div
            key={f.title}
            className={`flex flex-col md:flex-row ${
              idx % 2 === 1 ? 'md:flex-row-reverse' : ''
            } items-center md:items-start md:justify-between gap-10`}
          >
            {/* Text block */}
            <div className="w-full md:w-1/2 flex flex-col items-center md:items-start justify-center px-3 md:px-0">
              <h3 className={`text-2xl md:text-3xl font-bold mb-2 lowercase ${f.color}`}>{f.title}</h3>
              <p className="text-gray-200 text-base md:text-lg font-medium">{f.desc}</p>
            </div>
            {/* Illustration */}
            <div className="w-full md:w-1/2 flex justify-center">{f.img}</div>
          </div>
        ))}
      </div>
    </main>
  );
}   