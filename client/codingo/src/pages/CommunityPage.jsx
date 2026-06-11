import { useEffect, useRef } from 'react';
import axios from 'axios';
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaPaperPlane,
  FaImage,
  FaTimes,
  FaTrash,
  FaFire,
  FaCrown,
  FaCode,
  FaGlobe,
  FaBolt,
  FaTerminal,
  FaCross,
} from 'react-icons/fa';
import { Navigate, useNavigate } from 'react-router-dom';
// import Comments from './LandinPageExperimental';
import { useDispatch, useSelector } from 'react-redux';
import { setContent, setError, setFocused, setImage, setImagePreview, setIsPosting } from '../redux/slices/postSlice';
import { setCommentText, setHeartAnim, setIsCommenting, setLikeCount, setLiked, setPage, setPosts, setShowModal } from '../redux/slices/feedSlice';
import { fetchPosts, getAuthHeaders, handleLike, getStoredUser, handleImageSelect } from '../utilites/communityHelper';
import Comments from './commentsModal';
import { setSearchQuery, } from '../redux/slices/friendsSlice';
import { searchUsers } from './FriendsPage';

/* ─── Helpers ─────────────────────────────────────────────────── */

const AVATAR_PALETTE = [
  ['#00e5ff', '#003040'],
  ['#a78bfa', '#1a0a40'],
  ['#fb923c', '#3a1a00'],
  ['#34d399', '#003020'],
  ['#f472b6', '#40001a'],
];

function AvatarInitial({ name, size = 44 }) {
  const initial = (name || '?')[0].toUpperCase();
  const [bg, text] = AVATAR_PALETTE[initial.charCodeAt(0) % AVATAR_PALETTE.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: bg, color: text,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Syne', sans-serif", fontWeight: 800,
      fontSize: size * 0.38,
      border: `2px solid ${bg}66`,
    }}>
      {initial}
    </div>
  );
}

function formatTimeAgo(date) {
  const diff = Date.now() - new Date(date);
  const s = Math.floor(diff / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (s < 60) return 'just now';
  if (m < 60) return `${m}m`;
  if (h < 24) return `${h}h`;
  if (d < 7) return `${d}d`;
  return new Date(date).toLocaleDateString();
}

function LeagueBadge({ league }) {
  if (!league) return null;
  const map = {
    Diamond: { color: '#00e5ff', icon: '💎' },
    Platinum: { color: '#a78bfa', icon: '⚡' },
    Gold: { color: '#fbbf24', icon: '🥇' },
    Silver: { color: '#94a3b8', icon: '🥈' },
    Bronze: { color: '#fb923c', icon: '🥉' },
  };
  const tier = Object.keys(map).find(k => league.includes(k));
  if (!tier) return null;
  const { color, icon } = map[tier];
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, color,
      background: `${color}18`, border: `1px solid ${color}33`,
      padding: '1px 6px', borderRadius: 6,
      fontFamily: "'DM Mono', monospace",
      letterSpacing: 0.5,
    }}>
      {icon} {league}
    </span>
  );
}

/* ─── Post Composer ───────────────────────────────────────────── */
function PostComposer({ onPostCreated }) {
  const fileInputRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const currentUser = getStoredUser();
  const dispatch = useDispatch();
  const content = useSelector(state => state.post.content);
  const focused = useSelector(state => state.post.focused);
  const image = useSelector(state => state.post.image);
  const imagePreview = useSelector(state => state.post.imagePreview);
  const isPosting = useSelector(state => state.post.isPosting);
  const error = useSelector(state => state.post.error);

  const removeImage = () => {
    dispatch(setImage(null));
    dispatch(setImagePreview(null));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePost = async () => {
    if (!content.trim()) { dispatch(setError('Write something first')); return; }
    if (content.length > 2000) { dispatch(setError('Exceeds 2000 chars')); return; }
    dispatch(setIsPosting(true));
    dispatch(setError(''));
    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      if (image) formData.append('image', image);
      const res = await axios.post(`${apiUrl}/api/community/posts`, formData, {
        withCredentials: true,
        headers: { ...getAuthHeaders() },
      });
      dispatch(setContent('')); dispatch(setFocused(false)); dispatch(setImage(null)); dispatch(setImagePreview(null));
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onPostCreated) onPostCreated(res.data.post);
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Failed to post'));
    } finally {
      dispatch(setIsPosting(false));
    }
  };

  return (
    <div style={{
      background: '#0b1420',
      border: `1px solid ${focused ? '#00e5ff33' : '#1a2535'}`,
      borderRadius: 20,
      padding: '20px 20px 16px',
      marginBottom: 8,
      transition: 'border-color 0.2s ease',
    }}>
      <div style={{ display: 'flex', gap: 14 }}>
        {currentUser?.username
          ? <AvatarInitial name={currentUser.username} size={44} />
          : <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1a2535', flexShrink: 0 }} />
        }
        <div style={{ flex: 1 }}>
          <textarea
            value={content}
            onChange={e => dispatch(setContent(e.target.value))}
            onFocus={() => dispatch(setFocused(true))}
            onBlur={() => dispatch(setFocused(false))}
            placeholder="Share what you're building, learning, or breaking... 🚀"
            maxLength={2000}
            rows={focused || content ? 4 : 2}
            style={{
              width: '100%', background: 'transparent',
              border: 'none', outline: 'none', resize: 'none',
              color: '#e8f0fe', fontSize: 15,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              lineHeight: 1.6, caretColor: '#00e5ff',
              transition: 'height 0.2s ease',
            }}
          />

          {imagePreview && (
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
              <img src={imagePreview} alt="Preview" style={{
                maxWidth: '100%', maxHeight: 240, borderRadius: 12,
                border: '1px solid #1a2535', display: 'block',
              }} />
              <button type="button" onClick={removeImage} style={{
                position: 'absolute', top: 8, right: 8,
                background: '#e53e3e', border: 'none', borderRadius: '50%',
                width: 28, height: 28, display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: 12,
              }}>
                <FaTimes />
              </button>
            </div>
          )}

          {error && <p style={{ color: '#f87171', fontSize: 12, margin: '4px 0 8px' }}>{error}</p>}

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: 12, borderTop: '1px solid #1a2535',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input ref={fileInputRef} type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleImageSelect} style={{ display: 'none' }}
                id="post-image-input"
              />
              <label htmlFor="post-image-input" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', background: '#0f1825', border: '1px solid #1a2535',
                borderRadius: 10, cursor: 'pointer', color: '#4a6080', fontSize: 13,
                fontWeight: 600, transition: 'all 0.15s',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                <FaImage style={{ fontSize: 13 }} /> Image
              </label>
              <span style={{ fontSize: 11, color: '#2e4460', fontFamily: "'DM Mono', monospace" }}>
                {content.length}/2000
              </span>
            </div>

            <button
              type="button"
              onClick={handlePost}
              disabled={!content.trim() || isPosting}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 20px',
                background: content.trim() ? 'linear-gradient(135deg, #00b4cc, #00e5ff)' : '#1a2535',
                border: 'none', borderRadius: 10,
                color: content.trim() ? '#000' : '#2e4460',
                fontWeight: 800, fontSize: 13, cursor: content.trim() ? 'pointer' : 'not-allowed',
                fontFamily: "'Syne', sans-serif", letterSpacing: 0.3,
                transition: 'all 0.2s ease',
                boxShadow: content.trim() ? '0 4px 16px #00e5ff33' : 'none',
              }}
            >
              {isPosting
                ? <><div style={{
                  width: 14, height: 14, borderRadius: '50%',
                  border: '2px solid #000', borderTopColor: 'transparent',
                  animation: 'spin 0.7s linear infinite',
                }} /> Posting</>
                : <><FaPaperPlane style={{ fontSize: 12 }} /> Post</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Post Card ───────────────────────────────────────────────── */
function PostCard({ post, currentUserId, onLike, onReplyLike, onAddReply, onComment, onDelete, index }) {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const imageUrl = post.image?.startsWith('/')
    ? `${apiUrl}${post.image}`
    : post.image;

  const dispatch = useDispatch();
  const liked = useSelector(state => state.feed.liked[post.id] ?? post.isLikedByCurrentUser ?? false);
  const likeCount = useSelector(state => state.feed.likeCounts[post.id] ?? post.likesCount ?? 0);
  const commentText = useSelector(state => state.feed.commentText[post.id] ?? '');
  const isCommenting = useSelector(state => state.feed.isCommenting[post.id] ?? false);
  const heartAnim = useSelector(state => state.feed.heartAnim[post.id] ?? false);
  const showComments = useSelector(state => state.feed.showComments[post.id] ?? false);

  const handleLikeClick = () => {
    dispatch(setLiked({ postId: post.id, value: !liked }));
    dispatch(setLikeCount({ postId: post.id, value: liked ? likeCount - 1 : likeCount + 1 }));
    if (!liked) { dispatch(setHeartAnim({ postId: post.id, value: true })); setTimeout(() => dispatch(setHeartAnim({ postId: post.id, value: false })), 600); }
    dispatch(onLike(post.id));
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    dispatch(setIsCommenting({ postId: post.id, value: true }));
    try {
      await axios.post(
        `${apiUrl}/api/community/posts/${post.id}/comments`,
        { content: commentText.trim() },
        { withCredentials: true, headers: getAuthHeaders() }
      );
      dispatch(setCommentText({ postId: post.id, value: '' }));
      if (onComment) onComment(post.id);
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      dispatch(setIsCommenting({ postId: post.id, value: false }));
    }
  };

  const handleCommentModal = () => {
    if (post.comments.length > 0) {
      dispatch(setShowModal(true));
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(
        `${apiUrl}/api/community/posts/${post.id}/comments/${commentId}`,
        { withCredentials: true, headers: getAuthHeaders() }
      );
      if (onComment) onComment(post.id);
    } catch (err) {
      console.error('Delete comment error:', err);
    }
  };

  const isOwn = post.author.id === currentUserId;

  return (
    <>
      <article style={{
        background: '#0b1420',
        border: '1px solid #1a2535',
        borderRadius: 20,
        overflow: 'hidden',
        animation: 'fadeUp 0.4s ease both',
        animationDelay: `${Math.min(index * 0.06, 0.4)}s`,
        transition: 'border-color 0.2s ease',
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#243040'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#1a2535'}
      >
        {/* Card body */}
        <div style={{ padding: '20px 20px 0' }}>
          {/* Author row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
              onClick={() => post.author.id && navigate(`/profile/${post.author.id}`)}
            >
              {post.author.profilePic
                ? <img src={post.author.profilePic} alt={post.author.username}
                  style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #1a2535', flexShrink: 0 }} />
                : <AvatarInitial name={post.author.username} size={44} />
              }
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: '#e8f0fe',
                  }}>
                    {post.author.username}
                  </span>
                  {/* <LeagueBadge league={post.author.league} /> */}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  {/* <span style={{
                  fontSize: 11, color: '#2e4460',
                  fontFamily: "'DM Mono', monospace",
                }}>
                  Lv.{post.author.level}
                </span> */}
                  <span style={{ color: '#1a2535', fontSize: 10 }}>•</span>
                  <span style={{ fontSize: 11, color: '#2e4460', fontFamily: "'DM Mono', monospace" }}>
                    {formatTimeAgo(post.createdAt)} Ago
                  </span>
                </div>
              </div>
            </div>

            {isOwn && (
              <button type="button" onClick={() => onDelete(post.id)} style={{
                background: 'none', border: 'none', color: '#2e4460',
                cursor: 'pointer', fontSize: 13, padding: 6, borderRadius: 8,
                transition: 'color 0.15s',
              }}
                onMouseEnter={e => e.target.style.color = '#f87171'}
                onMouseLeave={e => e.target.style.color = '#2e4460'}
              >
                <FaTrash />
              </button>
            )}
          </div>

          {/* Content */}
          <p style={{
            color: '#c8d8ee', fontSize: 15, lineHeight: 1.7,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            marginBottom: post.image ? 16 : 0,
          }}>
            {post.content}
          </p>
        </div>

        {/* Image */}
        {post.image && (
          <div style={{ padding: '0 0 0 0', marginTop: 4 }}>
            <img src={imageUrl} alt="Post"
              style={{
                width: '100%', maxHeight: 400, objectFit: 'cover',
                borderTop: '1px solid #1a2535', borderBottom: '1px solid #1a2535',
                display: 'block',
              }}
            />
          </div>)}

        {/* Action bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '10px 16px',
          borderTop: post.image ? 'none' : '1px solid #131e2e',
        }}>
          {/* Like */}
          <button type="button" onClick={handleLikeClick} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: liked ? '#f87171' : '#2e4460',
            fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500,
            padding: '8px 12px', borderRadius: 10,
            transition: 'all 0.15s',
            transform: heartAnim ? 'scale(1.25)' : 'scale(1)',
          }}
            onMouseEnter={e => !liked && (e.currentTarget.style.color = '#fb7185')}
            onMouseLeave={e => !liked && (e.currentTarget.style.color = '#2e4460')}
          >
            {liked ? <FaHeart style={{ fontSize: 15 }} /> : <FaRegHeart style={{ fontSize: 15 }} />}
            <span>{likeCount}</span>
          </button>


          {/* Comment toggle */}
          <button type="button" onClick={handleCommentModal} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: showComments ? '#00e5ff' : '#2e4460',
            fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500,
            padding: '8px 12px', borderRadius: 10,
            transition: 'color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#00e5ff'}
            onMouseLeave={e => !showComments && (e.currentTarget.style.color = '#2e4460')}
          >
            <FaComment style={{ fontSize: 14 }} />
            <span>{post.commentsCount}</span>
          </button>
        </div>

        {/* Modal for comments  */}
        {/* {showModal && (
        <Comments />
      )} */}
      </article>
    </>
  );
}

/* ─── Trending tag pills (decorative sidebar feel) ────────────── */
function TrendingTopics() {
  const topics = ['#JavaScript', '#ReactJS', '#WebDev', '#CSS', '#NodeJS', '#TypeScript', '#OpenSource', '#API'];
  return (
    <div style={{
      background: '#0b1420', border: '1px solid #1a2535', borderRadius: 16,
      padding: '16px 18px', marginBottom: 12,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
        fontFamily: "'Syne', sans-serif", fontWeight: 700,
        fontSize: 13, color: '#e8f0fe', letterSpacing: 0.3,
      }}>
        <FaFire style={{ color: '#fb923c', fontSize: 14 }} /> Trending
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {topics.map(t => (
          <span key={t} style={{
            padding: '4px 10px',
            background: '#0f1825', border: '1px solid #1a2535',
            borderRadius: 8, fontSize: 12, color: '#4a6080',
            fontFamily: "'DM Mono', monospace", cursor: 'pointer',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.target.style.borderColor = '#00e5ff33'; e.target.style.color = '#00e5ff'; }}
            onMouseLeave={e => { e.target.style.borderColor = '#1a2535'; e.target.style.color = '#4a6080'; }}
          >{t}</span>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────── */
export default function CommunityPage() {
  const posts = useSelector(state => state.feed.posts);
  const page = useSelector(state => state.feed.page);
  const hasMore = useSelector(state => state.feed.hasMore);
  const isLoading = useSelector(state => state.feed.isLoading);
  const error = useSelector(state => state.feed.error);
  const observerRef = useRef(null);
  const loadingRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const currentUser = getStoredUser();
  const currentUserId = currentUser?.id || currentUser?._id || '';
  const showModal = useSelector(state => state.feed.showModal);
  const searchQuery = useSelector(state => state.friends.searchQuery);
  const focused = useSelector(state => state.post.focused);
  const searchResults = useSelector(state => state.friends.searchResults);
const isSearching = useSelector(state => state.friends.isSearching);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => { dispatch(fetchPosts(1)); }, [dispatch]);

  useEffect(() => {
    if (!loadingRef.current || !hasMore) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !isLoading && hasMore) {
        const next = page + 1;
        dispatch(setPage(next));
        dispatch(fetchPosts(next));
      }
    }, { threshold: 0.1 });
    observer.observe(loadingRef.current);
    observerRef.current = observer;
    return () => observerRef.current?.disconnect();
  }, [page, hasMore, isLoading, dispatch]);

  const handlePostCreated = (newPost) => dispatch(setPosts(prev => [newPost, ...prev]));

  const handleComment = async (postId) => {
    try {
      const res = await axios.get(`${apiUrl}/api/community/posts/${postId}`, {
        withCredentials: true, headers: getAuthHeaders(),
      });
      dispatch(setPosts(prev => prev.map(p => p.id === postId ? res.data.post : p)));
    } catch (err) { console.error('Refresh error:', err); }
  };

  const handleDelete = async (postId) => {
    if (!confirm('Delete this post?')) return;
    try {
      await axios.delete(`${apiUrl}/api/community/posts/${postId}`, {
        withCredentials: true, headers: getAuthHeaders(),
      });
      dispatch(setPosts(prev => prev.filter(p => p.id !== postId)));
    } catch (err) { console.error('Delete error:', err); }
  };

  // const getUsers = () => {
  //   const data = dispatch(searchUsers(searchQuery));
  //   console.log('Search results:', data);
  //   dispatch(setSearchResults(data));
  // }
 const searchButton = () => {
  if (searchQuery?.trim()) {
    dispatch(searchUsers(searchQuery)); // Dispatch as async action
  }
}
  return (
  <div>
      {!showModal ? (
        <div>
          <div style={{
            minHeight: '100vh',
            background: '#080e18',
            color: '#e8f0fe',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            padding: '0',
            position: 'relative',
          }}>
            {/* Ambient top glow */}
            <div style={{
              position: 'fixed', top: -180, left: '30%',
              width: 500, height: 400, borderRadius: '50%',
              background: 'radial-gradient(circle, #00e5ff08 0%, transparent 70%)',
              pointerEvents: 'none', zIndex: 0,
            }} />

            <div style={{
              maxWidth: 1100, margin: '0 auto',
              padding: '28px 20px 60px',
              display: 'grid',
              gridTemplateColumns: '1fr 300px',
              gap: 24,
              position: 'relative', zIndex: 1,
            }}>

              {/* ── Left: main feed ──────────────────────────────── */}
              <div>
                {/* Page header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  marginBottom: 24,
                  paddingBottom: 20,
                  borderBottom: '1px solid #1a2535',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 13,
                    background: '#fb923c18', border: '1px solid #fb923c33',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                  }}>🔥</div>
                  <div>
                    <h1 style={{
                      margin: 0,
                      fontFamily: "'Syne', sans-serif", fontWeight: 800,
                      fontSize: 24, letterSpacing: -0.5, color: '#e8f0fe',
                    }}>
                      Community Feed
                    </h1>
                    <p style={{ margin: 0, fontSize: 13, color: '#2e4460' }}>
                      Where web devs share what they're building
                    </p>
                  </div>
                </div>
                <div>
                  <textarea
                    value={searchQuery}
                    onChange={e => dispatch(setSearchQuery(e.target.value))}
                    // onFocus={() => dispatch(setFocused(true))}
                    // onBlur={() => dispatch(setFocused(false))}
                    placeholder="Search posts, topics, or devs...🔍"
                    maxLength={2000}
                    // rows={focused || searchQuery ? 4 : 2}
                    className="
    w-full bg-transparent border-none outline-none resize-none
    text-[#e8f0fe] text-[15px] leading-[1.6]
    font-['Plus_Jakarta_Sans'] caret-[#00e5ff]
    transition-[height] duration-200 ease-in-out
  "
                  />
                  <button onClick={searchButton}>search</button>
                </div>

  <div>
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, margin: '20px 1px 16px',
    }}>
      <div style={{ flex: 1, height: 1, background: '#1a2535' }} />
      <span style={{ fontSize: 11, color: '#2e4460', fontFamily: "'DM Mono', monospace" }}>
        SEARCH RESULTS
      </span>
      <div style={{ flex: 1, height: 1, background: '#1a2535' }} />
    </div>

    {isSearching && (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <div style={{
          width: 36, height: 36, border: '3px solid #00e5ff', borderTopColor: 'transparent',
          borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.75s linear infinite',
        }} />
      </div>
    )}

    {!isSearching && searchResults.length === 0 && (
      <div style={{
        background: '#0b1420', border: '1px solid #1a2535', borderRadius: 20,
        padding: '48px 24px', textAlign: 'center',
      }}>
        <p style={{ color: '#2e4460', fontSize: 14 }}>No users found</p>
      </div>
    )}

    {searchResults.map(user => (
      <div key={user._id} style={{
        background: '#0b1420', border: '1px solid #1a2535', borderRadius: 12,
        padding: '16px', marginBottom: 12, display: 'flex', alignItems: 'center',
        gap: 12, cursor: 'pointer', transition: 'border-color 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#243040'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#1a2535'}
        onClick={() => navigate(`/profile/${user._id}`)}
      >
        {user.profilePic ? (
          <img src={user.profilePic} alt={user.username}
            style={{ width: 44, height: 44, borderRadius: '50%' }} />
        ) : (
          <AvatarInitial name={user.username} size={44} />
        )}
        <div>
          <div style={{ color: '#e8f0fe', fontWeight: 600 }}>{user.username}</div>
          <div style={{ color: '#2e4460', fontSize: 12 }}>{user.email}</div>
        </div>
      </div>
    ))}
  </div>
                {/* Composer */}
                <PostComposer onPostCreated={handlePostCreated} />

                {/* Divider */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 16px',
                }}>
                  <div style={{ flex: 1, height: 1, background: '#1a2535' }} />
                  <span style={{ fontSize: 11, color: '#2e4460', fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
                    FOR YOU
                  </span>
                  <div style={{ flex: 1, height: 1, background: '#1a2535' }} />
                </div>

                {/* Error */}
                {error && (
                  <div style={{
                    background: '#f8717118', border: '1px solid #f8717144',
                    borderRadius: 12, padding: '12px 16px', marginBottom: 16,
                    color: '#f87171', fontSize: 13,
                  }}>
                    {error}
                  </div>
                )}

                {/* Feed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {posts.length === 0 && !isLoading ? (
                    <div style={{
                      background: '#0b1420', border: '1px solid #1a2535',
                      borderRadius: 20, padding: '48px 24px', textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>👩‍💻</div>
                      <p style={{ color: '#2e4460', fontSize: 14 }}>No posts yet — be the first to share!</p>
                    </div>
                  ) : (
                    posts.map((post, i) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        currentUserId={currentUserId}
                        onLike={handleLike}
                        onComment={handleComment}
                        onDelete={handleDelete}
                        index={i}
                      />
                    ))
                  )}

                  {isLoading && (
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                      <div style={{
                        width: 36, height: 36,
                        border: '3px solid #00e5ff',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        margin: '0 auto 12px',
                        animation: 'spin 0.75s linear infinite',
                      }} />
                      <p style={{ color: '#2e4460', fontSize: 13 }}>Loading...</p>
                    </div>
                  )}

                  {hasMore && !isLoading && <div ref={loadingRef} style={{ height: 20 }} />}
                </div>
              </div>

              {/* ── Right: sidebar ───────────────────────────────── */}
              <div style={{ position: 'sticky', top: 28, alignSelf: 'start' }}>
                {/* Mini stats */}
                <div style={{
                  background: '#0b1420', border: '1px solid #1a2535', borderRadius: 16,
                  padding: '16px 18px', marginBottom: 12,
                }}>
                  <div style={{
                    fontFamily: "'Syne', sans-serif", fontWeight: 700,
                    fontSize: 13, color: '#e8f0fe', marginBottom: 14, letterSpacing: 0.3,
                  }}>
                    📡 Community
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { label: 'Posts today', val: posts.length, icon: '📝' },
                      { label: 'Active devs', val: '—', icon: '👥' },
                      { label: 'Your posts', val: posts.filter(p => p.author.id === currentUserId).length, icon: '✍️' },
                    ].map(row => (
                      <div key={row.label} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '8px 12px', background: '#080e18', borderRadius: 10,
                        border: '1px solid #131e2e',
                      }}>
                        <span style={{ fontSize: 12, color: '#4a6080' }}>{row.icon} {row.label}</span>
                        <span style={{
                          fontSize: 14, fontWeight: 700,
                          fontFamily: "'DM Mono', monospace", color: '#00e5ff',
                        }}>{row.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <TrendingTopics />

                {/* Community rules */}
                <div style={{
                  background: '#0b1420', border: '1px solid #1a2535', borderRadius: 16,
                  padding: '16px 18px',
                }}>
                  <div style={{
                    fontFamily: "'Syne', sans-serif", fontWeight: 700,
                    fontSize: 13, color: '#e8f0fe', marginBottom: 12, letterSpacing: 0.3,
                  }}>
                    <FaCode style={{ color: '#00e5ff', fontSize: 13, marginRight: 7 }} />
                    Dev Code
                  </div>
                  {[
                    'Share what you\'re building',
                    'Help each other debug',
                    'Celebrate small wins',
                    'Keep it constructive',
                  ].map((rule, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: 8, alignItems: 'flex-start',
                      marginBottom: 8, fontSize: 12, color: '#3a5270',
                      lineHeight: 1.5,
                    }}>
                      <span style={{ color: '#00e5ff', fontFamily: "'DM Mono', monospace", marginTop: 1 }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {rule}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Comments />
        </>
      )}
    </div>
  );
}