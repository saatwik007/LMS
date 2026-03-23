import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { courseCatalog } from "../data/courseCatalog.jsx";

function SkillBadgeIcon({ size = 80, label = "AI", bg = "#0ea5e9", fg = "#ffffff" }) {
  const textSize = label.length >= 4 ? "text-xs" : "text-sm";
  return (
    <div
      style={{ width: size, height: size, backgroundColor: bg, color: fg }}
      className="rounded-2xl flex items-center justify-center font-black tracking-wide shadow-lg"
    >
      <span className={textSize}>{label}</span>
    </div>
  );
}

function PythonIcon({ size = 80 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 50 50">
      <path fill="#0277bd" d="M24.047,5c-1.555,0.005-2.633,0.142-3.936,0.367c-3.848,0.67-4.549,2.077-4.549,4.67V14h9v2H15.22h-4.35c-2.636,0-4.943,1.242-5.674,4.219c-0.826,3.417-0.863,5.557,0,9.125C5.851,32.005,7.294,34,9.931,34h3.632v-5.104c0-2.966,2.686-5.896,5.764-5.896h7.236c2.523,0,5-1.862,5-4.377v-8.586c0-2.439-1.759-4.263-4.218-4.672C27.406,5.359,25.589,4.994,24.047,5z M19.063,9c0.821,0,1.5,0.677,1.5,1.502c0,0.833-0.679,1.498-1.5,1.498c-0.837,0-1.5-0.664-1.5-1.498C17.563,9.68,18.226,9,19.063,9z" />
      <path fill="#ffc107" d="M23.078,43c1.555-0.005,2.633-0.142,3.936-0.367c3.848-0.67,4.549-2.077,4.549-4.67V34h-9v-2h9.343h4.35c2.636,0,4.943-1.242,5.674-4.219c0.826-3.417,0.863-5.557,0-9.125C41.274,15.995,39.831,14,37.194,14h-3.632v5.104c0,2.966-2.686,5.896-5.764,5.896h-7.236c-2.523,0-5,1.862-5,4.377v8.586c0,2.439,1.759,4.263,4.218,4.672C19.719,42.641,21.536,43.006,23.078,43z M28.063,39c-0.821,0-1.5-0.677-1.5-1.502c0-0.833,0.679-1.498,1.5-1.498c0.837,0,1.5,0.664,1.5,1.498C29.563,38.32,28.899,39,28.063,39z" />
    </svg>
  );
}

function JavaIcon({ size = 80 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48">
      <path fill="#F44336" d="M23.65,24.898c-0.998-1.609-1.722-2.943-2.725-5.455C19.229,15.2,31.24,11.366,26.37,3.999c2.111,5.089-7.577,8.235-8.477,12.473C17.07,20.37,23.645,24.898,23.65,24.898z" />
      <path fill="#F44336" d="M23.878,17.27c-0.192,2.516,2.229,3.857,2.299,5.695c0.056,1.496-1.447,2.743-1.447,2.743s2.728-0.536,3.579-2.818c0.945-2.534-1.834-4.269-1.548-6.298c0.267-1.938,6.031-5.543,6.031-5.543S24.311,11.611,23.878,17.27z" />
      <path fill="#1565C0" d="M32.084 25.055c1.754-.394 3.233.723 3.233 2.01 0 2.901-4.021 5.643-4.021 5.643s6.225-.742 6.225-5.505C37.521 24.053 34.464 23.266 32.084 25.055zM29.129 27.395c0 0 1.941-1.383 2.458-1.902-4.763 1.011-15.638 1.147-15.638.269 0-.809 3.507-1.638 3.507-1.638s-7.773-.112-7.773 2.181C11.683 28.695 21.858 28.866 29.129 27.395z" />
    </svg>
  );
}

function JsIcon({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#ffff00" />
      <text x="50%" y="65%" textAnchor="middle" fontSize="28" fontWeight="500" fill="#000" fontFamily="Arial, Helvetica, sans-serif">JS</text>
    </svg>
  );
}

function CppIcon({ size = 80 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48">
      <path fill="#00549d" fillRule="evenodd" d="M22.903,3.286c0.679-0.381,1.515-0.381,2.193,0c3.355,1.883,13.451,7.551,16.807,9.434C42.582,13.1,43,13.804,43,14.566c0,3.766,0,15.101,0,18.867c0,0.762-0.418,1.466-1.097,1.847c-3.355,1.883-13.451,7.551-16.807,9.434c-0.679,0.381-1.515,0.381-2.193,0c-3.355-1.883-13.451-7.551-16.807-9.434C5.418,34.899,5,34.196,5,33.434c0-3.766,0-15.101,0-18.867c0-0.762,0.418-1.466,1.097-1.847C9.451,10.837,19.549,5.169,22.903,3.286z" clipRule="evenodd" />
    </svg>
  );
}

const iconMap = {
  python: PythonIcon,
  java: JavaIcon,
  javascript: JsIcon,
  cpp: CppIcon,
  claude: (props) => <SkillBadgeIcon {...props} label="CL" bg="#6d28d9" />,
  aws: (props) => <SkillBadgeIcon {...props} label="AWS" bg="#b45309" />,
  azure: (props) => <SkillBadgeIcon {...props} label="AZ" bg="#0ea5e9" />,
  gcp: (props) => <SkillBadgeIcon {...props} label="GCP" bg="#2563eb" />,
  ml: (props) => <SkillBadgeIcon {...props} label="ML" bg="#0f766e" />,
  dl: (props) => <SkillBadgeIcon {...props} label="DL" bg="#312e81" />,
  nlp: (props) => <SkillBadgeIcon {...props} label="NLP" bg="#be185d" />,
  data: (props) => <SkillBadgeIcon {...props} label="DATA" bg="#0f766e" />,
  sql: (props) => <SkillBadgeIcon {...props} label="SQL" bg="#1d4ed8" />,
  spark: (props) => <SkillBadgeIcon {...props} label="SPK" bg="#b45309" />,
  docker: (props) => <SkillBadgeIcon {...props} label="DKR" bg="#0284c7" />,
  k8s: (props) => <SkillBadgeIcon {...props} label="K8S" bg="#4338ca" />,
  security: (props) => <SkillBadgeIcon {...props} label="SEC" bg="#991b1b" />,
  dsa: (props) => <SkillBadgeIcon {...props} label="DSA" bg="#1f2937" />
};

const DefaultCourseIcon = (props) => <SkillBadgeIcon {...props} label="CRS" bg="#334155" />;

function InfoSection({ section, accentColor }) {
  return (
    <div className="mb-9">
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full inline-block" style={{ background: accentColor }} />
        {section.heading}
      </h3>
      <p className="text-gray-400 leading-relaxed text-sm">{section.content}</p>
    </div>
  );
}

function MarketStat({ label, value }) {
  return (
    <div className="rounded-xl border border-[#1f2a38] bg-[#141b24] px-4 py-3">
      <div className="text-xs uppercase tracking-wider text-gray-500">{label}</div>
      <div className="text-sm sm:text-base text-white font-bold mt-1">{value}</div>
    </div>
  );
}

const LanguagePage = ({ langId }) => {
  const lang = courseCatalog[langId];
  const [readMore, setReadMore] = useState(false);
  const navigate = useNavigate();

  if (!lang) {
    return (
      <div className="min-h-screen bg-[#0f1419] text-white p-6">
        <div className="max-w-3xl mx-auto bg-[#1a2332] border border-[#2a3a4a] rounded-2xl p-6">
          <h1 className="text-2xl font-bold mb-2">Course not found</h1>
          <p className="text-gray-400">This course is not in the catalog yet.</p>
          <button
            type="button"
            onClick={() => navigate("/learn")}
            className="mt-4 px-4 py-2 rounded-lg bg-linear-to-r from-cyan-400 to-emerald-400 text-gray-950 font-bold"
          >
            Go to Learn Page
          </button>
        </div>
      </div>
    );
  }

  const Icon = iconMap[lang.icon] || DefaultCourseIcon;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[60vh]">
        <div className={`w-full bg-linear-to-br ${lang.gradient} flex flex-col items-center justify-center gap-6 relative overflow-hidden px-4 py-10 sm:py-12`}>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-72 h-72 rounded-full opacity-10 blur-3xl" style={{ background: lang.accentColor }} />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="p-6 rounded-3xl bg-gray-900/50 backdrop-blur border border-white/10 shadow-2xl" style={{ boxShadow: `0 0 60px ${lang.accentColor}33` }}>
              <Icon size={80} />
            </div>
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{lang.title}</h1>
              <p className="text-sm mt-1 font-medium" style={{ color: lang.accentLight }}>{lang.tagline}</p>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {[
                `${lang.domain}`,
                `${lang.level}`,
                "Career Track"
              ].map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full bg-gray-900 flex flex-col items-center justify-center px-4 sm:px-8 lg:px-10 py-10 sm:py-12">
          <div className="w-full max-w-sm bg-[#1a2332] border border-[#2a3a4a] rounded-2xl p-5 sm:p-6">
            <h2 className="text-2xl font-bold text-white mb-1">{lang.title} Market Snapshot</h2>
            <p className="text-gray-400 text-sm mb-5">See demand, salary potential, and start now.</p>

            <div className="space-y-3">
              <MarketStat label="People Enrolled" value={lang.enrolled} />
              <MarketStat label="Current Market Heat" value={lang.marketHotness} />
              <MarketStat label="Expected Salary (after proficiency)" value={lang.salary} />

              <div className="rounded-xl border border-[#1f2a38] bg-[#141b24] px-4 py-3">
                <div className="flex items-center justify-between text-xs text-gray-500 uppercase tracking-wider">
                  <span>Hotness Score</span>
                  <span>{lang.hotnessScore}/100</span>
                </div>
                <div className="w-full mt-2 h-2 rounded-full bg-[#0f1419] border border-[#22303d] overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-cyan-400 to-emerald-400"
                    style={{ width: `${lang.hotnessScore}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/levels/${lang.id}`)}
              className="w-full mt-5 py-3 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${lang.accentColor}, ${lang.accentLight})`,
                boxShadow: `0 4px 20px ${lang.accentColor}44`
              }}
            >
              Start {lang.title} Course
            </button>
            <button
              type="button"
              onClick={() => navigate("/learn")}
              className="w-full mt-3 py-2.5 rounded-xl text-sm font-semibold border border-[#2a3a4a] text-cyan-300 hover:bg-[#141b24]"
            >
              View All Courses
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-900 px-6 md:px-16 py-14">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 rounded-full" style={{ background: lang.accentColor }} />
              <h2 className="text-2xl font-bold text-white">About {lang.title}</h2>
            </div>
            <p className="text-gray-400 leading-relaxed text-base">{lang.summary}</p>
          </div>

          {lang.info.slice(0, 2).map((section, i) => (
            <InfoSection key={i} section={section} accentColor={lang.accentColor} />
          ))}

          <div className="mt-8">
            <button
              onClick={() => setReadMore((r) => !r)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition group"
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
            >
              <span className="transition-transform duration-300" style={{ display: "inline-block", transform: readMore ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
              <span className="underline underline-offset-4 decoration-dotted">{readMore ? "Show less" : `Read more about ${lang.title}`}</span>
            </button>

            {readMore && (
              <div className="mt-8 space-y-0 border-l-2 border-white/5 pl-6">
                {lang.info.slice(2).map((section, i) => (
                  <InfoSection key={i} section={section} accentColor={lang.accentColor} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer accentColor={lang.accentColor} />
    </div>
  );
};

function Footer({ accentColor }) {
  return (
    <footer className="bg-gray-950 border-t border-white/5 text-gray-500 text-sm">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="text-xl font-black text-white mb-3" style={{ textShadow: accentColor ? `0 0 12px ${accentColor}` : undefined }}>Codify</div>
          <p className="text-xs text-gray-600 leading-relaxed">Learn to code through gamified, bite-sized challenges. Free. Fun. Effective.</p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Platform</h4>
          <ul className="space-y-2">
            {["Courses", "Challenges", "Leaderboard", "Streaks"].map((l) => (
              <li key={l}><button className="hover:text-gray-300 transition text-left">{l}</button></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Company</h4>
          <ul className="space-y-2">
            {["About", "Blog", "Careers", "Press"].map((l) => (
              <li key={l}><button className="hover:text-gray-300 transition text-left">{l}</button></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Support</h4>
          <ul className="space-y-2">
            {["Help Center", "Contact Us", "Privacy", "Terms"].map((l) => (
              <li key={l}><button className="hover:text-gray-300 transition text-left">{l}</button></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-4 text-center text-xs text-gray-700">
        © {new Date().getFullYear()} Codify. Built for learners, by learners.
      </div>
    </footer>
  );
}

export default LanguagePage;
