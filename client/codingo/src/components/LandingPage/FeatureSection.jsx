import React, { useState } from "react";
// import { LanguagePage, HomePage } from "../../../../../../../Users/rahul/Downloads/Codify";

// You can replace these emoji and bg gradients with your own SVGs/images
const Features = [
  {
    title: "free. fun. effective.",
    color: "text-cyan-400",
    bg: "bg-gradient-to-tr from-gray-800 via-cyan-900 to-gray-800",
    desc: (
      <>
        Learning with <span className="font-bold text-cyan-400">Codify</span> is fun.<br />
        With quick, bite-sized coding challenges, you'll earn XP, unlock levels, and master skills step by step.
      </>
    ),
    img: (
      <div className="flex flex-col items-center">
        {/* Phone + #1 badge + coder emoji */}
        <div className="relative">
          <div className="w-36 h-56 rounded-xl border-4 border-cyan-500 bg-black flex flex-col items-center">
            <div className="w-24 h-3 rounded-xl bg-gray-700 mt-6 mb-5">
              <div className="h-full bg-emerald-400 rounded-xl w-2/3"></div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 mb-4">
              <div className="w-12 h-12 flex items-center justify-center bg-red-800 rounded-lg text-2xl">🦉</div>
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


// const languages = [
//   { id: "python", title: "PYTHON FUNDAMENTALS", color: "from-green-400 to-green-600", icon: PythonIcon },
//   { id: "java", title: "JAVA MASTERY", color: "from-red-400 to-red-600", icon: JavaIcon },
//   { id: "javascript", title: "JAVASCRIPT INTERACTIVE", color: "from-yellow-400 to-yellow-600", icon: JsIcon },
//   { id: "cpp", title: "C++ ESSENTIALS", color: "from-blue-400 to-blue-600", icon: CppIcon },
//   { id: "python", title: "PYTHON FUNDAMENTALS", color: "from-green-400 to-green-600", icon: PythonIcon },
//   { id: "java", title: "JAVA MASTERY", color: "from-red-400 to-red-600", icon: JavaIcon },
//   { id: "python", title: "PYTHON FUNDAMENTALS", color: "from-green-400 to-green-600", icon: PythonIcon },
//   { id: "java", title: "JAVA MASTERY", color: "from-red-400 to-red-600", icon: JavaIcon }
// ];

function PythonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="80" height="80" viewBox="0 0 50 50">
      <path fill="#0277bd" d="M24.047,5c-1.555,0.005-2.633,0.142-3.936,0.367c-3.848,0.67-4.549,2.077-4.549,4.67V14h9v2H15.22	h-4.35c-2.636,0-4.943,1.242-5.674,4.219c-0.826,3.417-0.863,5.557,0,9.125C5.851,32.005,7.294,34,9.931,34h3.632v-5.104	c0-2.966,2.686-5.896,5.764-5.896h7.236c2.523,0,5-1.862,5-4.377v-8.586c0-2.439-1.759-4.263-4.218-4.672	C27.406,5.359,25.589,4.994,24.047,5z M19.063,9c0.821,0,1.5,0.677,1.5,1.502c0,0.833-0.679,1.498-1.5,1.498	c-0.837,0-1.5-0.664-1.5-1.498C17.563,9.68,18.226,9,19.063,9z"></path><path fill="#ffc107" d="M23.078,43c1.555-0.005,2.633-0.142,3.936-0.367c3.848-0.67,4.549-2.077,4.549-4.67V34h-9v-2h9.343	h4.35c2.636,0,4.943-1.242,5.674-4.219c0.826-3.417,0.863-5.557,0-9.125C41.274,15.995,39.831,14,37.194,14h-3.632v5.104	c0,2.966-2.686,5.896-5.764,5.896h-7.236c-2.523,0-5,1.862-5,4.377v8.586c0,2.439,1.759,4.263,4.218,4.672	C19.719,42.641,21.536,43.006,23.078,43z M28.063,39c-0.821,0-1.5-0.677-1.5-1.502c0-0.833,0.679-1.498,1.5-1.498	c0.837,0,1.5,0.664,1.5,1.498C29.563,38.32,28.899,39,28.063,39z"></path>
    </svg>
  );
}
function JavaIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
<path fill="#F44336" d="M23.65,24.898c-0.998-1.609-1.722-2.943-2.725-5.455C19.229,15.2,31.24,11.366,26.37,3.999c2.111,5.089-7.577,8.235-8.477,12.473C17.07,20.37,23.645,24.898,23.65,24.898z"></path><path fill="#F44336" d="M23.878,17.27c-0.192,2.516,2.229,3.857,2.299,5.695c0.056,1.496-1.447,2.743-1.447,2.743s2.728-0.536,3.579-2.818c0.945-2.534-1.834-4.269-1.548-6.298c0.267-1.938,6.031-5.543,6.031-5.543S24.311,11.611,23.878,17.27z"></path><g><path fill="#1565C0" d="M32.084 25.055c1.754-.394 3.233.723 3.233 2.01 0 2.901-4.021 5.643-4.021 5.643s6.225-.742 6.225-5.505C37.521 24.053 34.464 23.266 32.084 25.055zM29.129 27.395c0 0 1.941-1.383 2.458-1.902-4.763 1.011-15.638 1.147-15.638.269 0-.809 3.507-1.638 3.507-1.638s-7.773-.112-7.773 2.181C11.683 28.695 21.858 28.866 29.129 27.395z"></path><path fill="#1565C0" d="M27.935,29.571c-4.509,1.499-12.814,1.02-10.354-0.993c-1.198,0-2.974,0.963-2.974,1.889c0,1.857,8.982,3.291,15.63,0.572L27.935,29.571z"></path><path fill="#1565C0" d="M18.686,32.739c-1.636,0-2.695,1.054-2.695,1.822c0,2.391,9.76,2.632,13.627,0.205l-2.458-1.632C24.271,34.404,17.014,34.579,18.686,32.739z"></path><path fill="#1565C0" d="M36.281,36.632c0-0.936-1.055-1.377-1.433-1.588c2.228,5.373-22.317,4.956-22.317,1.784c0-0.721,1.807-1.427,3.477-1.093l-1.42-0.839C11.26,34.374,9,35.837,9,37.017C9,42.52,36.281,42.255,36.281,36.632z"></path><path fill="#1565C0" d="M39,38.604c-4.146,4.095-14.659,5.587-25.231,3.057C24.341,46.164,38.95,43.628,39,38.604z"></path></g>
</svg>
  );
}
function JsIcon(props) {
  return (
        <svg
      width="80"
      height="80"
      viewBox="0 0 64 64"
      className="w-20 h-20"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="JavaScript logo"
      {...props}
    >
      <rect width="64" height="64" rx="8" fill="#FFFF00" />
      <text
        x="50%"
        y="65%"
        textAnchor="middle"
        fontSize="28"
        fontWeight="500"
        fill="#000"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        JS
      </text>
    </svg>
)
}
function CppIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
<path fill="#00549d" fill-rule="evenodd" d="M22.903,3.286c0.679-0.381,1.515-0.381,2.193,0 c3.355,1.883,13.451,7.551,16.807,9.434C42.582,13.1,43,13.804,43,14.566c0,3.766,0,15.101,0,18.867 c0,0.762-0.418,1.466-1.097,1.847c-3.355,1.883-13.451,7.551-16.807,9.434c-0.679,0.381-1.515,0.381-2.193,0 c-3.355-1.883-13.451-7.551-16.807-9.434C5.418,34.899,5,34.196,5,33.434c0-3.766,0-15.101,0-18.867 c0-0.762,0.418-1.466,1.097-1.847C9.451,10.837,19.549,5.169,22.903,3.286z" clip-rule="evenodd"></path><path fill="#0086d4" fill-rule="evenodd" d="M5.304,34.404C5.038,34.048,5,33.71,5,33.255 c0-3.744,0-15.014,0-18.759c0-0.758,0.417-1.458,1.094-1.836c3.343-1.872,13.405-7.507,16.748-9.38 c0.677-0.379,1.594-0.371,2.271,0.008c3.343,1.872,13.371,7.459,16.714,9.331c0.27,0.152,0.476,0.335,0.66,0.576L5.304,34.404z" clip-rule="evenodd"></path><path fill="#fff" fill-rule="evenodd" d="M24,10c7.727,0,14,6.273,14,14s-6.273,14-14,14 s-14-6.273-14-14S16.273,10,24,10z M24,17c3.863,0,7,3.136,7,7c0,3.863-3.137,7-7,7s-7-3.137-7-7C17,20.136,20.136,17,24,17z" clip-rule="evenodd"></path><path fill="#0075c0" fill-rule="evenodd" d="M42.485,13.205c0.516,0.483,0.506,1.211,0.506,1.784 c0,3.795-0.032,14.589,0.009,18.384c0.004,0.396-0.127,0.813-0.323,1.127L23.593,24L42.485,13.205z" clip-rule="evenodd"></path><path fill="#fff" fill-rule="evenodd" d="M31 21H33V27H31zM38 21H40V27H38z" clip-rule="evenodd"></path><path fill="#fff" fill-rule="evenodd" d="M29 23H35V25H29zM36 23H42V25H36z" clip-rule="evenodd"></path>
</svg>
  );
}


const languages = [
  { id: "python", title: "Python Fundamentals", sub: "Beginner-friendly", cardGradient: "from-blue-500 to-cyan-400", icon: PythonIcon, border: "border-blue-500/30" },
  { id: "java", title: "Java Mastery", sub: "Enterprise-grade", cardGradient: "from-red-500 to-orange-400", icon: JavaIcon, border: "border-red-500/30" },
  { id: "javascript", title: "JavaScript Interactive", sub: "Web & beyond", cardGradient: "from-yellow-400 to-amber-500", icon: JsIcon, border: "border-yellow-500/30" },
  { id: "cpp", title: "C++ Essentials", sub: "High performance", cardGradient: "from-blue-600 to-indigo-500", icon: CppIcon, border: "border-blue-600/30" },
];


export default function FeaturesPage({onSelect}) {

  
  return (
    <div>
        <section className="py-10 px-6 bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-7 rounded-full bg-blue-500" />
              <h2 className="text-xl font-bold text-white">Featured Courses</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {languages.map((lang) => {
                const Icon = lang.icon;
                return (
                  <button
                    key={lang.id + lang.title}
                    onClick={() => onSelect(lang.id)}
                    className={`group relative rounded-2xl cursor-pointer p-6 overflow-hidden border ${lang.border} bg-gray-800/80 text-white hover:scale-105 transition-all duration-200 shadow-lg text-left focus:outline-none`}
                    style={{ minHeight: "220px" }}
                  >
                    {/* Gradient hover overlay */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-linear-to-br ${lang.cardGradient}`} />
                    <div className="relative flex flex-col items-start gap-4 h-full">
                      <div className="mx-auto">
                        <Icon size={64} />
                      </div>
                      <div className="mt-auto">
                        <h3 className="text-base font-bold text-white">{lang.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{lang.sub}</p>
                        <div className="mt-3 flex gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-gray-400 border border-white/5">View</span>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-linear-to-r ${lang.cardGradient}`}>Enroll →</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>






      {/* <section className="py-8 bg-gray-900">
        <button className="bg-gray-700 ml-15 text-2xl font-bold text-gray-300 rounded px-3 py-2">Featured Courses</button>

        <div className="grid p-5 max-w-360 mx-auto grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {languages.map((lang) => (

            <article

              key={lang.id}

              className="relative rounded-xl p-6 overflow-hidden border border-white/10 bg-gray-800 text-white transform hover:scale-105 h-60 transition shadow-lg">
              

              <div className="relative flex flex-col items-start gap-4">

                <div className="p-1 rounded mx-auto">

                  {React.createElement(lang.icon)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{lang.title}</h3>
                  <div className="mt-4 flex gap-3">
                    <button className="px-3 py-1 rounded bg-white/5 text-xs">View</button>
                    <button className="px-3 py-1 rounded text-xs">Enroll</button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section> */}


      <main className="min-h-screen bg-gray-900 w-full pt-20 px-2 py-8 flex flex-col">
        {/* Features grid */}
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-24 md:gap-32">
          {Features.map((f, idx) => (
            <div
              key={f.title}
              className={`flex flex-col md:flex-row ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''
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
    </div>
  );
}   

