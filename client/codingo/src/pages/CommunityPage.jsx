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
  FaClock,
} from 'react-icons/fa';
import { Navigate, useNavigate } from 'react-router-dom';
// import Comments from './LandinPageExperimental';
import { useDispatch, useSelector } from 'react-redux';
import { setContent, setError, setFocused, setImagePreview, setIsPosting } from '../redux/slices/postSlice';
import { setHeartAnim, setLikeCount, setLiked, setPage, setPosts, setSelectedPost, setShowModal, addPostToTop } from '../redux/slices/feedSlice';
import { fetchPosts, getAuthHeaders, handleLike, getStoredUser, formatTimeAgo } from '../utilites/communityHelper';
import Comments from './CommentsModal';
import { useState } from 'react';
import ParticleCanvas from '../components/LandingPage/ParticleCanvas';
import Capsules from '../components/Comments/Capsules';
import CapsuleModal from '../components/Comments/CapsuleModal';
import CapsulePostModal from '../components/Comments/CapsulePostModal';
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
    <div
      className="flex items-center justify-center flex-shrink-0 rounded-full font-['Syne'] font-extrabold"
      style={{
        width: size,
        height: size,
        background: bg,
        color: text,
        fontSize: size * 0.38,
        border: `2px solid ${bg}66`,
      }}
    >
      {initial}
    </div>
  );
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
    <span
      className="text-[11px] font-bold font-['DM_Mono'] px-[6px] py-[1px] rounded-[6px] tracking-[0.5px]"
      style={{
        color,
        background: `${color}18`,
        border: `1px solid ${color}33`,
      }}
    >
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
  // const image = useSelector(state => state.post.image);
  const imagePreview = useSelector(state => state.post.imagePreview);
  const isPosting = useSelector(state => state.post.isPosting);
  const error = useSelector(state => state.post.error);
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  const handleImageSelect = (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      // if (file.size > 3 * 1024 * 1024) { dispatch(setError('Image must be < 3MB')); return; }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
        dispatch(setError('Only JPEG, PNG, WEBP allowed')); return;
      }
      setSelectedImageFile(file);
      dispatch(setImagePreview(URL.createObjectURL(file)));
      dispatch(setError(''));
    } catch (error) {
      console.error('Error selecting image:', error);
    }
  };

  const removeImage = () => {
    setSelectedImageFile(null);
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
      if (selectedImageFile) formData.append('image', selectedImageFile);
      const res = await axios.post(`${apiUrl}/api/community/posts`, formData, {
        withCredentials: true,
        headers: { ...getAuthHeaders() },
      });
      dispatch(setContent(''));
      dispatch(setFocused(false));
      setSelectedImageFile(null);
      dispatch(setImagePreview(null));
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onPostCreated) onPostCreated(res.data.post);
      // dispatch(setContent('')); dispatch(setFocused(false)); dispatch(setSelectedImageFile(null)); dispatch(setImagePreview(null));
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onPostCreated) onPostCreated(res.data.post);
    } catch (err) {
      dispatch(setError(err.response?.data?.message));
    } finally {
      dispatch(setIsPosting(false));
    }
  };

  return (
    <div
      className={`bg-[#2B2B2B] rounded-[20px] px-[20px] pt-[20px] pb-[16px] mb-[8px] transition-colors duration-200 ease-in-out ${focused ? "border border-[#aaaaaa]" : "border border-[#2B2B2B]"
        }`}
    >
      <div className="flex gap-[14px]">
        {currentUser?.username ? (
          <AvatarInitial name={currentUser.username} size={44} />
        ) : (
          <div className="w-[44px] h-[44px] rounded-full bg-[#1a2535] flex-shrink-0" />
        )}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => dispatch(setContent(e.target.value))}
            onFocus={() => dispatch(setFocused(true))}
            onBlur={() => dispatch(setFocused(false))}
            placeholder="Share what you're building, learning, or breaking... 🚀"
            maxLength={2000}
            rows={focused || content ? 4 : 2}
            className="w-full bg-transparent border-none outline-none resize-none text-[#e8f0fe] text-[15px] font-['Plus_Jakarta_Sans'] leading-[1.6] caret-[#00e5ff] transition-[height] duration-200 ease-in-out"
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
            <div className="flex items-center gap-[8px]">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                // onChange={(e) => dispatch(handleImageSelect(e))}
                onChange={handleImageSelect}
                className="hidden"
                id="post-image-input"
              />
              <label
                htmlFor="post-image-input"
                className="flex items-center gap-[6px] px-[14px] py-[7px] bg-[#404040] rounded-[10px] cursor-pointer text-[#aaaaaa] text-[13px] font-semibold font-['Plus_Jakarta_Sans'] transition-all duration-150"
                onMouseEnter={(e) => {
                  e.target.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#aaaaaa";
                }}
              >
                <FaImage className="text-[13px]" /> Image
              </label>
              <span className="text-[11px] text-[#aaaaaa] font-['DM_Mono']">
                {content.length}/2000
              </span>
            </div>

            <button
              type="button"
              onClick={handlePost}
              disabled={!content.trim() || isPosting}
              className={`flex items-center gap-[7px] px-[20px] py-[8px] border-none rounded-[10px] font-['Syne'] font-extrabold text-[13px] tracking-[0.3px] transition-all duration-200 ease-in-out ${content.trim()
                ? "bg-gradient-to-br from-[#00b4cc] to-[#00e5ff] text-black cursor-pointer shadow-[0_4px_16px_#00e5ff33]"
                : "bg-[#404040] text-[#aaaaaa] cursor-not-allowed"
                }`}
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
function PostCard({ post, currentUserId, onLike, onDelete, index }) {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || '';

  function getDisplayImageUrl(imageUrl) {
    if (!imageUrl) return '';

    // Convert old uc?id= format to thumbnail format
    const match = imageUrl.match(/[?&]id=([^&]+)/);
    if (match && imageUrl.includes('uc?id=')) {
      const fileId = match[1];
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }

    return imageUrl; // already in new format, or non-Drive URL, leave as-is
  }

  const imageUrl = post.image?.startsWith('/')
    ? `${apiUrl}${post.image}`
    : getDisplayImageUrl(post.image);

  const dispatch = useDispatch();
  const liked = useSelector(state => state.feed.liked[post.id] ?? post.isLikedByCurrentUser ?? false);
  const likeCount = useSelector(state => state.feed.likeCounts[post.id] ?? post.likesCount ?? 0);
  const heartAnim = useSelector(state => state.feed.heartAnim[post.id] ?? false);
  const showComments = useSelector(state => state.feed.showComments[post.id] ?? false);

  const handleLikeClick = () => {
    dispatch(setLiked({ postId: post.id, value: !liked }));
    dispatch(setLikeCount({ postId: post.id, value: liked ? likeCount - 1 : likeCount + 1 }));
    if (!liked) { dispatch(setHeartAnim({ postId: post.id, value: true })); setTimeout(() => dispatch(setHeartAnim({ postId: post.id, value: false })), 600); }
    // dispatch(onLike(post.id));
    onLike(post.id);
  };

  const handleCommentModal = () => {
    dispatch(setSelectedPost(post)); // ← save this specific post
    dispatch(setShowModal(true));
  }
  const isOwn = post.author.id === currentUserId;

  return (
    <>
      <article
        className="bg-[#2B2B2B] z-10 rounded-[20px] overflow-hidden transition-colors duration-200 ease-in-out"
      // onMouseEnter={e => e.currentTarget.style.borderColor = '#313131'}
      // onMouseLeave={e => e.currentTarget.style.borderColor = '#2B2B2B'}
      >
        {/* Card body */}
        <div className="px-[20px] pt-[20px]">
          {/* Author row */}
          <div className="flex items-start justify-between mb-[14px]">
            <div
              className="flex items-center gap-[12px] cursor-pointer fill"
              onClick={() =>
                post.author.id && navigate(`/profile/${post.author.id}`)
              }
            >
              {post.author.profilePic
                ? <img src={post.author.profilePic} alt={post.author.username}
                  style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #1a2535', flexShrink: 0, objectFit: 'cover' }} />
                : <AvatarInitial name={post.author.username} size={44} />
              }
              <div>
                <div className="flex items-center gap-[8px] flex-wrap">
                  <span className="font-['Syne'] font-bold text-[15px] text-[#e8f0fe]">
                    {post.author.username}
                  </span>
                </div>

                <div className="flex items-center gap-[6px] mt-[2px]">
                  <span className="text-[#aaaaaa] text-[10px]"><FaClock /></span>
                  <span className="text-[12px] text-[#919191] font-['DM_Mono']">
                    {formatTimeAgo(post.createdAt)}
                  </span>
                </div>
              </div>

            </div>

            {isOwn && (
              <button
                type="button"
                onClick={() => onDelete(post.id)}
                className="bg-none border-none text-[#aaaaaa] cursor-pointer text-[13px] p-[6px] rounded-[8px] transition-colors duration-150"
                onMouseEnter={(e) => (e.target.style.color = "#f87171")}
                onMouseLeave={(e) => (e.target.style.color = "#aaaaaa")}
              >
                <FaTrash />
              </button>
            )}
          </div>

          {/* Content */}
          <p
            className="text-[#c8d8ee] text-[15px] leading-[1.7] font-['Plus_Jakarta_Sans'] whitespace-pre-wrap break-words"
            style={{ marginBottom: post.image ? "16px" : "0px" }}
          >
            {post.content}
          </p>

        </div>

        {/* Image */}
        {post.image && (
          <div className="p-0 mt-[4px]">
            <img
              src={imageUrl}
              alt="Post"
              className="w-full max-h-[400px] object-cover border-t border-b border-[#1a2535] block"
            />
          </div>
        )}

        {/* Action bar */}
        <div
          className={`flex items-center gap-[4px] px-[16px] py-[10px]
            }`}
        >
          {/* Like */}
          <button
            type="button"
            onClick={handleLikeClick}
            className={`flex items-center gap-[6px] bg-none border-none cursor-pointer font-['DM_Mono'] text-[13px] font-medium px-[12px] py-[8px] rounded-[10px] transition-all duration-150`}
            style={{
              color: liked ? "#f87171" : "#aaaaaa",
              transform: heartAnim ? "scale(1.25)" : "scale(1)",
            }}
            onMouseEnter={(e) => !liked && (e.currentTarget.style.color = "#fb7185")}
            onMouseLeave={(e) => !liked && (e.currentTarget.style.color = "#aaaaaa")}
          >
            {liked ? (
              <FaHeart style={{ fontSize: 15 }} />
            ) : (
              <FaRegHeart style={{ fontSize: 15 }} />
            )}
            <span>{likeCount}</span>
          </button>


          {/* Comment toggle */}
          <button
            type="button"
            onClick={handleCommentModal}
            className="flex items-center gap-[6px] bg-none border-none cursor-pointer font-['DM_Mono'] text-[13px] font-medium px-[12px] py-[8px] rounded-[10px] transition-colors duration-150"
            style={{ color: showComments ? "#00e5ff" : "#aaaaaa" }}
            onMouseEnter={(e) => !showComments && (e.currentTarget.style.color = "#00e5ff")}
            onMouseLeave={(e) => !showComments && (e.currentTarget.style.color = "#aaaaaa")}
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
    <div className="bg-[#2B2B2B] border border-[#1a2535] rounded-[16px] px-[18px] py-[16px] mb-[12px]">
      <div className="flex items-center gap-[8px] mb-[14px] font-['Syne'] font-bold text-[13px] text-[#e8f0fe] tracking-[0.3px]">
        <FaFire className="text-[#fb923c] text-[14px]" /> Trending
      </div>
      <div className="flex flex-wrap gap-[6px]">
        {topics.map((t) => (
          <span
            key={t}
            className="px-[10px] py-[4px] bg-[#404040] rounded-[8px] text-[12px] text-[#aaaaaa] font-['DM_Mono'] cursor-pointer transition-all duration-150"
            onMouseEnter={(e) => {
              e.target.style.borderColor = "#00e5ff33";
              e.target.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = "#2B2B2B";
              e.target.style.color = "#aaaaaa";
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Entrance animation keyframes, scoped to this page.
   Kept as a plain <style> tag instead of editing tailwind.config.js,
   so this drops in without touching your build config.
   Respects prefers-reduced-motion.
   ───────────────────────────────────────────────────────────────── */
function CommunityStyles() {
  return (
    <style>{`
      @keyframes capsulePop {
        0%   { opacity: 0; transform: scale(0.6) translateY(8px); }
        60%  { opacity: 1; transform: scale(1.05) translateY(0); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
      }
      @keyframes postRise {
        0%   { opacity: 0; transform: translateY(18px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .animate-capsule-pop { animation: capsulePop 420ms cubic-bezier(0.16, 1, 0.3, 1) both; }
      .animate-post-rise   { animation: postRise 480ms cubic-bezier(0.16, 1, 0.3, 1) both; }
 
      @media (prefers-reduced-motion: reduce) {
        .animate-capsule-pop, .animate-post-rise {
          animation: none !important;
          opacity: 1 !important;
          transform: none !important;
        }
      }
    `}</style>
  );
}

export default function CommunityPage() {
  const showModal = useSelector(state => state.feed.showModal);
  const selectedPost = useSelector(state => state.feed.selectedPost);
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
  const [showMobileComposer, setShowMobileComposer] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => { dispatch(fetchPosts(1)); }, [dispatch]);
  const [showCapsuleModal, setShowCapsuleModal] = useState(false);
  const [showAddCapsule, setShowAddCapsule] = useState(false);
  const [selectedCapsuleId, setSelectedCapsuleId] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  const showCapsule = (id) => {
    setSelectedCapsuleId(id);
    setShowCapsuleModal(true);
  };

  const addCapsule = () => {
    setShowAddCapsule(true);
  }

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

  const handlePostCreated = (newPost) => {
    dispatch(addPostToTop(newPost));
  };

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

  const handleCapsulePost = async (file, caption = '') => {
    if (!file) {
      dispatch(setError('Please select an image to post'));
      return;
    }

    dispatch(setError(''));

    try {
      const formData = new FormData();
      formData.append('media', file);
      if (caption) formData.append('caption', caption);
      const res = await axios.post(`${apiUrl}/api/capsule/capsulepost`, formData, {
        withCredentials: true,
        headers: { ...getAuthHeaders() },
      });

      // clear local selection and preview
      setSelectedImageFile(null);
      dispatch(setImagePreview(null));
      setShowAddCapsule(false);

      // TODO: refresh capsule feed or notify parent via a prop callback
      return res.data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'capsule posting error';
      dispatch(setError(msg));
      console.error('capsule posting error', error);
      throw error;
    }
  };


  return (
    <>
      <CommunityStyles />

      <div
        className="grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] items-start bg-black gap-6 max-w-full mx-auto px-4 sm:px-5 pt-6 sm:pt-7 pb-16"
        style={{ position: 'relative', zIndex: 1 }}
      >

        {/* ── Left: reserved space for your existing sidebar ──────────
            This div is the fix. It's empty and invisible on purpose —
            your real Sidebar component renders elsewhere in the layout
            (untouched, as asked). This just holds the 260px grid track
            open so the feed and right rail land in the correct columns
            instead of grid auto-placement pushing everything left. ── */}
        <div className="hidden lg:block" aria-hidden="true" />

        {/* ── Middle: capsules + feed ──────────────────────────────── */}
        <div className="mx-auto w-full max-w-3xl px-2 sm:px-0">

          {/* Capsules — now correctly spans the feed column, matching Figma,
              instead of landing in the sidebar's reserved space. */}
          <Capsules
            onOpenCapsule={showCapsule}
            onAddCapsule={addCapsule}
          />

          {showCapsuleModal && (
            <CapsuleModal capsuleId={selectedCapsuleId} onClose={() => setShowCapsuleModal(false)} />
          )}

          {showAddCapsule && (
            <CapsulePostModal
              isOpen={showAddCapsule}
              story={{
                author: currentUser?.username || 'you',
                timestamp: 'just now',
                avatar: currentUser?.profilePic || '',
                caption: '',
              }}
              onClose={() => setShowAddCapsule(false)}
              onAddCapsule={handleCapsulePost}
            />
          )}

          {/* Divider */}
          <div className="flex items-center gap-[12px] mb-[16px]">
            <div className="flex-1 h-[1px] bg-[#6b6b6b]" />
            <span className="text-[11px] text-[#8b8b8b] font-['DM_Mono'] tracking-[1px]">
              FOR YOU
            </span>
            <div className="flex-1 h-[1px] bg-[#6b6b6b]" />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-[#f8717118] border border-[#f8717144] rounded-[12px] px-[16px] py-[12px] mb-[16px] text-[#f87171] text-[13px]">
              {error}
            </div>
          )}

          {/* Feed */}
          <div className="flex flex-col gap-[10px]">
            {posts.length === 0 && !isLoading ? (
              <div className="bg-white/[0.03] border border-white/10 rounded-[20px] px-[24px] py-[48px] text-center">
                <div className="text-[40px] mb-[12px]">👩‍💻</div>
                <p className="text-zinc-400 text-[14px]">
                  No posts yet — be the first to share!
                </p>
              </div>
            ) : (
              posts.map((post, i) => (
                <div
                  key={post.id}
                  className="animate-post-rise"
                  style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                >
                  <PostCard
                    post={post}
                    currentUserId={currentUserId}
                    onLike={handleLike}
                    onComment={handleComment}
                    onDelete={handleDelete}
                    index={i}
                  />
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex flex-col items-center py-8">
                <div className="h-9 w-9 rounded-full border-2 border-[#00e5ff] border-t-transparent animate-spin mb-3" />
                <p className="text-zinc-500 text-[13px]">Loading...</p>
              </div>
            )}

            {hasMore && !isLoading && <div ref={loadingRef} style={{ height: 20 }} />}
          </div>
        </div>

        {/* ── Right: sidebar ────────────────────────────────────────
            Changed from `fixed top-25 right-20 max-w-80` (which pulled
            this out of grid flow entirely and caused the overlap you
            saw) to `sticky`, which keeps it correctly inside its grid
            column at every viewport width. ─────────────────────── */}
        <div className="hidden lg:block sticky top-6 w-full">
          {/* Mini stats */}
          <div className="bg-[#111111] border border-white/[0.06] rounded-[16px] px-[18px] py-[16px] mb-[12px]">
            <div className="font-['Syne'] font-bold text-[13px] text-[#e8f0fe] mb-[14px] tracking-[0.3px]">
              📡 Community
            </div>
            <div className="flex flex-col gap-[10px]">
              {[
                { label: 'Posts today', val: posts.length, icon: '📝' },
                { label: 'Active devs', val: '—', icon: '👥' },
                { label: 'Your posts', val: posts.filter(p => p.author.id === currentUserId).length, icon: '✍️' },
              ].map(row => (
                <div
                  key={row.label}
                  className="flex justify-between items-center px-[12px] py-[8px] bg-white/[0.04] rounded-[10px] transition-colors hover:bg-white/[0.07]"
                >
                  <span className="text-[12px] text-[#aaaaaa]">
                    {row.icon} {row.label}
                  </span>
                  <span className="text-[14px] font-bold font-['DM_Mono'] text-[#e8f0fe]">
                    {row.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <TrendingTopics />

          {/* Community rules */}
          <div className="bg-[#111111] border border-white/[0.06] rounded-[16px] px-[18px] py-[16px]">
            <div className="font-['Syne'] font-bold text-[13px] text-[#e8f0fe] mb-[12px] tracking-[0.3px] flex items-center">
              <FaCode className="text-[#aaaaaa] text-[13px] mr-[7px]" />
              Dev Code
            </div>
            {[
              "Share what you're building",
              "Help each other debug",
              "Celebrate small wins",
              "Keep it constructive",
            ].map((rule, i) => (
              <div
                key={i}
                className="flex gap-[8px] items-start mb-[8px] text-[12px] text-[#aaaaaa] leading-[1.5]"
              >
                <span className="text-[#aaaaaa] font-['DM_Mono'] mt-[1px]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {rule}
              </div>
            ))}
          </div>
        </div>

        {/* ── Mobile-only: floating + button to open composer ──────── */}
        <button
          onClick={() => setShowMobileComposer(true)}
          className="lg:hidden fixed bottom-6 right-5 w-14 h-14 rounded-full bg-[#00e5ff] text-black text-[28px] font-bold flex items-center justify-center shadow-[0_0_24px_rgba(0,229,255,0.35)] z-50 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-cyan-300"
          aria-label="New post"
        >
          +
        </button>

        {/* ── Mobile-only: composer modal, opened by the + button ───── */}
        {showMobileComposer && (
          <div className="lg:hidden fixed inset-0 bg-black/70 z-[60] flex items-end sm:items-center justify-center">
            <div className="w-full sm:max-w-md bg-[#0a0f1a] rounded-t-[20px] sm:rounded-[20px] p-4 relative">
              <button
                onClick={() => setShowMobileComposer(false)}
                className="absolute top-3 right-4 text-[#aaaaaa] text-[20px]"
                aria-label="Close"
              >
                ✕
              </button>
              <PostComposer
                onPostCreated={(post) => {
                  handlePostCreated(post);
                  setShowMobileComposer(false);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}