import React, { useMemo, useState } from "react";
import { getAllCourses } from '../components/LandingPage/LevelData.js';
import Header from '../components/LandingPage/Header.jsx';
import {
  FaRegStar,
  FaTrophy,
  FaChartLine,
  FaUsers,
  FaUser,
  FaEllipsisH,
  FaGraduationCap,
  FaMedal,
  FaCrown,
  FaBell,
  FaSearch,
  FaFilter,
  FaSortAmountDownAlt,
  FaFlag,
  FaClock,
  FaTimes,
} from "react-icons/fa";
import ParticleCanvas from "../components/LandingPage/ParticleCanvas.jsx";

export default function Dashboard() {
  // const [courses] = useState([
  //   {
  //     title: "JavaScript",
  //     progress: 0,
  //     lessons: "12/18 lessons",
  //     tag: "In Progress",
  //   },
  //   {
  //     title: "Python",
  //     progress: 0,
  //     lessons: "8/19 lessons",
  //     tag: "Practice",
  //   },
  //   {
  //     title: "HTML",
  //     progress: 0,
  //     lessons: "14/18 lessons",
  //     tag: "Almost There",
  //   },
  // ]);

// Create dynamic courses from LevelData
const [courses] = useState(() => {
  return getAllCourses().map((course) => ({
    id:          course.id,
    title:       course.language,
    progress:    0,
    lessons:     `0/${course.totalChapters} lessons`,
    tag:         "In Progress",
    accentColor: course.accentColor,
  }));
}); 

  // ... rest of existing code ...

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("progress_desc");
  const [progresses] = useState({
    js: 65,
    python: 42,
    react: 78,
  });

  const [languages] = useState([
    { name: "JavaScript", icon: "🚀", level: 12 },
    { name: "Python", icon: "🐍", level: 8 },
    { name: "React", icon: "⚛️", level: 15 },
  ]);

  const [friends] = useState([
    { name: "Alex Chen", status: "Online", xp: 2850, rank: 12 },
    { name: "Sarah Dev", status: "Online", xp: 2640, rank: 15 },
    { name: "Mike Johnson", status: "Away", xp: 2480, rank: 18 },
    { name: "Emma Watson", status: "Offline", xp: 2210, rank: 24 },
  ]);

  const [leaderboard] = useState([
    { rank: 1, name: "VivekMandal", xp: 10000 , medal: "⭐", isUser: true },
    { rank: 2, name: "SatwikWahi", xp: 5420, medal: "🥇" },
    { rank: 3, name: "SatwikWahi2", xp: 5180, medal: "🥈" },
    { rank: 4, name: "SatwikWahi3", xp: 5010, medal: "🥉" },
    { rank: 5, name: "SatwikWahiAgain", xp: 4720, medal: "📍" },
  ]);
  const [notifications] = useState([
    { title: "Streak secured", detail: "You saved your streak today", time: "1h ago" },
    { title: "New lesson unlocked", detail: "React Effects is now available", time: "3h ago" },
    { title: "Weekly goal", detail: "You are 2 lessons away", time: "Yesterday" },
  ]);
  const [weeklyGoals] = useState([
    { title: "Complete 10 lessons", current: 7, total: 10 },
    { title: "Earn 500 XP", current: 320, total: 500 },
    { title: "Study 5 days", current: 3, total: 5 },
  ]);
  const [upcomingLessons] = useState([
    { title: "Arrays and Loops", course: "JavaScript Fundamentals", time: "Today · 6:00 PM" },
    { title: "Functions Deep Dive", course: "JavaScript Fundamentals", time: "Tomorrow · 7:30 PM" },
    { title: "React State", course: "React Foundations", time: "Fri · 5:00 PM" },
  ]);
  const [activityFeed] = useState([
    { title: "Completed", detail: "React Hooks Quiz", time: "Today" },
    { title: "Gained", detail: "+120 XP in Python Basics", time: "Yesterday" },
    { title: "Unlocked", detail: "Lesson 12: Objects", time: "Yesterday" },
  ]);
  const [badges] = useState({ unlocked: 14, total: 30 });
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const totalXP = 4850;
  const currentLevel = 18;
  const xpToNextLevel = 5000;
  const levelProgress = ((totalXP - 4500) / (5000 - 4500)) * 100;

  const githubUsername = "your-username";

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleResumeCourse = (courseTitle) => {
    const encoded = encodeURIComponent(courseTitle.toLowerCase().replace(/\s+/g, "-"));
    window.location.href = `/levels/${encoded}`;
  };

  const handleViewBadges = () => {
    window.location.href = "/badges";
  };

  const handleViewSchedule = () => {
    window.location.href = "/schedule";
  };

  const handleViewCalendar = () => {
    setShowCalendarModal(true);
  };

  const generateCalendarData = () => {
    const data = [];
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    let currentDate = new Date(oneYearAgo);
    
    while (currentDate <= today) {
      const count = Math.floor(Math.random() * 6);
      data.push({
        date: new Date(currentDate),
        count: count,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
  };

  const calendarData = useMemo(() => generateCalendarData(), []);

  const filteredCourses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    let list = courses.filter((course) => {
      const matchesSearch = !normalizedSearch || course.title.toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === "All" || course.tag === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortBy === "progress_asc") {
      list = list.sort((a, b) => a.progress - b.progress);
    }
    if (sortBy === "progress_desc") {
      list = list.sort((a, b) => b.progress - a.progress);
    }
    if (sortBy === "alpha") {
      list = list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [courses, searchTerm, statusFilter, sortBy]);

  return (
    <>
    <ParticleCanvas />
     <Header />
     <div className="min-h-screen text-white pt-16 z-10 scroll-smooth flex font-sans bg-[#111113]">
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Courses Card */}
            <div className="bg-none rounded-2xl p-6 border-[#2a3a4a] shadow-lg">
              {/* Filter UI - Search, Status Filter, Sort */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4 items-start sm:items-center">
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {filteredCourses.length === 0 ? (
                <div className="text-center text-sm text-gray-400 py-10">No courses match your filters.</div>
              ) : (
                <div className="grid  grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCourses.map((course) => (
                    <div key={course.id} className=" rounded-xl bg-[#141b24] p-4 border border-[#1f2a38]">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold">{course.title}</h3>
                        <span className="text-xs font-semibold text-cyan-300 bg-cyan-600/20 border border-cyan-600/50 px-2 py-1 rounded-full">
                          {course.tag}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">{course.lessons}</p>
                      <div className="w-full bg-[#0f1419] rounded-full h-2 overflow-hidden border border-[#1f2a38]">
                        <div
                          className="bg-linear-to-r from-cyan-400 to-emerald-400 h-full rounded-full"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">{course.progress}% complete</div>
                    <button
                      className="mt-4 w-full bg-cyan-500 cursor-pointer hover:bg-cyan-600 text-white font-bold py-2 rounded-lg transition"
                      onClick={() => {
                        window.location.href = `/levels/${course.id}`;
                      }}
                      type="button"
                    >
                        Resume
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weekly Goals */}
            <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FaFlag className="text-emerald-400" /> Weekly Goals
                </h3>
                <span className="text-xs text-gray-400">Resets every Monday</span>
              </div>
              <div className="space-y-4">
                {weeklyGoals.map((goal) => {
                  const percent = Math.round((goal.current / goal.total) * 100);
                  return (
                    <div key={goal.title} className="bg-[#141b24] rounded-lg p-3 border border-[#1f2a38]">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-semibold">{goal.title}</span>
                        <span className="text-gray-400">{goal.current}/{goal.total}</span>
                      </div>
                      <div className="w-full bg-[#0f1419] rounded-full h-2 overflow-hidden border border-[#1f2a38]">
                        <div
                          className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Lessons */}
            <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FaClock className="text-cyan-400" /> Upcoming Lessons
                </h3>
                <button
                  className="text-cyan-400 text-xs font-bold hover:underline"
                  onClick={handleViewSchedule}
                  type="button"
                >
                  View schedule →
                </button>
              </div>
              <div className="space-y-3">
                {upcomingLessons.map((lesson) => (
                  <div key={lesson.title} className="bg-[#141b24] rounded-lg p-3 border border-[#1f2a38]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">{lesson.title}</div>
                        <div className="text-xs text-gray-400">{lesson.course}</div>
                      </div>
                      <div className="text-xs text-gray-400">{lesson.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* XP & Level Card */}
            <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[#141b24] rounded-xl p-4 text-center border border-[#1f2a38]">
                  <div className="text-orange-400 text-3xl font-bold">{totalXP}</div>
                  <div className="text-gray-400 text-xs mt-1">TOTAL XP</div>
                </div>
                <div className="bg-[#141b24] rounded-xl p-4 text-center border border-[#1f2a38]">
                  <div className="text-cyan-400 text-3xl font-bold">Lv. {currentLevel}</div>
                  <div className="text-gray-400 text-xs mt-1">CURRENT LEVEL</div>
                </div>
                <div className="bg-[#141b24] rounded-xl p-4 text-center border border-[#1f2a38]">
                  <div className="text-emerald-400 text-3xl font-bold">#4</div>
                  <div className="text-gray-400 text-xs mt-1">YOUR RANK</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold">Progress to Level {currentLevel + 1}</span>
                  <span className="text-xs text-gray-400">{totalXP}/{xpToNextLevel} XP</span>
                </div>
                <div className="w-full bg-[#0f1419] rounded-full h-3 overflow-hidden border border-[#1f2a38]">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${levelProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Languages Learning */}
            <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
              <h3 className="text-xl font-bold mb-4">Languages You're Learning</h3>
              <div className="grid grid-cols-1 gap-4">
                {languages.map((lang, idx) => (
                  <div key={idx} className="bg-[#141b24] rounded-xl p-4 border border-[#1f2a38]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{lang.icon}</span>
                        <div>
                          <div className="font-bold">{lang.name}</div>
                          <div className="text-xs text-gray-400">Level {lang.level}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-cyan-400 font-bold">
                          {progresses[lang.name.toLowerCase().split(" ")[0]]}%
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-[#0f1419] rounded-full h-2 overflow-hidden border border-[#1f2a38]">
                      <div
                        className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full rounded-full"
                        style={{ width: `${progresses[lang.name.toLowerCase().split(" ")[0]]}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard Preview */}
            <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FaCrown className="text-orange-400" /> Global Leaderboard
                </h3>
                <button className="text-cyan-400 text-xs font-bold hover:underline">VIEW ALL →</button>
              </div>
              <div className="space-y-3">
                {leaderboard.map((player, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg transition border ${
                      player.isUser ? "bg-cyan-600/20 border-cyan-500/50" : "bg-[#141b24] hover:bg-[#1f2a38] border-[#1f2a38]"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-xl font-bold text-orange-400 w-8 text-center">{player.medal}</div>
                      <div>
                        <div className="font-bold text-sm">{player.name}</div>
                        <div className="text-xs text-gray-500">#{player.rank}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-cyan-400">{player.xp}</div>
                      <div className="text-xs text-gray-500">XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Streak & Friends */}
          <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FaBell className="text-cyan-400" /> Notifications
                </h3>
                <button className="text-cyan-400 text-xs font-bold hover:underline">See all</button>
              </div>
              <div className="space-y-3">
                {notifications.map((note) => (
                  <div key={note.title} className="bg-[#141b24] rounded-lg p-3 border border-[#1f2a38]">
                    <div className="text-sm font-semibold">{note.title}</div>
                    <div className="text-xs text-gray-500">{note.detail}</div>
                    <div className="text-xs text-gray-500 mt-1">{note.time}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Streak Card */}
            <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
              <div className="text-center mb-4">
                <div className="text-6xl mb-2">🔥</div>
                <h3 className="text-2xl font-bold">12 Day Streak!</h3>
                <p className="text-gray-400 text-sm mt-1">Keep it going!</p>
              </div>
              <div className="bg-gradient-to-b from-orange-600/30 to-red-600/30 border border-orange-600/50 rounded-xl p-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">12</div>
                  <div className="text-sm text-gray-300">Days in a row</div>
                </div>
              </div>
              <button
                className="w-full bg-[#141b24] hover:bg-[#1f2a38] text-cyan-400 font-bold py-2 rounded-lg transition border border-[#1f2a38]"
                onClick={handleViewCalendar}
                type="button"
              >
                View Calendar
              </button>
            </div>

            {/* Achievements Preview */}
            <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FaMedal className="text-orange-400" /> Recent Achievements
              </h3>
              <div className="space-y-3">
                <div className="bg-[#141b24] rounded-lg p-3 text-center border border-[#1f2a38]">
                  <div className="text-3xl mb-1">🎯</div>
                  <div className="text-sm font-bold">Perfect Lesson</div>
                  <div className="text-xs text-gray-500 mt-1">100% Accuracy</div>
                </div>
                <div className="bg-[#141b24] rounded-lg p-3 text-center opacity-50 border border-[#1f2a38]">
                  <div className="text-3xl mb-1">💎</div>
                  <div className="text-sm font-bold">Gem Collector</div>
                  <div className="text-xs text-gray-500 mt-1">Collect 100 Gems</div>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold">Badges</h3>
                <span className="text-xs text-gray-400">{badges.unlocked}/{badges.total} unlocked</span>
              </div>
              <div className="bg-[#141b24] rounded-lg p-4 text-center border border-[#1f2a38]">
                <div className="text-3xl mb-2">🏅</div>
                <div className="text-sm text-gray-300">Collect badges by completing goals</div>
                <button
                  className="mt-4 w-full bg-[#141b24] hover:bg-[#1f2a38] text-cyan-400 font-bold py-2 rounded-lg transition border border-[#1f2a38] text-sm"
                  onClick={handleViewBadges}
                  type="button"
                >
                  View Badges
                </button>
              </div>
            </div>

            {/* Friends */}
            <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FaUsers className="text-cyan-400" /> Friends
              </h3>
              <div className="space-y-3">
                {friends.map((friend, idx) => (
                  <div key={idx} className="bg-[#141b24] rounded-lg p-3 border border-[#1f2a38]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-sm">{friend.name}</div>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        friend.status === "Online" 
                          ? "bg-emerald-600/30 text-emerald-300 border border-emerald-600/50" 
                          : friend.status === "Away"
                          ? "bg-yellow-600/30 text-yellow-300 border border-yellow-600/50"
                          : "bg-gray-700/30 text-gray-400 border border-gray-700/50"
                      }`}>
                        {friend.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{friend.xp} XP</span>
                      <span>Rank #{friend.rank}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 bg-[#141b24] hover:bg-[#1f2a38] text-cyan-400 font-bold py-2 rounded-lg transition border border-[#1f2a38] text-sm">
                View All Friends
              </button>
            </div>

            {/* Daily Challenge */}
            <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold">Daily Challenge</h3>
                <span className="text-emerald-400 text-sm font-bold">+50 XP</span>
              </div>
              <div className="bg-[#141b24] rounded-lg p-4 text-center border border-[#1f2a38]">
                <div className="text-2xl mb-2">🎮</div>
                <p className="text-sm text-gray-300 mb-3">Complete 5 lessons today</p>
                <div className="w-full bg-[#0f1419] rounded-full h-2 mb-2 border border-[#1f2a38]">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: "60%" }}></div>
                </div>
                <div className="text-xs text-gray-500">3/5 Completed</div>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Activity Feed</h3>
                <button className="text-cyan-400 text-xs font-bold hover:underline">View all</button>
              </div>
              <div className="space-y-3">
                {activityFeed.map((activity) => (
                  <div key={activity.title + activity.detail} className="bg-[#141b24] rounded-lg p-3 border border-[#1f2a38]">
                    <div className="text-sm font-semibold">{activity.title}</div>
                    <div className="text-xs text-gray-500">{activity.detail}</div>
                    <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCalendarModal(false)}
        >
          <div
            className="bg-[#1a2332] rounded-2xl border border-[#2a3a4a] p-6 max-w-5xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Your Learning Calendar</h2>
                <p className="text-sm text-gray-400">
                  {calendarData.reduce((sum, d) => sum + d.count, 0)} submissions in the past year
                </p>
              </div>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>
            <CalendarHeatmap data={calendarData} />
          </div>
        </div>
      )}
    </div>
    </>
  );
}

// Calendar Heatmap Component
function CalendarHeatmap({ data }) {
  const getMonthLabels = () => {
    const months = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setFullYear(startDate.getFullYear() - 1);

    let currentMonth = startDate.getMonth();
    let currentDate = new Date(startDate);

    while (currentDate <= today) {
      const month = currentDate.getMonth();
      if (month !== currentMonth) {
        const weeksSinceStart = Math.floor(
          (currentDate - startDate) / (7 * 24 * 60 * 60 * 1000)
        );
        months.push({
          name: currentDate.toLocaleString("default", { month: "short" }),
          offset: weeksSinceStart,
        });
        currentMonth = month;
      }
      currentDate.setDate(currentDate.getDate() + 7);
    }

    return months;
  };

  const weeks = [];
  let week = [];

  const firstDay = data[0]?.date;
  const startDayOfWeek = firstDay ? firstDay.getDay() : 0;

  for (let i = 0; i < startDayOfWeek; i++) {
    week.push(null);
  }

  data.forEach((day) => {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  });

  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);
  }

  const getColor = (count) => {
    if (count === 0) return "bg-[#0f1419] border-[#1f2a38]";
    if (count === 1) return "bg-emerald-900/40 border-emerald-800/50";
    if (count === 2) return "bg-emerald-700/50 border-emerald-600/60";
    if (count === 3) return "bg-emerald-600/70 border-emerald-500/70";
    if (count === 4) return "bg-emerald-500/80 border-emerald-400/80";
    return "bg-emerald-400 border-emerald-300";
  };

  const monthLabels = getMonthLabels();
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Month labels */}
        <div className="flex mb-2 pl-8">
          {monthLabels.map((month, idx) => (
            <div
              key={idx}
              className="text-xs text-gray-400 font-semibold"
              style={{ marginLeft: `${month.offset * 14}px` }}
            >
              {month.name}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 pr-2">
            {dayLabels.map((day, idx) => (
              <div
                key={day}
                className={`text-xs text-gray-500 h-3 flex items-center ${
                  idx % 2 === 0 ? "opacity-0" : ""
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="flex gap-1">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1">
                {week.map((day, dayIdx) => (
                  <div
                    key={dayIdx}
                    className={`w-3 h-3 rounded-sm border ${
                      day ? getColor(day.count) : "bg-transparent border-transparent"
                    } transition-colors cursor-pointer hover:ring-1 hover:ring-cyan-400`}
                    title={
                      day
                        ? `${day.date.toLocaleDateString()}: ${day.count} submissions`
                        : ""
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 justify-end">
          <span className="text-xs text-gray-400">Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm border ${getColor(level)}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">More</span>
        </div>
      </div>
    </div>
  );
}

// Sidebar link component
function SidebarLink({ icon, label, active }) {
  return (
    <div
      className={`flex items-center px-4 py-2 rounded-lg gap-3 text-sm cursor-pointer transition ${
        active ? "bg-cyan-600/30 text-cyan-300 border border-cyan-600/50" : "hover:bg-[#243547] text-cyan-300"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}