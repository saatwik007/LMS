import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrophy, FaFire, FaClock, FaCheckCircle, FaLock } from 'react-icons/fa';

const CHALLENGE_ICONS = {
  daily: '⚡',
  weekly: '🎯',
  monthly: '🏆'
};

const CHALLENGE_COLORS = {
  daily: { bg: 'bg-cyan-600/20', border: 'border-cyan-500/40', text: 'text-cyan-400', progress: 'from-cyan-400 to-cyan-600' },
  weekly: { bg: 'bg-violet-600/20', border: 'border-violet-500/40', text: 'text-violet-400', progress: 'from-violet-400 to-violet-600' },
  monthly: { bg: 'bg-orange-600/20', border: 'border-orange-500/40', text: 'text-orange-400', progress: 'from-orange-400 to-orange-600' }
};

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function getTimeRemaining(expiresAt) {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry - now;

  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function ChallengeCard({ challenge, onClaim }) {
  const colors = CHALLENGE_COLORS[challenge.type];
  const progressPercent = Math.min(100, Math.round((challenge.progress / challenge.goalValue) * 100));
  const canClaim = challenge.completed && !challenge.rewardClaimed;

  return (
    <div className={`bg-[#141b24] rounded-xl p-5 border ${colors.border} ${colors.bg} hover:bg-[#1f2a38] transition`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{CHALLENGE_ICONS[challenge.type]}</div>
          <div>
            <h3 className="font-bold text-white">{challenge.title}</h3>
            <p className="text-xs text-gray-400">{challenge.description}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full ${colors.bg} ${colors.text} text-xs font-semibold border ${colors.border}`}>
          +{challenge.xpReward} XP
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-300 font-semibold">
            {challenge.progress} / {challenge.goalValue}
          </span>
          <span className={colors.text}>{progressPercent}%</span>
        </div>
        <div className="w-full h-3 bg-[#0f1419] rounded-full overflow-hidden border border-[#1f2a38]">
          <div
            className={`h-full bg-gradient-to-r ${colors.progress} transition-all duration-500`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <FaClock />
          <span>{getTimeRemaining(challenge.expiresAt)}</span>
        </div>

        {challenge.completed ? (
          canClaim ? (
            <button
              type="button"
              onClick={() => onClaim(challenge.id)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold rounded-lg transition shadow-lg"
            >
              Claim Reward
            </button>
          ) : (
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
              <FaCheckCircle />
              <span>Claimed</span>
            </div>
          )
        ) : (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <FaLock />
            <span>In Progress</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChallengePage() {
  const [selectedTab, setSelectedTab] = useState('daily');
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChallenges();
    // Auto-refresh every minute to update countdown timers
    const interval = setInterval(fetchChallenges, 60000);
    return () => clearInterval(interval);
  }, [selectedTab]);

  async function fetchChallenges() {
    setIsLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await axios.get(`${apiUrl}/api/challenges?type=${selectedTab}`, {
        withCredentials: true,
        headers: getAuthHeaders()
      });
      setChallenges(response.data.challenges || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load challenges');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleClaimReward(challengeId) {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await axios.post(
        `${apiUrl}/api/challenges/${challengeId}/claim`,
        {},
        {
          withCredentials: true,
          headers: getAuthHeaders()
        }
      );

      // Show success message
      alert(`🎉 ${response.data.message}\n+${response.data.xpEarned} XP earned!`);

      // Refresh challenges
      fetchChallenges();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to claim reward');
    }
  }

  const tabs = [
    { key: 'daily', label: 'Daily', icon: '⚡', color: 'cyan' },
    { key: 'weekly', label: 'Weekly', icon: '🎯', color: 'violet' },
    { key: 'monthly', label: 'Monthly', icon: '🏆', color: 'orange' }
  ];

  const tabColors = {
    cyan: 'bg-cyan-600 text-white',
    violet: 'bg-violet-600 text-white',
    orange: 'bg-orange-600 text-white'
  };

  return (
    <div className="min-h-screen bg-[#0f1419] text-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg mb-6">
          <div className="flex items-center gap-3 mb-2">
            <FaTrophy className="text-4xl text-yellow-400" />
            <div>
              <h1 className="text-3xl font-bold">Challenges</h1>
              <p className="text-gray-400 text-sm">Complete challenges to earn bonus XP</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#1a2332] rounded-2xl p-4 border border-[#2a3a4a] shadow-lg mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedTab(tab.key)}
                className={`px-6 py-3 rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
                  selectedTab === tab.key
                    ? tabColors[tab.color]
                    : 'bg-[#141b24] text-gray-400 hover:bg-[#1f2a38] border border-[#1f2a38]'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Loading challenges...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                type="button"
                onClick={fetchChallenges}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition"
              >
                Retry
              </button>
            </div>
          ) : challenges.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No {selectedTab} challenges available at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onClaim={handleClaimReward}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="mt-6 bg-[#1a2332] rounded-2xl p-4 border border-[#2a3a4a] shadow-lg">
          <div className="flex items-start gap-3">
            <FaFire className="text-2xl text-orange-400 mt-1" />
            <div className="text-sm text-gray-400">
              <p className="font-semibold text-white mb-1">Pro Tip:</p>
              <p>
                Challenges reset automatically! Daily challenges reset every 24 hours, weekly challenges every Monday, 
                and monthly challenges on the 1st of each month. Make sure to claim your rewards before they expire!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
