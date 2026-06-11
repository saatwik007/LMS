import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { Badge, VoiceNote } from "../../pages/commentsModal";
import { ReplyCard } from "./ReplyCard";

const SELF_GRADIENT = "linear-gradient(135deg,#7c6aff,#22d3a0)";

/* ─── Sample data ─── */
const INITIAL_COMMENTS = [
  {
    id: "c1",
    name: "Aryan Mehta",
    initials: "AR",
    avatarIdx: 0,
    badge: { label: "MOD", type: "mod" },
    date: "May 3, 2025 · 11:24 AM",
    body: `Just dropped a new async handler using <code class="inline-code">Promise.allSettled()</code> — it's honestly a game changer for batch API calls where you don't want one failure to block the rest. Highly recommend refactoring anything that uses <code class="inline-code">Promise.all()</code> for non-critical parallel tasks. 🔥`,
    likes: 24,
    liked: false,
    replies: [
      {
        id: "r1a",
        name: "Kriti Sharma",
        initials: "KS",
        avatarIdx: 4,
        date: "May 3, 2025 · 11:51 AM",
        body: `Yes!! Switched to this last week. Also pairs perfectly with <code class="inline-code">AbortController</code> for timeout control 🧠`,
        likes: 8,
        liked: false,
      },
      {
        id: "r1b",
        name: "Pranav V.",
        initials: "PV",
        avatarIdx: 2,
        date: "May 3, 2025 · 1:10 PM",
        body: "Added this pattern to our internal toolkit doc. Thanks for the tip 🛠",
        likes: 4,
        liked: false,
      },
    ],
  },
  {
    id: "c2",
    name: "Sneha Singh",
    initials: "SS",
    avatarIdx: 1,
    badge: { label: "PRO", type: "pro" },
    date: "May 3, 2025 · 2:05 PM",
    body: `Hot take: Most devs are sleeping on CSS <code class="inline-code">container queries</code>. Media queries are tied to the viewport — container queries respond to the parent element's size. Your components finally become truly reusable without layout hacks. CSS is genuinely incredible in 2025 😤`,
    likes: 41,
    liked: false,
    replies: [
      {
        id: "r2a",
        name: "Raghav D.",
        initials: "RD",
        avatarIdx: 3,
        date: "May 3, 2025 · 3:45 PM",
        body: "Already using it in production. The component portability improvement is real. No more breakpoint spaghetti 🎉",
        likes: 11,
        liked: false,
      },
    ],
  },
  {
    id: "c3",
    name: "Nikhil Patel",
    initials: "NP",
    avatarIdx: 2,
    badge: null,
    date: "May 3, 2025 · 4:30 PM",
    voiceNote: { duration: "0:47" },
    body: `Recorded my thought on why <code class="inline-code">Zustand</code> beats Redux for small-mid scale React apps. Less boilerplate, no provider wrapping, selector-based subscriptions just work. Full breakdown above 👆`,
    likes: 18,
    liked: false,
    replies: [],
  },
  {
    id: "c4",
    name: "Riya Desai",
    initials: "RD",
    avatarIdx: 3,
    badge: null,
    date: "May 4, 2025 · 9:12 AM",
    image: "https://opengraph.githubassets.com/1/vercel/next.js",
    body: "Next.js 15.3 just dropped and the Turbopack build speed improvements are insane 🚀 Our CI pipeline went from 4m 20s to under 90 seconds. Anyone else migrated yet?",
    likes: 37,
    liked: false,
    replies: [],
  },
  {
    id: "c5",
    name: "Karan Shah",
    initials: "KS",
    avatarIdx: 4,
    badge: null,
    date: "May 4, 2025 · 10:48 AM",
    body: `Question for the thread — does anyone have a solid pattern for handling optimistic UI updates with rollback on error? Using React Query but the mutation rollback feels clunky when you have nested dependent queries. 🤔`,
    likes: 9,
    liked: false,
    replies: [],
  },
  {
    id: "c6",
    name: "Meera Agarwal",
    initials: "MA",
    avatarIdx: 5,
    badge: { label: "PRO", type: "pro" },
    date: "May 4, 2025 · 12:30 PM",
    body: `PSA: Stop using <code class="inline-code">any</code> in TypeScript. Even if you're in a rush, use <code class="inline-code">unknown</code> and narrow it down. It takes 2 minutes and saves hours of runtime debugging. Your future self and your teammates will thank you 💯`,
    likes: 53,
    liked: false,
    replies: [],
  },
  {
    id: "c7",
    name: "Vikram Rao",
    initials: "VR",
    avatarIdx: 0,
    badge: null,
    date: "May 4, 2025 · 2:00 PM",
    body: `Reminder that <code class="inline-code">git bisect</code> exists and it's magic 🪄 Binary search through your commit history to find exactly which commit introduced a bug. Saved me 3 hours today tracking down a regression.`,
    likes: 29,
    liked: false,
    replies: [],
  },
];

/* ─── Comment Card ─── */
export const CommentCard = ({ comment, onLike, onReplyLike, onAddReply }) => {
  const [repliesOpen, setRepliesOpen] = useState(comment.replies.length > 0);
  const [replyInputOpen, setReplyInputOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const cardRef = useRef(null);
  const repliesRef = useRef(null);
  const replyWrapRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    }
  }, []);

  function handleToggleReply() {
    const opening = !replyInputOpen;
    setReplyInputOpen(opening);
    if (opening) setRepliesOpen(true);
  }

  function handlePostReply() {
    if (!replyText.trim()) return;
    onAddReply(comment.id, replyText.trim());
    setReplyText("");
    setReplyInputOpen(false);
  }

  return (
    <div
      ref={cardRef}
      className="comment-card-hover rounded-2xl p-4 transition-colors"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      {/* Head */}
      <div className="flex items-center gap-2.5 mb-2.5">
        {/* <Avatar initials={comment.initials} gradientIdx={comment.avatarIdx} size={36} /> */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-sans-coder font-bold coder-text" style={{ fontSize: 13 }}>{comment.name}</span>
            <Badge badge={comment.badge} />
          </div>
          <div className="coder-text3 font-mono-coder" style={{ fontSize: 10, marginTop: 1 }}>{comment.date}</div>
        </div>
      </div>

      {/* Voice Note */}
      {comment.voiceNote && <VoiceNote duration={comment.voiceNote.duration} />}

      {/* Image */}
      {comment.image && (
        <div className="mb-3 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)", maxWidth: 320 }}>
          <img src={comment.image} alt="attachment" className="w-full block" onError={e => e.target.parentElement.style.display = "none"} />
        </div>
      )}

      {/* Body */}
      <div
        className="font-mono-coder coder-text mb-3"
        style={{ fontSize: 13, lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{ __html: comment.body }}
      />

      {/* Footer */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onLike(comment.id)}
          className={`like-btn flex items-center gap-1 rounded-lg px-2.5 py-1 font-mono-coder transition-all border border-transparent coder-text3 ${comment.liked ? "liked" : ""}`}
          style={{ fontSize: 11, cursor: "pointer", background: "none" }}
        >
          <span>♥</span>
          <span>{comment.likes}</span>
        </button>

        <button
          onClick={handleToggleReply}
          className="reply-toggle-btn flex items-center gap-1 rounded-lg px-2.5 py-1 font-mono-coder transition-all border border-transparent coder-text3"
          style={{ fontSize: 11, cursor: "pointer", background: "none" }}
        >
          ↩ Reply
        </button>

        {comment.replies.length > 0 && (
          <button
            onClick={() => setRepliesOpen(o => !o)}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1 font-mono-coder transition-all border border-transparent coder-accent2 action-btn-hover"
            style={{ fontSize: 11, cursor: "pointer", background: "none", marginLeft: "auto" }}
          >
            {repliesOpen ? "▾" : "▸"} {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
          </button>
        )}
      </div>

      {/* Replies */}
      {repliesOpen && comment.replies.length > 0 && (
        <div
          ref={repliesRef}
          className="mt-3 pt-3 flex flex-col gap-2.5"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {comment.replies.map(r => (
            <ReplyCard key={r.id} reply={r} onLike={(rid) => onReplyLike(comment.id, rid)} />
          ))}
        </div>
      )}

      {/* Reply Input */}
      {replyInputOpen && (
        <div
          ref={replyWrapRef}
          className="reply-wrap-focus flex gap-2 items-start mt-2.5 p-2.5 rounded-xl transition-colors"
          style={{ border: "1px solid var(--border)", background: "var(--surface2)" }}
        >
          {/* <Avatar initials="Y" size={28} self /> */}
          <textarea
            className="flex-1 bg-transparent border-none outline-none coder-text font-mono-coder resize-none"
            style={{ fontSize: 12, lineHeight: 1.6, minHeight: 40 }}
            placeholder="Write a reply..."
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handlePostReply(); }}
            autoFocus
          />
          <button
            onClick={handlePostReply}
            className="text-white rounded-lg px-3 py-1.5 font-mono-coder transition-opacity hover:opacity-85"
            style={{ fontSize: 11, background: "var(--accent)", border: "none", cursor: "pointer" }}
          >
            ↩
          </button>
        </div>
      )}
    </div>
  );
}