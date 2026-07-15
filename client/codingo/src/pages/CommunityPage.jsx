import { useEffect, useRef, useState } from 'react';
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
  FaCode,
  FaClock,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  setContent,
  setError,
  setFocused,
  setImagePreview,
  setIsPosting,
} from '../redux/slices/postSlice';
import {
  setHeartAnim,
  setLikeCount,
  setLiked,
  setPage,
  setPosts,
  setSelectedPost,
  setShowModal,
  addPostToTop,
} from '../redux/slices/feedSlice';
import {
  fetchPosts,
  getAuthHeaders,
  handleLike,
  getStoredUser,
  formatTimeAgo,
} from '../utilites/communityHelper';
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

function PostComposer({
  onPostCreated,
  composerFile,
  setComposerFile,
  composerPreview,
  setComposerPreview,
}) {
  const fileInputRef = useRef(null);
  const inputIdRef = useRef(`post-image-input-${Math.random().toString(36).slice(2)}`);
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const currentUser = getStoredUser();
  const dispatch = useDispatch();

  const content = useSelector((state) => state.post.content);
  const focused = useSelector((state) => state.post.focused);
  const isPosting = useSelector((state) => state.post.isPosting);
  const error = useSelector((state) => state.post.error);

  const handleImageSelect = (e) => {
    const file = e.target?.files?.[0] || null;
    console.log('[DBG] handleImageSelect fired');
    console.log('[DBG] input files length:', e.target?.files?.length);
    console.log('[DBG] input file[0]:', file);

    if (!file) {
      setComposerFile(null);
      setComposerPreview(null);
      dispatch(setImagePreview(null));
      dispatch(setError('No file selected'));
      return;
    }

    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg',
      'image/heic',
      'image/heif',
    ];

    if (!allowed.includes(file.type)) {
      dispatch(setError(`Unsupported type: ${file.type || 'unknown'}`));
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      dispatch(setError('Image must be < 8MB'));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setComposerFile(file);
    setComposerPreview(objectUrl);
    dispatch(setImagePreview(objectUrl));
    dispatch(setError(''));

    console.log('[DBG] assigned composerFile:', file);
  };

  const removeImage = () => {
    setComposerFile(null);
    if (composerPreview) URL.revokeObjectURL(composerPreview);
    setComposerPreview(null);
    dispatch(setImagePreview(null));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePost = async () => {
    if (!content.trim()) return dispatch(setError('Write something first'));
    if (content.length > 2000) return dispatch(setError('Exceeds 2000 chars'));

    dispatch(setIsPosting(true));
    dispatch(setError(''));

    try {
      console.log('[DBG] handlePost fired');
      console.log('[DBG] composerFile:', composerFile);
      console.log('[DBG] input file:', fileInputRef.current?.files?.[0]);

      const formData = new FormData();
      formData.append('content', content.trim());

      const fileToSend = composerFile || fileInputRef.current?.files?.[0] || null;
      if (fileToSend) {
        formData.append('image', fileToSend, fileToSend.name || 'upload.jpg');
      }

      for (const [k, v] of formData.entries()) {
        console.log(
          '[DBG] formData entry:',
          k,
          v instanceof File ? `${v.name} ${v.type} ${v.size}` : v
        );
      }

      const res = await axios.post(`${apiUrl}/api/community/posts`, formData, {
        withCredentials: true,
        headers: { ...getAuthHeaders() },
      });

      dispatch(setContent(''));
      dispatch(setFocused(false));
      if (composerPreview) URL.revokeObjectURL(composerPreview);
      setComposerFile(null);
      setComposerPreview(null);
      dispatch(setImagePreview(null));
      if (fileInputRef.current) fileInputRef.current.value = '';

      if (onPostCreated) onPostCreated(res.data.post);
    } catch (err) {
      dispatch(setError(err?.response?.data?.message || 'Post failed'));
    } finally {
      dispatch(setIsPosting(false));
    }
  };

  return (
    <div
      className={`bg-[#2B2B2B] rounded-[20px] px-[20px] pt-[20px] pb-[16px] mb-[8px] transition-colors duration-200 ease-in-out ${
        focused ? 'border border-[#aaaaaa]' : 'border border-[#2B2B2B]'
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

          {composerPreview && (
            <div className="relative inline-block mb-3">
              <img
                src={composerPreview}
                alt="Preview"
                className="max-w-full max-h-[240px] rounded-xl border border-[#1a2535] block"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center"
              >
                <FaTimes />
              </button>
            </div>
          )}

          {error && <p className="text-[#f87171] text-xs mb-2">{error}</p>}

          <div className="flex items-center justify-between pt-3 border-t border-[#1a2535]">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id={inputIdRef.current}
              />
              <label
                htmlFor={inputIdRef.current}
                className="flex items-center gap-[6px] px-[14px] py-[7px] bg-[#404040] rounded-[10px] cursor-pointer text-[#aaaaaa] text-[13px] font-semibold font-['Plus_Jakarta_Sans'] transition-all duration-150 hover:text-white"
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
              className={`flex items-center gap-[7px] px-[20px] py-[8px] border-none rounded-[10px] font-['Syne'] font-extrabold text-[13px] tracking-[0.3px] transition-all duration-200 ease-in-out ${
                content.trim()
                  ? 'bg-gradient-to-br from-[#00b4cc] to-[#00e5ff] text-black cursor-pointer shadow-[0_4px_16px_#00e5ff33]'
                  : 'bg-[#404040] text-[#aaaaaa] cursor-not-allowed'
              }`}
            >
              {isPosting ? 'Posting' : <><FaPaperPlane style={{ fontSize: 12 }} /> Post</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, currentUserId, onLike, onDelete }) {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const dispatch = useDispatch();

  const liked = useSelector((state) => state.feed.liked[post.id] ?? post.isLikedByCurrentUser ?? false);
  const likeCount = useSelector((state) => state.feed.likeCounts[post.id] ?? post.likesCount ?? 0);
  const heartAnim = useSelector((state) => state.feed.heartAnim[post.id] ?? false);
  const showComments = useSelector((state) => state.feed.showComments?.[post.id] ?? false);

  function getDisplayImageUrl(imageUrl) {
    if (!imageUrl) return '';
    const match = imageUrl.match(/[?&]id=([^&]+)/);
    if (match && imageUrl.includes('uc?id=')) {
      const fileId = match[1];
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }
    return imageUrl;
  }

  const imageUrl = post.image?.startsWith('/') ? `${apiUrl}${post.image}` : getDisplayImageUrl(post.image);

  const handleLikeClick = () => {
    dispatch(setLiked({ postId: post.id, value: !liked }));
    dispatch(setLikeCount({ postId: post.id, value: liked ? likeCount - 1 : likeCount + 1 }));
    if (!liked) {
      dispatch(setHeartAnim({ postId: post.id, value: true }));
      setTimeout(() => dispatch(setHeartAnim({ postId: post.id, value: false })), 600);
    }
    onLike(post.id);
  };

  const handleCommentModal = () => {
    dispatch(setSelectedPost(post));
    dispatch(setShowModal(true));
  };

  const isOwn = post.author.id === currentUserId;

  return (
    <>
    <ParticleCanvas />
      <article
        className="bg-[#2B2B2B] z-10 rounded-[20px] overflow-hidden transition-colors duration-200 ease-in-out"
      // onMouseEnter={e => e.currentTarget.style.borderColor = '#313131'}
      // onMouseLeave={e => e.currentTarget.style.borderColor = '#2B2B2B'}
      >
        {/* Card body */}
        <div className="px-[20px] pt-[20px]">
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
                <span className="font-['Syne'] font-bold text-[15px] text-[#e8f0fe]">{post.author.username}</span>
                <div className="flex items-center gap-[6px] mt-[2px]">
                  <span className="text-[#aaaaaa] text-[10px]"><FaClock /></span>
                  <span className="text-[12px] text-[#919191] font-['DM_Mono']">{formatTimeAgo(post.createdAt)}</span>
                </div>
              </div>
            </div>
            {isOwn && (
              <button type="button" onClick={() => onDelete(post.id)} className="text-[#aaaaaa] hover:text-[#f87171]">
                <FaTrash />
              </button>
            )}
          </div>
          <p className="text-[#c8d8ee] text-[15px] leading-[1.7] whitespace-pre-wrap break-words" style={{ marginBottom: post.image ? '16px' : 0 }}>
            {post.content}
          </p>
        </div>

        {post.image && (
          <div className="p-0 mt-[4px]">
            <img src={imageUrl} alt="Post" className="w-full max-h-[400px] object-cover border-t border-b border-[#1a2535] block" />
          </div>
        )}

        <div className="flex items-center gap-[4px] px-[16px] py-[10px]">
          <button type="button" onClick={handleLikeClick} className="flex items-center gap-[6px] px-[12px] py-[8px]" style={{ color: liked ? '#f87171' : '#aaaaaa', transform: heartAnim ? 'scale(1.25)' : 'scale(1)' }}>
            {liked ? <FaHeart /> : <FaRegHeart />} <span>{likeCount}</span>
          </button>
          <button type="button" onClick={handleCommentModal} className="flex items-center gap-[6px] px-[12px] py-[8px]" style={{ color: showComments ? '#00e5ff' : '#aaaaaa' }}>
            <FaComment /> <span>{post.commentsCount}</span>
          </button>
        </div>
      </article>
    </>
  );
}

function TrendingTopics() {
  const topics = ['#JavaScript', '#ReactJS', '#WebDev', '#CSS', '#NodeJS', '#TypeScript', '#OpenSource', '#API'];
  return (
    <div className="bg-[#2B2B2B] border border-[#1a2535] rounded-[16px] px-[18px] py-[16px] mb-[12px]">
      <div className="flex items-center gap-[8px] mb-[14px] font-['Syne'] font-bold text-[13px] text-[#e8f0fe] tracking-[0.3px]">
        <FaFire className="text-[#fb923c] text-[14px]" /> Trending
      </div>
      <div className="flex flex-wrap gap-[6px]">
        {topics.map((t) => (
          <span key={t} className="px-[10px] py-[4px] bg-[#404040] rounded-[8px] text-[12px] text-[#aaaaaa] font-['DM_Mono'] hover:text-white">
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
  const posts = useSelector((state) => state.feed.posts);
  const page = useSelector((state) => state.feed.page);
  const hasMore = useSelector((state) => state.feed.hasMore);
  const isLoading = useSelector((state) => state.feed.isLoading);
  const error = useSelector((state) => state.feed.error);

  const observerRef = useRef(null);
  const loadingRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const currentUser = getStoredUser();
  const currentUserId = currentUser?.id || currentUser?._id || '';
  const [showMobileComposer, setShowMobileComposer] = useState(false);

  // ✅ lifted file/preview state survives composer remount
  const [composerFile, setComposerFile] = useState(null);
  const [composerPreview, setComposerPreview] = useState(null);

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
    const observer = new IntersectionObserver((entries) => {
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
        withCredentials: true,
        headers: getAuthHeaders(),
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
        <div className="hidden lg:block z-10 relative">
          <div className="fixed top-180 min-w-110">
             <PostComposer
            onPostCreated={handlePostCreated}
            composerFile={composerFile}
            setComposerFile={setComposerFile}
            composerPreview={composerPreview}
            setComposerPreview={setComposerPreview}
          />
          </div>
        </div>

        {/* ── Middle: main feed ─────────────────────────────── */}
        <div className="mx-auto w-full max-w-3xl px-2 sm:px-0">
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

        {error && <div className="bg-[#f8717118] border border-[#f8717144] rounded-[12px] px-[16px] py-[12px] mb-[16px] text-[#f87171] text-[13px]">{error}</div>}

        <div className="flex flex-col gap-[10px]">
          {posts.length === 0 && !isLoading ? (
            <div className="bg-[#404040] border border-[#1a2535] rounded-[20px] px-[24px] py-[48px] text-center">
              <div className="text-[40px] mb-[12px]">👩‍💻</div>
              <p className="text-[#2e4460] text-[14px]">No posts yet — be the first to share!</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={currentUserId} onLike={handleLike} onDelete={handleDelete} />
            ))
          )}

          {isLoading && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: 36, height: 36, border: '3px solid #00e5ff', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.75s linear infinite' }} />
              <p style={{ color: '#2e4460', fontSize: 13 }}>Loading...</p>
            </div>
          )}

          {hasMore && !isLoading && <div ref={loadingRef} style={{ height: 20 }} />}
        </div>
      </div>

      <div className="hidden lg:block fixed top-25 right-20 max-w-80">
        <div className="bg-[#2B2B2B] rounded-[16px] px-[18px] py-[16px] mb-[12px]">
          <div className="font-['Syne'] font-bold text-[13px] text-[#e8f0fe] mb-[14px] tracking-[0.3px]">📡 Community</div>
          <div className="flex flex-col gap-[10px]">
            {[
              { label: 'Posts today', val: posts.length, icon: '📝' },
              { label: 'Active devs', val: '—', icon: '👥' },
              { label: 'Your posts', val: posts.filter((p) => p.author.id === currentUserId).length, icon: '✍️' },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center px-[12px] py-[8px] bg-[#404040] rounded-[10px]">
                <span className="text-[12px] text-[#aaaaaa]">{row.icon} {row.label}</span>
                <span className="text-[14px] font-bold font-['DM_Mono'] text-[#aaaaaa]">{row.val}</span>
              </div>
            ))}
          </div>
        </div>

        <TrendingTopics />

        <div className="bg-[#2B2B2B] rounded-[16px] px-[18px] py-[16px]">
          <div className="font-['Syne'] font-bold text-[13px] text-[#e8f0fe] mb-[12px] tracking-[0.3px] flex items-center">
            <FaCode className="text-[#aaaaaa] text-[13px] mr-[7px]" />
            Dev Code
          </div>
          {["Share what you're building", 'Help each other debug', 'Celebrate small wins', 'Keep it constructive'].map((rule, i) => (
            <div key={i} className="flex gap-[8px] items-start mb-[8px] text-[12px] text-[#aaaaaa] leading-[1.5]">
              <span className="text-[#aaaaaa] font-['DM_Mono'] mt-[1px]">{String(i + 1).padStart(2, '0')}</span>
              {rule}
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => setShowMobileComposer(true)} className="lg:hidden fixed bottom-6 right-5 w-14 h-14 rounded-full bg-[#00e5ff] text-black text-[28px] font-bold flex items-center justify-center shadow-lg z-50 active:scale-95 transition-transform" aria-label="New post">
        +
      </button>

      <div className={`lg:hidden fixed inset-0 bg-black/70 z-[60] items-end sm:items-center justify-center ${showMobileComposer ? 'flex' : 'hidden'}`}>
        <div className="w-full sm:max-w-md bg-[#0a0f1a] rounded-t-[20px] sm:rounded-[20px] p-4 relative">
          <button onClick={() => setShowMobileComposer(false)} className="absolute top-3 right-4 text-[#aaaaaa] text-[20px]" aria-label="Close">
            ✕
          </button>
          <PostComposer
            onPostCreated={(post) => {
              handlePostCreated(post);
              setShowMobileComposer(false);
            }}
            composerFile={composerFile}
            setComposerFile={setComposerFile}
            composerPreview={composerPreview}
            setComposerPreview={setComposerPreview}
          />
        </div>
      </div>
    </div>
    </>
  );
}