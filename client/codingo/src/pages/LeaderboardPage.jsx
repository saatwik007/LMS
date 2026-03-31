import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrophy, FaMedal, FaFire, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const LEAGUE_COLORS = {
  Bronze: 'text-amber-600',
  Silver: 'text-gray-300',
  Gold: 'text-yellow-400',
  Platinum: 'text-cyan-300',
  Diamond: 'text-blue-400'
};

const LEAGUE_EMOJIS = {
  Bronze: '🥉',
  Silver: '🥈',
  Gold: '🥇',
  Platinum: '💠',
  Diamond: '💎'
};

// Helper to extract base tier from league string (e.g., "Bronze 1" -> "Bronze")
function getBaseTier(league) {
  if (!league) return 'Bronze';
  return league.split(' ')[0];
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function getInitialAvatar(name) {
  const initial = (name || '?')[0].toUpperCase();
  const colors = ['bg-cyan-500', 'bg-emerald-500', 'bg-violet-500', 'bg-orange-500', 'bg-pink-500'];
  const colorIndex = initial.charCodeAt(0) % colors.length;
  return (
    <div className={`w-10 h-10 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-lg`}>
      {initial}
    </div>
  );
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [currentUserLeague, setCurrentUserLeague] = useState('Bronze');
  const [selectedLeague, setSelectedLeague] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedLeague, page]);

  async function fetchLeaderboard() {
    setIsLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const params = new URLSearchParams();
      if (selectedLeague !== 'All') {
        params.append('league', selectedLeague);
      }
      params.append('page', page);
      params.append('limit', 20);

      const response = await axios.get(`${apiUrl}/api/learning/leaderboard?${params.toString()}`, {
        withCredentials: true,
        headers: getAuthHeaders()
      });

      setLeaderboard(response.data.leaderboard || []);
      setCurrentUserRank(response.data.currentUserRank);
      setCurrentUserLeague(response.data.currentUserLeague || 'Bronze');
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  }

  function handleLeagueChange(league) {
    setSelectedLeague(league);
    setPage(1);
  }

  function handlePrevPage() {
    if (page > 1) setPage(page - 1);
  }

  function handleNextPage() {
    if (page < totalPages) setPage(page + 1);
  }

  const leagues = ['All', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];

  return (
    <div className="min-h-screen bg-[#0f1419] text-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <FaTrophy className="text-4xl text-yellow-400" />
              <div>
                <h1 className="text-3xl font-bold">Leaderboard</h1>
                <p className="text-gray-400 text-sm">Compete with learners worldwide</p>
              </div>
            </div>
            {currentUserRank && (
              <div className="bg-[#141b24] rounded-xl px-6 py-3 border border-[#1f2a38]">
                <div className="text-xs text-gray-400 uppercase tracking-wide">Your Rank</div>
                <div className="text-2xl font-bold text-cyan-400">#{formatNumber(currentUserRank)}</div>
                <div className="text-xs text-gray-500 mt-1">{LEAGUE_EMOJIS[getBaseTier(currentUserLeague)]} {currentUserLeague}</div>
              </div>
            )}
          </div>
        </div>

        {/* League Filter Tabs */}
        <div className="bg-[#1a2332] rounded-2xl p-4 border border-[#2a3a4a] shadow-lg mb-6">
          <div className="flex flex-wrap gap-2">
            {leagues.map((league) => (
              <button
                key={league}
                type="button"
                onClick={() => handleLeagueChange(league)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  selectedLeague === league
                    ? 'bg-cyan-600 text-white shadow-lg'
                    : 'bg-[#141b24] text-gray-400 hover:bg-[#1f2a38] border border-[#1f2a38]'
                }`}
              >
                {league !== 'All' && LEAGUE_EMOJIS[league]} {league}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4a] shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Loading leaderboard...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                type="button"
                onClick={() => fetchLeaderboard()}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition"
              >
                Retry
              </button>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No users found in this league yet. Keep learning to be the first!
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="hidden sm:grid grid-cols-[80px_1fr_120px_100px_120px] gap-4 px-6 py-3 bg-[#141b24] border-b border-[#1f2a38] text-xs uppercase text-gray-500 font-semibold">
                <div>Rank</div>
                <div>User</div>
                <div>XP</div>
                <div>Streak</div>
                <div>League</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-[#1f2a38]">
                {leaderboard.map((user) => {
                  const isCurrentUser = user.userId === currentUserId;
                  const isTop3 = user.rank <= 3;
                  return (
                    <div
                      key={user.userId}
                      className={`grid grid-cols-1 sm:grid-cols-[80px_1fr_120px_100px_120px] gap-4 px-6 py-4 transition ${
                        isCurrentUser
                          ? 'bg-cyan-600/20 border-l-4 border-l-cyan-500 ring-1 ring-cyan-500/40'
                          : 'hover:bg-[#141b24]'
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex items-center gap-2">
                        {isTop3 ? (
                          <FaMedal className={`text-2xl ${user.rank === 1 ? 'text-yellow-400' : user.rank === 2 ? 'text-gray-300' : 'text-amber-600'}`} />
                        ) : (
                          <div className="text-lg font-bold text-gray-400">#{user.rank}</div>
                        )}
                        <span className="text-xs text-gray-500 sm:hidden">Rank</span>
                      </div>

                      {/* User */}
                      <div className="flex items-center gap-3">
                        {user.profilePic ? (
                          <img src={user.profilePic} alt={user.name} className="w-10 h-10 rounded-full border-2 border-[#2a3a4a]" />
                        ) : (
                          getInitialAvatar(user.name)
                        )}
                        <div>
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-xs text-gray-500">Level {user.level}</div>
                        </div>
                      </div>

                      {/* XP */}
                      <div className="flex items-center">
                        <div>
                          <div className="font-bold text-cyan-400">{formatNumber(user.xp)}</div>
                          <div className="text-xs text-gray-500 sm:hidden">XP</div>
                        </div>
                      </div>

                      {/* Streak */}
                      <div className="flex items-center gap-2">
                        <FaFire className="text-orange-500" />
                        <span className="font-semibold">{user.streakCount}</span>
                        <span className="text-xs text-gray-500 sm:hidden">days</span>
                      </div>

                      {/* League */}
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{LEAGUE_EMOJIS[getBaseTier(user.league)]}</span>
                        <span className={`font-semibold ${LEAGUE_COLORS[getBaseTier(user.league)]}`}>{user.league}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 bg-[#141b24] border-t border-[#1f2a38] flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-gray-400">
                  Showing {(page - 1) * 20 + 1} - {Math.min(page * 20, total)} of {formatNumber(total)} users
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg bg-[#1f2a38] hover:bg-[#243547] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                  >
                    <FaChevronLeft /> Prev
                  </button>
                  <div className="px-3 py-2 text-sm text-gray-400">
                    Page {page} of {totalPages}
                  </div>
                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg bg-[#1f2a38] hover:bg-[#243547] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                  >
                    Next <FaChevronRight />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
