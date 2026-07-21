import { useEffect, useRef, useState, useCallback } from 'react';
import { FiHeart, FiMessageCircle, FiSend, FiMoreHorizontal } from 'react-icons/fi';
import gsap from 'gsap';
// npm install gsap  — if it's not already in your project.

/* ─────────────────────────────────────────────────────────────────
   GlassFeed
   ─────────────────────────────────────────────────────────────────
   Vertical snap-scrolling "film reel" feed. Each post's card is
   sized to noticeably less than the viewport height (76vh), so the
   real edges of the previous and next cards are always visibly
   peeking above and below the focused one — not a subtle byproduct,
   an intentional ~11vh strip on each side.

   Cards are full-bleed photo (the image IS the card, edge to edge)
   with the header and caption/actions floating on frosted glass
   strips directly over the image — this is what guarantees the peek
   strips show actual photo content rather than empty card margin or
   header chrome.

   As you scroll, the card nearest viewport-center scales up and
   brightens; neighbors shrink and dim — driven by GSAP reading
   scroll position directly, not a separate racing animation.

   Nav bar intentionally omitted — this is just the feed: cards +
   like / comment / share.
   
   ───────────────────────────────────────────────────────────────── */

const SAMPLE_POSTS = [
  {
    id: 1,
    author: 'Liam_Styles',
    avatar: 'https://i.pravatar.cc/80?img=12',
    image: 'https://picsum.photos/id/1005/900/1400',
    caption: 'Sunny brunch with bestie ☀️ @sarah_j',
    likes: 2456,
    comments: 112,
    time: '1 hr ago',
  },
  {
    id: 2,
    author: 'mara.codes',
    avatar: 'https://i.pravatar.cc/80?img=32',
    image: 'https://picsum.photos/id/1011/900/1400',
    caption: 'Golden hour on the coast never misses.',
    likes: 1893,
    comments: 64,
    time: '3 hr ago',
  },
  {
    id: 3,
    author: 'devraj',
    avatar: 'https://i.pravatar.cc/80?img=51',
    image: 'https://picsum.photos/id/1015/900/1400',
    caption: 'Trail day. Legs are done, heart is full.',
    likes: 3120,
    comments: 208,
    time: '5 hr ago',
  },
  {
    id: 4,
    author: 'noor.k',
    avatar: 'https://i.pravatar.cc/80?img=45',
    image: 'https://picsum.photos/id/1025/900/1400',
    caption: 'This good boy owns the block now.',
    likes: 5410,
    comments: 340,
    time: '8 hr ago',
  },
  {
    id: 5,
    author: 'kentaro.v',
    avatar: 'https://i.pravatar.cc/80?img=15',
    image: 'https://picsum.photos/id/1035/900/1400',
    caption: 'Found this pocket of forest an hour out of the city.',
    likes: 972,
    comments: 41,
    time: '12 hr ago',
  },
];

// Cycled per card — colored glow instead of grey iOS blur.
const GLOWS = [
  'radial-gradient(closest-side, rgba(217,70,239,0.4), rgba(56,189,248,0.2) 60%, transparent 78%)',
  'radial-gradient(closest-side, rgba(251,146,60,0.4), rgba(244,63,94,0.18) 60%, transparent 78%)',
  'radial-gradient(closest-side, rgba(52,211,153,0.38), rgba(56,189,248,0.18) 60%, transparent 78%)',
  'radial-gradient(closest-side, rgba(129,140,248,0.4), rgba(217,70,239,0.18) 60%, transparent 78%)',
  'radial-gradient(closest-side, rgba(250,204,21,0.38), rgba(251,113,133,0.18) 60%, transparent 78%)',
];

function PostCard({ post, cardRef, glow, isLiked, onLike }) {
  const heartRef = useRef(null);

  const handleLike = () => {
    onLike(post.id);
    if (heartRef.current) {
      gsap.fromTo(
        heartRef.current,
        { scale: 1 },
        { scale: 1.35, duration: 0.16, ease: 'power2.out', yoyo: true, repeat: 1 }
      );
    }
  };

  return (
    <div
      ref={cardRef}
      className="relative h-[98%] w-full max-w-[380px] mx-auto rounded-[2.5rem] overflow-hidden"
      style={{ transformOrigin: 'center center' }}
    >
      {/* Colored ambient glow, unique per card, bleeds past the rounded edge */}
      <div
        className="pointer-events-none absolute -inset-6 -z-10 blur-2xl"
        style={{ background: glow }}
        aria-hidden="true"
      />

      {/* Full-bleed photo — this IS the card */}
      <div
        className="relative h-full w-full rounded-[2.5rem] overflow-hidden bg-[#111]"
        style={{ boxShadow: '0 25px 70px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.12)' }}
      >
        <img src={post.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />

        {/* Header — frosted strip floating on the photo */}
        <div className="absolute top-0 inset-x-0 z-10 flex items-center gap-3 px-5 pt-5 pb-8 backdrop-blur-sm bg-gradient-to-b from-black/50 via-black/15 to-transparent">
          <img src={post.avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-white/30" />
          <span className="flex-1 text-[14px] font-semibold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
            {post.author}
          </span>
          <button className="text-white/80 hover:text-white transition-colors" aria-label="More">
            <FiMoreHorizontal size={18} />
          </button>
        </div>

        {/* Caption + actions — frosted strip floating on the photo */}
        <div className="absolute bottom-0 inset-x-0 z-10 backdrop-blur-sm bg-gradient-to-t from-black/55 via-black/15 to-transparent px-5 pt-10 pb-5">
          <p className="text-[13px] leading-[1.5] text-white/95 [text-shadow:0_1px_2px_rgba(0,0,0,0.5)] line-clamp-2 mb-3">
            {post.caption}
          </p>
          <div className="flex items-center gap-5">
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-full"
              aria-label="Like"
            >
              <span ref={heartRef} className="inline-flex">
                <FiHeart size={18} fill={isLiked ? '#fb7185' : 'none'} color={isLiked ? '#fb7185' : 'currentColor'} />
              </span>
              <span className="text-[12.5px] font-['DM_Mono']">
                {(post.likes + (isLiked ? 1 : 0)).toLocaleString()}
              </span>
            </button>

            <button className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-full" aria-label="Comment">
              <FiMessageCircle size={18} />
              <span className="text-[12.5px] font-['DM_Mono']">{post.comments}</span>
            </button>

            <button className="text-white/90 hover:text-white transition-colors ml-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-full" aria-label="Share">
              <FiSend size={18} />
            </button>

            <span className="text-[11px] text-white/60">{post.time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GlassFeed({ posts = SAMPLE_POSTS }) {
  const scrollRef = useRef(null);
  const cardRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedIds, setLikedIds] = useState(() => new Set());

  // Crossfading ambient background — two stacked layers, whichever is
  // "front" fades in via opacity transition when the active post changes.
  const [bgA, setBgA] = useState(posts[0]?.image);
  const [bgB, setBgB] = useState(posts[0]?.image);
  const [frontIsA, setFrontIsA] = useState(true);

  useEffect(() => {
    const nextImage = posts[activeIndex]?.image;
    if (!nextImage) return;
    if (frontIsA) {
      setBgB(nextImage);
    } else {
      setBgA(nextImage);
    }
    setFrontIsA((f) => !f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  const toggleLike = useCallback((id) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // Scroll-linked scale/opacity — the card nearest viewport-center gets
  // full scale + opacity, everything else shrinks and dims. gsap.set
  // (no easing) so it's attached to scroll position, not chasing it.
  const updateFocus = useCallback(() => {
    const viewportCenter = window.innerHeight / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;

    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cardCenter = rect.top + rect.height / 2;
      const distance = Math.abs(cardCenter - viewportCenter);
      const proximity = 1 - Math.min(distance / window.innerHeight, 1);
      const scale = 0.82 + proximity * 0.18;
      const opacity = 0.32 + proximity * 0.68;
      gsap.set(el, { scale, opacity });

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    });

    setActiveIndex((prev) => (prev === closestIndex ? prev : closestIndex));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateFocus();
        ticking = false;
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    updateFocus(); // initial pass
    return () => el.removeEventListener('scroll', onScroll);
  }, [updateFocus]);

  // Entrance animation for the first card on mount
  useEffect(() => {
    const first = cardRefs.current[0];
    if (!first) return;
    gsap.fromTo(first, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' });
  }, []);

  // Optional: arrow-key paging, handy on desktop
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return;
      const dir = e.key === 'ArrowDown' ? 1 : -1;
      const target = Math.min(posts.length - 1, Math.max(0, activeIndex + dir));
      cardRefs.current[target]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, posts.length]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Ambient crossfading backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center scale-125 blur-3xl transition-opacity duration-700 ease-out"
          style={{ backgroundImage: `url('${bgA}')`, opacity: frontIsA ? 1 : 0 }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center scale-125 blur-3xl transition-opacity duration-700 ease-out"
          style={{ backgroundImage: `url('${bgB}')`, opacity: frontIsA ? 0 : 1 }}
        />
        <div className="absolute inset-0 bg-black/55" />
      </div>

      {/* Snap-scroll feed — 76vh slides (shorter than the 100vh viewport)
          is what creates the ~11vh peek of neighboring cards above/below */}
      <div
        ref={scrollRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {posts.map((post, i) => (
          <div key={post.id} className="h-[76vh] snap-center flex items-center justify-center">
            <PostCard
              post={post}
              cardRef={(el) => (cardRefs.current[i] = el)}
              glow={GLOWS[i % GLOWS.length]}
              isLiked={likedIds.has(post.id)}
              onLike={toggleLike}
            />
          </div>
        ))}
      </div>
    </div>
  );
}