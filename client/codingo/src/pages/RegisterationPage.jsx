import React from "react";
import LandingHeader from "../components/LandingPage/LandingHeader.jsx";
import { useNavigate } from "react-router-dom";

// Coding languages with icons (use your own SVGs or web devicon links)
const codingLanguages = [
  { name: "HTML5", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg", learners: "1.5M learners" },
  { name: "CSS3", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg", learners: "1.4M learners" },
  { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg", learners: "980K learners" },
  { name: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg", learners: "920K learners" },
  { name: "Angular", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg", learners: "720K learners" },
  { name: "Vue.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg", learners: "680K learners" },
  { name: "Express.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg", learners: "600K learners" },
  { name: "MongoDB", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg", learners: "590K learners" },
  { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg", learners: "860K learners" },
  { name: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg", learners: "1.2M learners" },
  { name: "Java", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg", learners: "840K learners" },
  { name: "C++", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg", learners: "755K learners" },
  { name: "C#", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg", learners: "675K learners" },
  { name: "TypeScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg", learners: "642K learners" },
  { name: "Go", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg", learners: "580K learners" },
  { name: "Kotlin", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg", learners: "464K learners" },
  { name: "Swift", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg", learners: "384K learners" },
  { name: "PHP", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg", learners: "365K learners" },
  { name: "Ruby", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg", learners: "322K learners" },
  { name: "Scala", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/scala/scala-original.svg", learners: "298K learners" },
  { name: "Dart", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dart/dart-original.svg", learners: "280K learners" },
  { name: "Haskell", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/haskell/haskell-original.svg", learners: "189K learners" },
  { name: "Perl", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/perl/perl-original.svg", learners: "165K learners" },
  { name: "Elixir", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/elixir/elixir-original.svg", learners: "120K learners" },
  // ...you can add more!
];

export default function CodingLanguageSelector() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full bg-gray-950 flex flex-col font-sans">
      {/* Navbar/header */}
      <header className="w-full flex justify-between items-center px-6 py-6 md:px-24 border-b border-gray-900">
        <div className="flex items-center gap-2 font-extrabold text-3xl bg-clip-text text-transparent bg-linear-to-r from-emerald-400 via-cyan-400 to-violet-400 tracking-wider">
          CODYSSEY
        </div>
        <div className="text-gray-400 font-semibold uppercase tracking-tight text-sm select-none">
          SITE LANGUAGE: ENGLISH
        </div>
      </header>
      {/* <LandingHeader /> */}
      {/* MAIN */}
      <main className="w-full max-w-5xl mx-auto flex flex-col grow items-center pb-12">
        <h1 className="text-2xl md:text-3xl font-extrabold text-center mt-8 mb-6 bg-clip-text text-transparent bg-linear-to-r from-emerald-400 via-cyan-400 to-violet-400 tracking-tight">
          I want to learn...
        </h1>
        {/* Coding Languages grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8 w-full px-2">
          {codingLanguages.map((lang) => (
            <button
              key={lang.name}
              className="flex flex-col items-center justify-center p-6 bg-gray-900 hover:bg-gray-800 border-2 border-gray-800 hover:border-emerald-400 rounded-xl shadow hover:shadow-emerald-500/20 group transition-all cursor-pointer"
              onClick={() => navigate("/welcome")}
            >
              <img
                src={lang.icon}
                alt={lang.name}
                className="w-14 h-14 mb-3 grayscale group-hover:grayscale-0 group-hover:scale-110 transition"
                loading="lazy"
              />
              <span className="font-bold text-base text-white">{lang.name}</span>
              <span className="text-sm text-emerald-400 font-medium">{lang.learners}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}