import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrophy, FaMedal, FaStar, FaFire, FaCrown, FaLock } from 'react-icons/fa';

const RARITY_COLORS = {
  Common: 'bg-gray-600 text-gray-100',
  Rare: 'bg-blue-600 text-blue-100',
  Epic: 'bg-purple-600 text-purple-100',
  Legendary: 'bg-orange-600 text-orange-100'
};

const RARITY_BORDER = {
  Common: 'border-gray-500',
  Rare: 'border-blue-500',
  Epic: 'border-purple-500',
  Legendary: 'border-orange-500 shadow-lg shadow-orange-500/20'
};

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

export default function ProfilePage() {
  const [allBadges, setAllBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRarity, setSelectedRarity] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  const currentUser = getStoredUser();

  useEffect(() => {
    fetchBadges();
  }, []);

  async function fetchBadges() {
    setIsLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await axios.get(`${apiUrl}/api/badges`, {
        withCredentials: true,
        headers: getAuthHeaders()
      });

      setAllBadges(response.data?.badges || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load badges');
    } finally {
      setIsLoading(false);
    }
  }

  const earnedBadges = allBadges.filter(b => b.earned);
  const lockedBadges = allBadges.filter(b => !b.earned);

  const filteredBadges = allBadges
    .filter(badge => {
      if (selectedRarity !== 'All' && badge.rarity !== selectedRarity) return false;
      if (selectedStatus === 'Earned' && !badge.earned) return false;
      if (selectedStatus === 'Locked' && badge.earned) return false;
      return true;
    });

  const rarityStats = {
    Common: earnedBadges.filter(b => b.rarity === 'Common').length,
    Rare: earnedBadges.filter(b => b.rarity === 'Rare').length,
    Epic: earnedBadges.filter(b => b.rarity === 'Epic').length,
    Legendary: earnedBadges.filter(b => b.rarity === 'Legendary').length
  };

  return (
    <div className="min-h-screen bg-[#0f1419] text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                <FaCrown className="text-3xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{currentUser?.username || 'Learner'}'s Profile</h1>
                <p className="text-gray-400 text-sm">Badges & Achievements</p>
              </div>
            </div>
            <div className="bg-[#141b24] rounded-xl px-6 py-3 border border-[#1f2a38]">
              <div className="text-xs text-gray-400 uppercase tracking-wide">Total Badges</div>
              <div className="text-3xl font-bold text-cyan-400">{earnedBadges.length} / {allBadges.length}</div>
              <div className="text-xs text-gray-500 mt-1">
                {allBadges.length > 0 ? Math.round((earnedBadges.length / allBadges.length) * 100) : 0}% Complete
              </div>
            </div>
          </div>
        </div>

        {/* Rarity Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1a2332] rounded-xl p-4 border border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <FaMedal className="text-gray-400" />
              <span className="text-sm font-semibold text-gray-300">Common</span>
            </div>
            <div className="text-2xl font-bold">{rarityStats.Common}</div>
          </div>
          <div className="bg-[#1a2332] rounded-xl p-4 border border-blue-600">
            <div className="flex items-center gap-2 mb-2">
              <FaStar className="text-blue-400" />
              <span className="text-sm font-semibold text-blue-300">Rare</span>
            </div>
            <div className="text-2xl font-bold">{rarityStats.Rare}</div>
          </div>
          <div className="bg-[#1a2332] rounded-xl p-4 border border-purple-600">
            <div className="flex items-center gap-2 mb-2">
              <FaFire className="text-purple-400" />
              <span className="text-sm font-semibold text-purple-300">Epic</span>
            </div>
            <div className="text-2xl font-bold">{rarityStats.Epic}</div>
          </div>
          <div className="bg-[#1a2332] rounded-xl p-4 border border-orange-600">
            <div className="flex items-center gap-2 mb-2">
              <FaTrophy className="text-orange-400" />
              <span className="text-sm font-semibold text-orange-300">Legendary</span>
            </div>
            <div className="text-2xl font-bold">{rarityStats.Legendary}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#1a2332] rounded-2xl p-4 border border-[#2a3a4a] shadow-lg mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Status</label>
              <div className="flex gap-2">
                {['All', 'Earned', 'Locked'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      selectedStatus === status
                        ? 'bg-cyan-600 text-white'
                        : 'bg-[#141b24] text-gray-400 hover:bg-[#1f2a38] border border-[#1f2a38]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Rarity</label>
              <div className="flex gap-2">
                {['All', 'Common', 'Rare', 'Epic', 'Legendary'].map((rarity) => (
                  <button
                    key={rarity}
                    type="button"
                    onClick={() => setSelectedRarity(rarity)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      selectedRarity === rarity
                        ? 'bg-cyan-600 text-white'
                        : 'bg-[#141b24] text-gray-400 hover:bg-[#1f2a38] border border-[#1f2a38]'
                    }`}
                  >
                    {rarity}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Loading badges...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                type="button"
                onClick={fetchBadges}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition"
              >
                Retry
              </button>
            </div>
          ) : filteredBadges.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No badges match your filters.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`bg-[#141b24] rounded-xl p-4 border-2 ${
                    badge.earned ? RARITY_BORDER[badge.rarity] : 'border-[#1f2a38]'
                  } ${badge.earned ? '' : 'opacity-50'} transition hover:scale-105`}
                >
                  <div className="text-center">
                    {badge.earned ? (
                      <div className="text-5xl mb-2">{badge.icon}</div>
                    ) : (
                      <div className="text-5xl mb-2 filter grayscale">
                        <FaLock className="mx-auto text-gray-600" />
                      </div>
                    )}
                    <div className="text-sm font-bold mb-1">{badge.name}</div>
                    <div className="text-xs text-gray-500 mb-2">{badge.description}</div>
                    <div className={`text-xs font-semibold px-2 py-1 rounded-full inline-block ${RARITY_COLORS[badge.rarity]}`}>
                      {badge.rarity}
                    </div>
                    {badge.xpBonus > 0 && (
                      <div className="text-xs text-cyan-400 mt-2 font-semibold">+{badge.xpBonus} XP</div>
                    )}
                    {badge.earnedAt && (
                      <div className="text-xs text-gray-600 mt-1">
                        {new Date(badge.earnedAt).toLocaleDateString()}
                      </div>
                    )}
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
