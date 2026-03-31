import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { 
  FaChartLine, 
  FaTrophy, 
  FaFire, 
  FaStar,
  FaGraduationCap,
  FaClock,
  FaCheckCircle
} from 'react-icons/fa';
import CalendarHeatmap from '../components/shared/CalendarHeatmap';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function ProgressPage() {
  const [learningData, setLearningData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calendarData, setCalendarData] = useState([]);
  const [xpHistory, setXpHistory] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const currentUser = getStoredUser();

  const fetchLearningOverview = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${apiUrl}/api/learning/me/overview`, {
        withCredentials: true,
        headers: getAuthHeaders()
      });

      setLearningData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load progress data');
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchLearningOverview();
    generateCalendarData();
    generateXPHistory();
  }, [fetchLearningOverview]);

  function generateCalendarData() {
    const data = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setFullYear(startDate.getFullYear() - 1);

    let currentDate = new Date(startDate);
    while (currentDate <= today) {
      data.push({
        date: new Date(currentDate),
        count: Math.floor(Math.random() * 6)
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setCalendarData(data);
  }

  function generateXPHistory() {
    const history = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      history.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        xp: Math.floor(Math.random() * 150) + 50
      });
    }

    setXpHistory(history);
  }

  const stats = learningData?.stats || {};
  const enrolledCourses = learningData?.enrolledCourses || [];
  
  // Calculate level progress ring values
  const totalXp = stats.totalXp || 0;
  const level = stats.level || 1;
  const xpToNextLevel = stats.xpToNextLevel || 500;
  const levelProgress = stats.levelProgressPercent || 0;
  const currentLevelMinXp = (level - 1) * 500;
  const xpInCurrentLevel = totalXp - currentLevelMinXp;

  // SVG circle calculations for progress ring
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (levelProgress / 100) * circumference;

  // Calculate max XP for chart scaling
  const maxXp = Math.max(...xpHistory.map(h => h.xp), 1);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1419] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg mb-6">
          <div className="flex items-center gap-3">
            <FaChartLine className="text-4xl text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold">Your Progress</h1>
              <p className="text-gray-400 text-sm">Track your learning journey</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-600/20 border border-red-600 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1a2332] rounded-xl p-6 border border-[#2a3a4a]">
            <div className="flex items-center gap-3 mb-2">
              <FaStar className="text-2xl text-orange-400" />
              <div>
                <div className="text-sm text-gray-400">Total XP</div>
                <div className="text-3xl font-bold text-cyan-400">{totalXp.toLocaleString()}</div>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Rank #{stats.rank || 0} of {stats.totalUsers || 0} learners
            </div>
          </div>

          <div className="bg-[#1a2332] rounded-xl p-6 border border-[#2a3a4a]">
            <div className="flex items-center gap-3 mb-2">
              <FaGraduationCap className="text-2xl text-purple-400" />
              <div>
                <div className="text-sm text-gray-400">Courses</div>
                <div className="text-3xl font-bold text-purple-400">{enrolledCourses.length}</div>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {enrolledCourses.filter(c => c.status === 'completed').length} completed
            </div>
          </div>

          <div className="bg-[#1a2332] rounded-xl p-6 border border-[#2a3a4a]">
            <div className="flex items-center gap-3 mb-2">
              <FaFire className="text-2xl text-orange-500" />
              <div>
                <div className="text-sm text-gray-400">Streak</div>
                <div className="text-3xl font-bold text-orange-500">{currentUser?.streakCount || 0}</div>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Days in a row
            </div>
          </div>
        </div>

        {/* Level Progress Ring & XP Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Level Progression Ring */}
          <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaTrophy className="text-yellow-400" /> Level Progress
            </h2>
            <div className="flex flex-col items-center">
              <svg width="200" height="200" className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  stroke="#1f2a38"
                  strokeWidth="12"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute mt-16 text-center">
                <div className="text-5xl font-bold text-cyan-400">{level}</div>
                <div className="text-sm text-gray-400">Level</div>
              </div>
              <div className="mt-8 text-center w-full">
                <div className="text-sm text-gray-400 mb-1">
                  {xpInCurrentLevel} / {xpToNextLevel - currentLevelMinXp} XP
                </div>
                <div className="w-full bg-[#141b24] rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${levelProgress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {(xpToNextLevel - totalXp)} XP to Level {level + 1}
                </div>
              </div>
            </div>
          </div>

          {/* XP History Chart */}
          <div className="lg:col-span-2 bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaChartLine className="text-cyan-400" /> XP History (Last 30 Days)
            </h2>
            <div className="flex items-end justify-between gap-1 h-48">
              {xpHistory.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div className="relative w-full">
                    <div
                      className="w-full bg-gradient-to-t from-cyan-600 to-purple-600 rounded-t transition-all hover:from-cyan-500 hover:to-purple-500 cursor-pointer"
                      style={{ height: `${(day.xp / maxXp) * 180}px` }}
                      title={`${day.date}: ${day.xp} XP`}
                    ></div>
                  </div>
                  {index % 5 === 0 && (
                    <div className="text-xs text-gray-500 mt-2 transform rotate-45 origin-left">
                      {day.date}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-400 text-center">
              Average: {Math.round(xpHistory.reduce((sum, h) => sum + h.xp, 0) / xpHistory.length)} XP/day
            </div>
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaFire className="text-orange-400" /> Activity Heatmap
          </h2>
          <CalendarHeatmap data={calendarData} />
        </div>

        {/* Course Progress */}
        <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaGraduationCap className="text-purple-400" /> Course Progress
          </h2>
          {enrolledCourses.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>You haven't enrolled in any courses yet.</p>
              <a href="/learn" className="text-cyan-400 hover:underline mt-2 inline-block">
                Browse courses
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="bg-[#141b24] rounded-lg p-4 border border-[#1f2a38]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center text-xl font-bold">
                        {course.title[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{course.title}</h3>
                        <p className="text-sm text-gray-400">{course.domain} • {course.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm">
                        {course.status === 'completed' ? (
                          <FaCheckCircle className="text-emerald-500" />
                        ) : (
                          <FaClock className="text-orange-400" />
                        )}
                        <span className={`font-semibold ${
                          course.status === 'completed' ? 'text-emerald-500' : 'text-orange-400'
                        }`}>
                          {course.tag}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{course.lessons}</div>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-400">Progress</span>
                      <span className="font-semibold text-cyan-400">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-[#0f1419] rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <FaStar className="text-orange-400" />
                      <span>{course.totalPoints || 0} XP earned</span>
                    </div>
                    <a 
                      href={`/levels/${course.id}`}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      Continue →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
