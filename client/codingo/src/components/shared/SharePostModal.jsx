import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { Check, Search, Send, X } from 'lucide-react';
import { apiUrl, getAuthHeaders } from '../../utilites/communityHelper';

function getMediaUrl(value) {
  if (!value) return '';
  return value.startsWith('/') ? `${apiUrl}${value}` : value;
}

export default function SharePostModal({ post, onClose }) {
  const [friends, setFriends] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${apiUrl}/api/social/friends`, {
      withCredentials: true,
      headers: getAuthHeaders(),
    }).then((response) => {
      setFriends(response.data.friends || []);
      setStatus('idle');
    }).catch((requestError) => {
      console.error('Failed to load friends:', requestError);
      setError('Could not load your friends.');
      setStatus('idle');
    });
  }, []);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && status !== 'sending') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose, status]);

  if (!post) return null;

  const filteredFriends = friends.filter((friend) =>
    friend.username?.toLowerCase().includes(query.trim().toLowerCase())
  );
  const imageUrl = getMediaUrl(post.image);

  const toggleFriend = (friendId) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(friendId)) next.delete(friendId);
      else next.add(friendId);
      return next;
    });
  };

  const handleSend = async () => {
    if (!selectedIds.size || status === 'sending') return;
    setStatus('sending');
    setError('');
    try {
      await axios.post(`${apiUrl}/api/chat/share-post`, {
        postId: post.id,
        recipientIds: [...selectedIds],
      }, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      setStatus('sent');
      window.setTimeout(onClose, 700);
    } catch (requestError) {
      console.error('Failed to share post:', requestError);
      setError(requestError.response?.data?.error || 'Could not share this post.');
      setStatus('idle');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="share-post-title">
      <button type="button" className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close share dialog" />
      <section className="relative flex max-h-[min(680px,90vh)] w-full max-w-md flex-col overflow-hidden rounded-lg border border-white/15 bg-[#101010] shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 id="share-post-title" className="text-base font-semibold text-white">Share with friends</h2>
            <p className="mt-0.5 text-xs text-neutral-500">Send this post in Messages</p>
          </div>
          <button type="button" onClick={onClose} disabled={status === 'sending'} className="grid h-8 w-8 place-items-center text-neutral-400 hover:text-white disabled:opacity-50" aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="flex items-center gap-3 border-b border-white/10 bg-white/2 px-5 py-3">
          {imageUrl ? (
            <img src={imageUrl} alt="Post preview" className="h-12 w-12 shrink-0 rounded object-cover" />
          ) : (
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded bg-white/10 text-xs text-neutral-500">Post</div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-medium text-neutral-400">{post.author?.username || 'Codingo post'}</p>
            <p className="mt-1 truncate text-sm text-white">{post.content || 'Media post'}</p>
          </div>
        </div>

        <div className="px-4 pt-4">
          <label className="flex items-center gap-2 border border-white/10 bg-black/30 px-3 py-2 text-neutral-400 focus-within:border-white/25">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search friends"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-neutral-600"
              autoFocus
            />
          </label>
        </div>

        <div className="min-h-48 flex-1 overflow-y-auto px-4 py-3">
          {status === 'loading' ? (
            <div className="grid h-40 place-items-center text-sm text-neutral-500">Loading friends...</div>
          ) : filteredFriends.length ? filteredFriends.map((friend) => {
            const friendId = String(friend._id || friend.id);
            const selected = selectedIds.has(friendId);
            const avatarUrl = getMediaUrl(friend.profilePic);
            return (
              <button
                key={friendId}
                type="button"
                onClick={() => toggleFriend(friendId)}
                className="flex w-full items-center gap-3 border-b border-white/5 px-2 py-3 text-left transition hover:bg-white/5"
                aria-pressed={selected}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <span className="grid h-10 w-10 rounded-full bg-cyan-400/15 text-sm font-semibold text-cyan-300 place-items-center">
                    {(friend.username?.[0] || '?').toUpperCase()}
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">{friend.username}</span>
                <span className={`grid h-6 w-6 place-items-center rounded-full border transition ${selected ? 'border-cyan-400 bg-cyan-400 text-black' : 'border-white/20 text-transparent'}`}>
                  <Check size={14} strokeWidth={3} />
                </span>
              </button>
            );
          }) : (
            <div className="grid h-40 place-items-center px-6 text-center text-sm text-neutral-500">
              {friends.length ? 'No friends match your search.' : 'Add friends before sharing posts.'}
            </div>
          )}
        </div>

        {error && <p className="px-5 pb-2 text-sm text-rose-400">{error}</p>}
        <footer className="flex items-center justify-between border-t border-white/10 px-5 py-4">
          <span className="text-xs text-neutral-500">{selectedIds.size ? `${selectedIds.size} selected` : 'Select friends'}</span>
          <button
            type="button"
            onClick={handleSend}
            disabled={!selectedIds.size || status === 'sending' || status === 'sent'}
            className="flex items-center gap-2 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === 'sent' ? <><Check size={16} /> Sent</> : <><Send size={16} /> {status === 'sending' ? 'Sending...' : 'Send'}</>}
          </button>
        </footer>
      </section>
    </div>,
    document.body
  );
}