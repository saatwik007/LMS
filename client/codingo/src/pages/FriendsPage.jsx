import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  FaUserFriends,
  FaSearch,
  FaTrophy,
  FaStar,
  FaFire,
  FaUserPlus,
  FaCheck,
  FaTimes,
  FaTrash,
  FaMedal
} from 'react-icons/fa';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'requests', 'search'
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL || '';

  // Fetch friends list
  const fetchFriends = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${apiUrl}/api/social/friends`, {
        withCredentials: true,
        headers: getAuthHeaders()
      });
      setFriends(response.data.friends);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load friends');
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  // Fetch friend requests
  const fetchFriendRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${apiUrl}/api/social/friend-requests`, {
        withCredentials: true,
        headers: getAuthHeaders()
      });
      setFriendRequests(response.data.requests);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load friend requests');
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  // Search users
  const searchUsers = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);
    try {
      const response = await axios.get(`${apiUrl}/api/social/search`, {
        params: { q: searchQuery },
        withCredentials: true,
        headers: getAuthHeaders()
      });
      setSearchResults(response.data.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  }, [apiUrl, searchQuery]);

  useEffect(() => {
    if (activeTab === 'friends') {
      fetchFriends();
    } else if (activeTab === 'requests') {
      fetchFriendRequests();
    }
  }, [activeTab, fetchFriends, fetchFriendRequests]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (activeTab === 'search') {
        searchUsers();
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, activeTab, searchUsers]);

  const handleSendRequest = async (userId) => {
    try {
      const response = await axios.post(
        `${apiUrl}/api/social/friend-request/${userId}`,
        {},
        { withCredentials: true, headers: getAuthHeaders() }
      );
      setSuccessMessage(response.data.message);
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // If auto-accepted, refresh friends list
      if (response.data.status === 'friends') {
        fetchFriends();
      }
      
      // Update search results to show Pending state instead of removing
      setSearchResults(prev =>
        prev.map(user =>
          user._id === userId ? { ...user, hasPendingRequest: true } : user
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send friend request');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.post(
        `${apiUrl}/api/social/friend-request/${requestId}/accept`,
        {},
        { withCredentials: true, headers: getAuthHeaders() }
      );
      setSuccessMessage('Friend request accepted!');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchFriendRequests();
      fetchFriends();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept request');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.post(
        `${apiUrl}/api/social/friend-request/${requestId}/reject`,
        {},
        { withCredentials: true, headers: getAuthHeaders() }
      );
      setSuccessMessage('Friend request rejected');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchFriendRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await axios.delete(`${apiUrl}/api/social/friends/${friendId}`, {
        withCredentials: true,
        headers: getAuthHeaders()
      });
      setSuccessMessage('Friend removed');
      setTimeout(() => setSuccessMessage(null), 3000);
      setConfirmRemoveId(null);
      fetchFriends();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove friend');
      setTimeout(() => setError(null), 3000);
      setConfirmRemoveId(null);
    }
  };

  const renderFriendCard = (friend, showRank = false, rank = 0) => (
    <div
      key={friend._id}
      className="bg-[#141b24] rounded-lg p-4 border border-[#1f2a38] hover:border-cyan-600/50 transition"
    >
      <div className="flex items-center gap-3">
        {showRank && (
          <div className="text-2xl font-bold text-cyan-400 w-8 flex-shrink-0">
            #{rank}
          </div>
        )}
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-xl font-bold flex-shrink-0">
          {friend.profilePic ? (
            <img src={friend.profilePic} alt={friend.username} className="w-full h-full rounded-full object-cover" />
          ) : (
            friend.username[0].toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-lg truncate">{friend.username}</div>
          <div className="text-sm text-gray-400">{friend.league}</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1 text-orange-400 text-sm">
            <FaStar />
            <span className="font-semibold">{friend.totalXp.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-purple-400 text-sm mt-1">
            <FaTrophy />
            <span>Level {friend.level}</span>
          </div>
          <div className="flex items-center gap-1 text-orange-500 text-sm mt-1">
            <FaFire />
            <span>{friend.streakCount} day</span>
          </div>
        </div>
      </div>
      {!showRank && (
        <div className="mt-3 flex gap-2">
          {confirmRemoveId === friend._id ? (
            <>
              <span className="flex-1 text-sm text-gray-300 flex items-center">Are you sure?</span>
              <button
                onClick={() => handleRemoveFriend(friend._id)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmRemoveId(null)}
                className="px-3 py-2 bg-[#1a2332] hover:bg-[#243547] text-gray-400 rounded-lg text-sm font-semibold transition"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirmRemoveId(friend._id)}
              className="flex-1 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
            >
              <FaTrash /> Remove
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1419] text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg mb-6">
          <div className="flex items-center gap-3">
            <FaUserFriends className="text-4xl text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold">Friends</h1>
              <p className="text-gray-400 text-sm">Connect with fellow learners</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-600/20 border border-red-600 rounded-lg p-4 mb-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="bg-emerald-600/20 border border-emerald-600 rounded-lg p-4 mb-4">
            <p className="text-emerald-400">{successMessage}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === 'friends'
                ? 'bg-cyan-600 text-white'
                : 'bg-[#1a2332] text-gray-400 hover:bg-[#243547]'
            }`}
          >
            <FaUserFriends className="inline mr-2" />
            Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap relative ${
              activeTab === 'requests'
                ? 'bg-cyan-600 text-white'
                : 'bg-[#1a2332] text-gray-400 hover:bg-[#243547]'
            }`}
          >
            <FaMedal className="inline mr-2" />
            Requests
            {friendRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {friendRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === 'search'
                ? 'bg-cyan-600 text-white'
                : 'bg-[#1a2332] text-gray-400 hover:bg-[#243547]'
            }`}
          >
            <FaSearch className="inline mr-2" />
            Search
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Friends Tab */}
            {activeTab === 'friends' && (
              <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a]">
                <h2 className="text-xl font-bold mb-4">Your Friends</h2>
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading friends...</p>
                  </div>
                ) : friends.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <FaUserFriends className="text-5xl mx-auto mb-4 opacity-50" />
                    <p>No friends yet. Search for users to connect!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {friends.map(friend => renderFriendCard(friend))}
                  </div>
                )}
              </div>
            )}

            {/* Friend Requests Tab */}
            {activeTab === 'requests' && (
              <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a]">
                <h2 className="text-xl font-bold mb-4">Friend Requests</h2>
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading requests...</p>
                  </div>
                ) : friendRequests.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <FaMedal className="text-5xl mx-auto mb-4 opacity-50" />
                    <p>No pending friend requests</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {friendRequests.map(request => (
                      <div
                        key={request._id}
                        className="bg-[#141b24] rounded-lg p-4 border border-[#1f2a38]"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-lg font-bold">
                            {request.from.profilePic ? (
                              <img src={request.from.profilePic} alt={request.from.username} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              request.from.username[0].toUpperCase()
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold">{request.from.username}</div>
                            <div className="text-sm text-gray-400">
                              Level {request.from.level} • {request.from.totalXp.toLocaleString()} XP
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptRequest(request._id)}
                            className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                          >
                            <FaCheck /> Accept
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request._id)}
                            className="flex-1 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                          >
                            <FaTimes /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Search Tab */}
            {activeTab === 'search' && (
              <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a]">
                <h2 className="text-xl font-bold mb-4">Find Friends</h2>
                <div className="relative mb-4">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by username..."
                    className="w-full pl-10 pr-4 py-3 bg-[#141b24] border border-[#2a3a4a] rounded-lg focus:outline-none focus:border-cyan-600 text-white"
                  />
                </div>
                {isSearching ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-400">Searching...</p>
                  </div>
                ) : searchResults.length === 0 && searchQuery.trim() ? (
                  <div className="text-center py-12 text-gray-400">
                    <p>No users found</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <FaSearch className="text-5xl mx-auto mb-4 opacity-50" />
                    <p>Start typing to search for users</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {searchResults.map(user => (
                      <div
                        key={user._id}
                        className="bg-[#141b24] rounded-lg p-4 border border-[#1f2a38] hover:border-cyan-600/50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-lg font-bold">
                            {user.profilePic ? (
                              <img src={user.profilePic} alt={user.username} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              user.username[0].toUpperCase()
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold">{user.username}</div>
                            <div className="text-sm text-gray-400">
                              Level {user.level} • {user.totalXp.toLocaleString()} XP
                            </div>
                          </div>
                          {user.isFriend ? (
                            <div className="px-4 py-2 bg-emerald-600/20 text-emerald-400 rounded-lg text-sm font-semibold">
                              Friends
                            </div>
                          ) : user.hasPendingRequest ? (
                            <div className="px-4 py-2 bg-yellow-600/20 text-yellow-400 rounded-lg text-sm font-semibold cursor-default">
                              Pending
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSendRequest(user._id)}
                              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-semibold transition flex items-center gap-2"
                            >
                              <FaUserPlus /> Add
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Friends Leaderboard */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] sticky top-20">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaTrophy className="text-yellow-400" />
                Friends Leaderboard
              </h2>
              {friends.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">Add friends to see the leaderboard</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {friends.slice(0, 10).map((friend, index) => renderFriendCard(friend, true, index + 1))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
