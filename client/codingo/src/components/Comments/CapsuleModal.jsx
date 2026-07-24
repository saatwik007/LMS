import { useEffect, useRef } from 'react';
import {
  FiX,
  FiHeart,
  FiMessageCircle,
  FiSend,
  FiBookmark,
  FiChevronLeft,
  FiChevronRight,
  FiTrash2,
} from 'react-icons/fi';
import gsap from 'gsap';
import { apiUrl, getAuthHeaders, getStoredUser } from '../../utilites/communityHelper';
import axios from 'axios';
import { useState } from 'react';
import { setCommentText } from '../../redux/slices/feedSlice';
import CapsuleCommentModal from './CapsuleCommentModal';

export default function CapsuleModal({ isOpen, onClose, comments, story, onPrev, onNext, onDelete }) {
  const currentUser = getStoredUser();
  const currentUserId = currentUser?.id || currentUser?._id || '';
  const cardRef = useRef(null);
  const glowRef = useRef(null);
  const backdropRef = useRef(null);
  const storedUser = getStoredUser();
  const [capsuleCommenting, setCapsuleCommenting] = useState(false);
  const [capsuleCommentText, setCapsuleCommentText] = useState('');
  console.log('story', story)
  console.log('story comments', story?.comments)

  // preserving capsule
  const preserveCapsule = async () => {
    try {
      await axios.post(`${apiUrl}/api/capsule/${story._id}/preserve`, {}, {
        withCredentials: true, headers: getAuthHeaders()
      });
    } catch (error) {
      console.error('preserve capsule failed', error)
    }
  }
  const [isLiked, setIsLiked] = useState(
    story?.likedBy?.includes(currentUserId) ?? false   // ✅ optional chaining on story too
  );
  const [likesCount, setLikesCount] = useState(story?.likedBy?.length ?? 0);
  console.log('length', story?.likedBy?.length)

  // capsule like
  const toggleCapsuleLike = async () => {
    try {
      const res = await axios.post(
        `${apiUrl}/api/capsule/${story._id}/like`,
        {},
        { withCredentials: true, headers: getAuthHeaders() }
      );
      setIsLiked(res?.data?.isLiked);
      setLikesCount(res?.data?.likesCount);
      // console.log('likecount', res?.data?.likesCount)

      // console.log('isLiked', res?.data?.isLiked)
    } catch (error) {
      console.error('capsule like failed', error);
    }
  };

  useEffect(() => {
    if (!story) return;
    setIsLiked(story.likedBy?.includes(currentUserId) ?? false);
    setLikesCount(story.likedBy?.length ?? 0);
  }, [story?._id, currentUserId]);

const toggleCapsuleComment = async (voiceNoteFile) => {
  try {
    let body, headers;

    if (voiceNoteFile) {
      const formData = new FormData();
      formData.append('content', capsuleCommentText || '');
      formData.append('voiceNote', voiceNoteFile);
      body = formData;
      headers = { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' };
    } else {
      body = { content: capsuleCommentText };
      headers = getAuthHeaders();
    }

    const res = await axios.post(
      `${apiUrl}/api/capsule/${story._id}/capsulecomment`,
      { content: capsuleCommentText.trim() },
      { withCredentials: true, headers: getAuthHeaders() }
    );
    console.log('url',  `${apiUrl}/api/capsule/${story._id}/capsulecomment`)
    console.log('text', capsuleCommentText)

    return res.data.comment; // use this to append to local state
  } catch (error) {
    console.error('capsule comment posting error', error);
  }
};

  // Capsule Comment Open
  const capsuleCommetingOpen = () => {
    setCapsuleCommenting(true);
  }

  // Escape to close + body scroll lock while open
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowLeft') onPrev?.();
      if (e.key === 'ArrowRight') onNext?.();
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose, onPrev, onNext]);

  // GSAP entrance
  useEffect(() => {
    if (!isOpen || !cardRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: 'power2.out' }
      );
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.86, y: 14 },
        { opacity: 1, scale: 1, y: 0, duration: 0.1, ease: 'expo.out' }
      );
      gsap.fromTo(
        glowRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.7, delay: 0.05, ease: 'power2.out' }
      );
    });
    return () => ctx.revert();
  }, [isOpen]);

  if (!isOpen || !story) return null;
  const isOwner = String(story.user?._id) === String(storedUser?.id);
  const isFading = story.opacity < 1;

  return (
    <div
      ref={backdropRef}
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${story.user?.username}'s story`}
    >

      {/* Card + glow, stopPropagation so clicking inside doesn't close */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[min(380px,90vw)] h-[min(680px,88vh)]"
      >
        {/* Soft ambient halo behind the card — this is the "glow border" */}
        <div
          ref={glowRef}
          className="pointer-events-none absolute -inset-3 rounded-full blur-2xl opacity-0"
          style={{
            background:
              'radial-gradient(closest-side, rgba(140,190,255,0.45), rgba(80,140,255,0.18) 55%, transparent 75%)',
            }}
        />
            <button
              onClick={onClose}
              className="absolute top-6 right-8 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-black/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
              aria-label="Close"
            >
              <FiX size={16} />
            </button>

        {/* The capsule itself */}
        <div
          ref={cardRef}
          className="relative h-full w-full rounded-full overflow-hidden bg-[#0d0d0d] flex flex-col items-center"
          style={{
            boxShadow:
              '0 0 0 1px rgba(255,255,255,0.14), 0 0 50px 4px rgba(140,190,255,0.22), 0 20px 60px rgba(0,0,0,0.5)',
          }}
        >

          {/* Header — inset from the curve on purpose */}
          <div className="flex flex-col z-10 items-center mt-5 shrink-0">
            <div className="h-11 w-11 rounded-full overflow-hidden ring-2 ring-white/20 mb-2">
              {story.user?.profilePic ? (
                <img src={story.user.profilePic} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-[#2b2b2b] flex items-center justify-center text-[13px] text-zinc-200">
                  {story.user?.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <p className="text-[13px] text-zinc-200">
              {!isOwner ? (
                <span className="font-medium">@{story.user?.username || 'Unknown'}</span>
              ) : (
                <span className="font-medium">Your Capsule</span>
              )}
              <span className="text-zinc-500"> · {story.timestamp}</span>
            </p>
          </div>

          {/* Media — flexes to fill remaining space so the oval holds
                its shape regardless of caption length */}
          <div className="relative flex-1 min-h-0 w-full px-7 mt-4 overflow-hidden rounded-[28px]">
            {story?.mediaUrl ? (
              <img
                src={story.mediaUrl}
                alt={`${story.user?.username || 'Capsule'} image`}
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
                style={{ opacity: story.opacity ?? 1 }}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.opacity = '0';
                }}
              />
            ) : (
              <div className="absolute inset-0 bg-zinc-950" />
            )}

            {/* <div className="pointer-events-none absolute inset-0 bg-black/20" /> */}
          </div>
          <div className='text-white text-xl'>
            {story?.caption}
          </div>

          {/* Actions */}

          <div className="shrink-0 flex items-center z-10 gap-6 pt-4 pb-9">
            {!isOwner && (
              <>
                <button
                  onClick={toggleCapsuleLike}
                  className="flex items-center gap-1.5 text-white/80 cursor-pointer hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 rounded-full"
                  aria-label="Like"
                >
                  <FiHeart size={19} className={isLiked ? 'fill-red-400 text-red-400' : ''} />
                  {likesCount > 0 && <span className="text-[12px]">{likesCount}</span>}
                </button>

                {/* capsule comments */}
                <button onClick={capsuleCommetingOpen} className="text-white/80 hover:text-white cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 flex flex-row gap-1 items-center justify-center focus-visible:ring-cyan-400/70 rounded-full" aria-label="Comment">
                  <span><FiMessageCircle size={19} /></span>
                  <span>{story?.comments?.length}</span>
                </button>
                {capsuleCommenting && (
                  // <div
                  //   // ref={replyWrapRef}
                  //   className="reply-wrap-focus flex gap-2 items-start mt-2.5 p-2.5 rounded-xl transition-colors"
                  //   style={{ border: "1px solid var(--border)", background: "var(--surface2)" }}
                  // >
                  //   {/* <Avatar initials="Y" size={28} self /> */}
                  //   <textarea
                  //     className="flex-1 bg-transparent border-none outline-none coder-text font-mono-coder resize-none"
                  //     style={{ fontSize: 12, lineHeight: 1.6, minHeight: 40 }}
                  //     placeholder="Write a reply..."
                  //     value={capsuleCommentText}
                  //     onChange={e => setCapsuleCommentText(e.target.value) }
                  //     autoFocus
                  //   />
                  //   <button
                  //     onClick={() => {
                  //       setCapsuleCommentText('');
                  //       toggleCapsuleComment();
                  //       setCapsuleCommenting(false);
                  //     }}
                  //     className="text-white rounded-lg px-3 py-1.5 font-mono-coder transition-opacity hover:opacity-85"
                  //     style={{ fontSize: 11, background: "var(--accent)", border: "none", cursor: "pointer" }}
                  //   >
                  //     ↩
                  //   </button>
                  // </div>
                  <CapsuleCommentModal ogcomments={story?.comments} />
                )}
              </>
            )}

            {/* Preseve button */}
            {!isOwner && isFading && (
              <button onClick={preserveCapsule} className="text-white/80 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 rounded-full" aria-label="Save">
                <FiBookmark size={19} />
              </button>)}

            <button className="text-white/80 hover:text-white cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 rounded-full" aria-label="Comment">
              <FiSend size={19} />
            </button>

            {typeof onDelete === 'function' && isOwner && (
              <button
                onClick={() => onDelete(story)}
                className="text-red-300 hover:text-red-200 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70 rounded-full"
                aria-label="Delete capsule"
                title="Delete capsule"
              >
                <FiTrash2 size={19} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}