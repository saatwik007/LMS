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

export default function CapsuleModal({ isOpen, onClose, derived, story, onPrev, onNext, onDelete }) {
  const cardRef = useRef(null);
  const glowRef = useRef(null);
  const backdropRef = useRef(null);
  console.log('capsule modal render', isOpen, story)

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
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'expo.out' }
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
  console.log('capsule url', story?.mediaUrl)

  return (
    <div
      ref={backdropRef}
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-10"
      role="dialog"
      aria-modal="true"
      aria-label={`${story.user?.username}'s story`}
    >
      {/* Prev / Next — only shown if handlers were passed in */}
      {onPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="hidden sm:flex absolute left-6 md:left-16 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
          aria-label="Previous story"
        >
          <FiChevronLeft size={20} />
        </button>
      )}
      {onNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="hidden sm:flex absolute right-6 md:right-16 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
          aria-label="Next story"
        >
          <FiChevronRight size={20} />
        </button>
      )}

      {/* Card + glow, stopPropagation so clicking inside doesn't close */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[min(400px,88vw)] h-[min(640px,82vh)]"
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

        {/* The capsule itself */}
        <div
          ref={cardRef}
          className="relative h-210 w-130 right-10 bottom-20 rounded-full overflow-hidden bg-[#0d0d0d] flex flex-col items-center"
          style={{
            boxShadow:
              '0 0 0 1px rgba(255,255,255,0.14), 0 0 50px 4px rgba(140,190,255,0.22), 0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-8 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-black/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
            aria-label="Close"
          >
            <FiX size={16} />
          </button>

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
                <span className="font-medium">@{story.user?.username || 'Unknown'}</span>
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

              <div className="pointer-events-none absolute inset-0 bg-black/20" />
            </div>

            {/* Actions */}
          <div className="shrink-0 flex items-center z-10 gap-6 pt-4 pb-9">
            <button className="text-white/80 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 rounded-full" aria-label="Like">
              <FiHeart size={19} />
            </button>
            <button className="text-white/80 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 rounded-full" aria-label="Comment">
              <FiMessageCircle size={19} />
            </button>
            <button className="text-white/80 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 rounded-full" aria-label="Save">
              <FiBookmark size={19} />
            </button>
            {typeof onDelete === 'function' && (
              <button
                onClick={() => onDelete(story)}
                className="text-red-300 hover:text-red-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70 rounded-full"
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