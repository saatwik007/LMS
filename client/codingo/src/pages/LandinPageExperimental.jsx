import { useState, useRef, useEffect, useCallback } from "react";
import { gsap } from "gsap";

/* ─── Google Fonts injected once ─── */
if (!document.getElementById("coder-fonts")) {
  const link = document.createElement("link");
  link.id = "coder-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Syne:wght@400;600;700;800&display=swap";
  document.head.appendChild(link);
}

/* ─── CSS Variables & base styles injected once ─── */
if (!document.getElementById("coder-styles")) {
  const style = document.createElement("style");
  style.id = "coder-styles";
  style.textContent = `
    :root {
      --bg: #0a0a0f;
      --surface: #111118;
      --surface2: #16161f;
      --surface3: #1c1c28;
      --border: #2a2a3a;
      --border2: #3a3a50;
      --accent: #7c6aff;
      --accent2: #a78bfa;
      --accent-glow: rgba(124,106,255,0.15);
      --green: #22d3a0;
      --red: #ff6b6b;
      --text: #e4e4f0;
      --text2: #9090a8;
      --text3: #5a5a70;
    }
    .font-mono-coder { font-family: 'JetBrains Mono', monospace; }
    .font-sans-coder { font-family: 'Syne', sans-serif; }
    .coder-bg {
      background-color: var(--bg);
      background-image:
        radial-gradient(ellipse 60% 40% at 80% 0%, rgba(124,106,255,0.07) 0%, transparent 60%),
        radial-gradient(ellipse 40% 30% at 10% 100%, rgba(34,211,160,0.05) 0%, transparent 50%);
    }
    .coder-surface { background-color: var(--surface); }
    .coder-surface2 { background-color: var(--surface2); }
    .coder-surface3 { background-color: var(--surface3); }
    .coder-border { border-color: var(--border); }
    .coder-border2 { border-color: var(--border2); }
    .coder-text { color: var(--text); }
    .coder-text2 { color: var(--text2); }
    .coder-text3 { color: var(--text3); }
    .coder-accent { color: var(--accent); }
    .coder-accent2 { color: var(--accent2); }
    .coder-green { color: var(--green); }
    .coder-red { color: var(--red); }
    .input-area-focus:focus-within {
      border-color: var(--accent) !important;
      box-shadow: 0 0 0 3px var(--accent-glow);
    }
    .reply-wrap-focus:focus-within {
      border-color: var(--accent) !important;
    }
    .like-btn.liked {
      color: var(--red);
      border-color: rgba(255,107,107,0.3);
      background: rgba(255,107,107,0.07);
    }
    .like-btn:not(.liked):hover {
      border-color: var(--border2);
      color: var(--text2);
      background: var(--surface3);
    }
    .reply-toggle-btn:hover {
      color: var(--accent2);
      border-color: rgba(124,106,255,0.3);
      background: var(--accent-glow);
    }
    .action-btn-hover:hover {
      border-color: var(--border2);
      color: var(--text2);
      background: var(--surface3);
    }
    .attach-btn-hover:hover {
      border-color: var(--accent);
      color: var(--accent2);
      background: var(--accent-glow);
    }
    .comment-card-hover:hover {
      border-color: var(--border2);
    }
    @keyframes recPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    .rec-pulse { animation: recPulse 1s infinite; }
    @keyframes heartBeat { 0%{transform:scale(1)} 50%{transform:scale(1.35)} 100%{transform:scale(1)} }
    .heart-beat { animation: heartBeat 0.3s ease; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
    code.inline-code {
      background: var(--surface3);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 1px 6px;
      font-size: 12px;
      color: var(--accent2);
      font-family: 'JetBrains Mono', monospace;
    }
  `;
  document.head.appendChild(style);
}

/* ─── Avatar gradient map ─── */
const AV_GRADIENTS = [
  "linear-gradient(135deg,#7c6aff,#a78bfa)",
  "linear-gradient(135deg,#22d3a0,#34d399)",
  "linear-gradient(135deg,#f59e0b,#f97316)",
  "linear-gradient(135deg,#ec4899,#f43f5e)",
  "linear-gradient(135deg,#3b82f6,#06b6d4)",
  "linear-gradient(135deg,#8b5cf6,#ec4899)",
];
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

const EMOJIS = ["😂", "🔥", "💀", "🚀", "👀", "✅", "❌", "💯", "🤔", "⚡", "🎉", "🛠", "👾", "🐛", "📦", "🧠"];

const VN_BARS = [8, 18, 12, 24, 10, 20, 14, 8, 22, 16, 10, 18];

function formatDate(d) {
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  );
}

/* ─── Avatar ─── */
function Avatar({ initials, gradientIdx, size = 36, self = false }) {
  const bg = self ? SELF_GRADIENT : AV_GRADIENTS[gradientIdx % AV_GRADIENTS.length];
  return (
    <div
      className="flex items-center justify-center font-sans-coder font-bold text-white flex-shrink-0 rounded-full"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

/* ─── Badge ─── */
function Badge({ badge }) {
  if (!badge) return null;
  const isMod = badge.type === "mod";
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-widest font-mono-coder"
      style={{
        fontSize: 9,
        background: isMod ? "rgba(124,106,255,0.15)" : "rgba(34,211,160,0.12)",
        color: isMod ? "var(--accent2)" : "var(--green)",
        border: `1px solid ${isMod ? "rgba(124,106,255,0.3)" : "rgba(34,211,160,0.25)"}`,
      }}
    >
      {badge.label}
    </span>
  );
}

/* ─── Voice Note Player ─── */
function VoiceNote({ duration }) {
  const [playing, setPlaying] = useState(false);
  function handlePlay() {
    setPlaying(true);
    setTimeout(() => setPlaying(false), 2000);
  }
  return (
    <div
      className="flex items-center gap-2 rounded-xl px-3 py-2 mb-3"
      style={{ background: "var(--surface3)", border: "1px solid var(--border)", maxWidth: 260 }}
    >
      <button
        onClick={handlePlay}
        className="flex items-center justify-center rounded-full text-white text-xs transition-opacity hover:opacity-85"
        style={{ width: 30, height: 30, background: "var(--accent)", border: "none", cursor: "pointer" }}
      >
        {playing ? "⏸" : "▶"}
      </button>
      <div className="flex items-center gap-0.5 flex-1">
        {VN_BARS.map((h, i) => (
          <div
            key={i}
            className="rounded"
            style={{ width: 3, height: h, background: "var(--accent2)", opacity: playing ? 1 : 0.5, transition: "opacity 0.3s" }}
          />
        ))}
      </div>
      <span className="font-mono-coder coder-text3" style={{ fontSize: 11 }}>{duration}</span>
    </div>
  );
}

/* ─── Reply Card ─── */
function ReplyCard({ reply, onLike }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" });
    }
  }, []);
  return (
    <div
      ref={ref}
      className="flex gap-2 rounded-xl px-3 py-2"
      style={{ background: "var(--surface2)", borderLeft: "2px solid var(--border2)" }}
    >
      <Avatar initials={reply.initials} gradientIdx={reply.avatarIdx} size={28} />
      <div className="flex-1">
        <div className="font-sans-coder font-bold coder-text" style={{ fontSize: 12 }}>{reply.name}</div>
        <div className="coder-text3 font-mono-coder" style={{ fontSize: 10, marginTop: 1 }}>{reply.date}</div>
        <div
          className="coder-text2 font-mono-coder mt-1"
          style={{ fontSize: 12, lineHeight: 1.6 }}
          dangerouslySetInnerHTML={{ __html: reply.body }}
        />
        <div className="flex items-center gap-1 mt-1.5">
          <button
            onClick={() => onLike(reply.id)}
            className={`like-btn flex items-center gap-1 rounded-lg px-2 py-1 font-mono-coder transition-all border border-transparent coder-text3`}
            style={{ fontSize: 11, cursor: "pointer", background: "none" }}
          >
            <span>♥</span>
            <span>{reply.likes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Comment Card ─── */
function CommentCard({ comment, onLike, onReplyLike, onAddReply }) {
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
        <Avatar initials={comment.initials} gradientIdx={comment.avatarIdx} size={36} />
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
          <Avatar initials="Y" size={28} self />
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

/* ─── Main Component ─── */
 function Comments() {
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [mainText, setMainText] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const [hasVoice, setHasVoice] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);

  const mainInputRef = useRef(null);
  const recIntervalRef = useRef(null);
  const headerRef = useRef(null);
  const inputAreaRef = useRef(null);
  const threadRef = useRef(null);
  const emojiPanelRef = useRef(null);

  /* Page-load GSAP stagger */
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5 })
      .fromTo(inputAreaRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2")
      .fromTo(
        threadRef.current?.children ? Array.from(threadRef.current.children) : [],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.08 },
        "-=0.1"
      );
  }, []);

  /* Close emoji on outside click */
  useEffect(() => {
    function handler(e) {
      if (emojiPanelRef.current && !emojiPanelRef.current.contains(e.target)) setEmojiOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ─── Recording ─── */
  function startRecording() {
    setIsRecording(true);
    setRecSeconds(0);
    recIntervalRef.current = setInterval(() => setRecSeconds(s => s + 1), 1000);
  }
  function stopRecording() {
    setIsRecording(false);
    clearInterval(recIntervalRef.current);
    setHasVoice(true);
    setVoiceDuration(recSeconds);
  }
  function toggleRecording() {
    if (isRecording) stopRecording(); else startRecording();
  }
  function removeVoice() {
    setHasVoice(false);
    setVoiceDuration(0);
  }
  const fmtTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  /* ─── File upload ─── */
  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPendingFiles(p => [...p, { file, url: URL.createObjectURL(file) }]);
    e.target.value = "";
  }
  function removeFile(name) {
    setPendingFiles(p => p.filter(f => f.file.name !== name));
  }

  /* ─── Emoji ─── */
  function insertEmoji(em) {
    const inp = mainInputRef.current;
    const pos = inp.selectionStart;
    const next = mainText.slice(0, pos) + em + mainText.slice(pos);
    setMainText(next);
    setEmojiOpen(false);
    setTimeout(() => {
      inp.focus();
      inp.setSelectionRange(pos + em.length, pos + em.length);
    }, 0);
  }

  /* ─── Like ─── */
  function handleLike(cid) {
    setComments(cs =>
      cs.map(c =>
        c.id === cid
          ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
          : c
      )
    );
  }
  function handleReplyLike(cid, rid) {
    setComments(cs =>
      cs.map(c =>
        c.id === cid
          ? {
            ...c,
            replies: c.replies.map(r =>
              r.id === rid ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r
            ),
          }
          : c
      )
    );
  }

  /* ─── Add Reply ─── */
  function handleAddReply(cid, text) {
    const newReply = {
      id: `r_${Date.now()}`,
      name: "You",
      initials: "Y",
      avatarIdx: Math.floor(Math.random() * AV_GRADIENTS.length),
      date: formatDate(new Date()),
      body: text,
      likes: 0,
      liked: false,
      self: true,
    };
    setComments(cs =>
      cs.map(c => c.id === cid ? { ...c, replies: [...c.replies, newReply] } : c)
    );
  }

  /* ─── Post Comment ─── */
  function postComment() {
    if (!mainText.trim() && !pendingFiles.length && !hasVoice) return;
    const newComment = {
      id: `c_${Date.now()}`,
      name: "You",
      initials: "Y",
      avatarIdx: 0,
      badge: null,
      date: formatDate(new Date()),
      body: mainText,
      likes: 0,
      liked: false,
      replies: [],
      image: pendingFiles[0]?.url || null,
      voiceNote: hasVoice ? { duration: fmtTime(voiceDuration) } : null,
      self: true,
    };
    setComments(cs => [newComment, ...cs]);
    setMainText("");
    setPendingFiles([]);
    setHasVoice(false);
    setVoiceDuration(0);
  }

  const showPreviewBar = pendingFiles.length > 0 || hasVoice;

  return (
     <div className="coder-bg font-mono-coder coder-text min-h-screen">
      <div className="max-w-3xl mx-auto px-5 py-10 pb-20">

          {/* ─── INPUT AREA ─── */}
          <div
            ref={inputAreaRef}
            className="input-area-focus rounded-2xl p-4 mb-7 transition-all"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex gap-3 items-start">
              <Avatar initials="Y" size={36} self />
              <textarea
                ref={mainInputRef}
                className="flex-1 bg-transparent border-none outline-none coder-text font-mono-coder resize-none"
                style={{ fontSize: 13, lineHeight: 1.6, minHeight: 60 }}
                placeholder="add your comment"
                value={mainText}
                onChange={e => setMainText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) postComment(); }}
              />
            </div>

            {/* Preview Bar */}
            {showPreviewBar && (
              <div className="flex flex-wrap gap-2 mt-2.5">
                {pendingFiles.map(f => (
                  <div
                    key={f.file.name}
                    className="flex items-center gap-1.5 font-mono-coder coder-text2 rounded-lg px-2.5 py-1"
                    style={{ fontSize: 11, background: "var(--surface3)", border: "1px solid var(--border)" }}
                  >
                    🖼 {f.file.name}
                    <span className="coder-red cursor-pointer" onClick={() => removeFile(f.file.name)}>✕</span>
                  </div>
                ))}
                {hasVoice && (
                  <div
                    className="flex items-center gap-1.5 font-mono-coder coder-text2 rounded-lg px-2.5 py-1"
                    style={{ fontSize: 11, background: "var(--surface3)", border: "1px solid var(--border)" }}
                  >
                    🎙 Voice note ({fmtTime(voiceDuration)})
                    <span className="coder-red cursor-pointer" onClick={removeVoice}>✕</span>
                  </div>
                )}
              </div>
            )}

            {/* Voice Recording Bar */}
            {isRecording && (
              <div
                className="flex items-center gap-2.5 mt-2.5 rounded-xl px-3 py-2"
                style={{ background: "rgba(255,107,107,0.07)", border: "1px solid rgba(255,107,107,0.25)" }}
              >
                <div className="rec-pulse rounded-full" style={{ width: 8, height: 8, background: "var(--red)" }} />
                <span className="coder-red font-mono-coder flex-1" style={{ fontSize: 12 }}>{fmtTime(recSeconds)}</span>
                <button
                  onClick={stopRecording}
                  className="text-white font-mono-coder rounded-lg px-2.5 py-1"
                  style={{ fontSize: 11, background: "var(--red)", border: "none", cursor: "pointer" }}
                >
                  ■ Stop
                </button>
              </div>
            )}

            {/* Action Bar */}
            <div
              className="flex items-center gap-2 mt-3 pt-3"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              {/* Image Upload */}
              <label
                className="attach-btn-hover flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 coder-text2 font-mono-coder transition-all cursor-pointer"
                style={{ fontSize: 13, background: "var(--surface2)", border: "1px solid var(--border)" }}
                title="Image / GIF"
              >
                🖼 <span style={{ fontSize: 11 }}>IMG</span>
                <input type="file" accept="image/*,image/gif" className="hidden" onChange={handleFile} />
              </label>

              {/* Emoji */}
              <div className="relative" ref={emojiPanelRef}>
                <button
                  className="attach-btn-hover flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 coder-text2 font-mono-coder transition-all"
                  style={{ fontSize: 13, background: "var(--surface2)", border: "1px solid var(--border)", cursor: "pointer" }}
                  onClick={() => setEmojiOpen(o => !o)}
                  title="Emoji"
                >
                  😊 <span style={{ fontSize: 11 }}>EMO</span>
                </button>
                {emojiOpen && (
                  <div
                    className="absolute z-50 rounded-xl p-2.5"
                    style={{
                      bottom: 42, left: 0,
                      background: "var(--surface2)",
                      border: "1px solid var(--border2)",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
                      width: 260,
                      display: "grid",
                      gridTemplateColumns: "repeat(8,1fr)",
                      gap: 4,
                    }}
                  >
                    {EMOJIS.map(em => (
                      <button
                        key={em}
                        onClick={() => insertEmoji(em)}
                        className="rounded-lg transition-colors hover:bg-gray-700"
                        style={{ fontSize: 18, padding: 4, background: "none", border: "none", cursor: "pointer" }}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Voice */}
              <button
                onClick={toggleRecording}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono-coder transition-all ${isRecording ? "rec-pulse" : "attach-btn-hover"}`}
                style={{
                  fontSize: 13,
                  background: "var(--surface2)",
                  border: `1px solid ${isRecording ? "var(--red)" : "var(--border)"}`,
                  color: isRecording ? "var(--red)" : "var(--text2)",
                  cursor: "pointer",
                }}
                title="Voice Note"
              >
                🎙 <span style={{ fontSize: 11 }}>{isRecording ? "REC..." : "VOICE"}</span>
              </button>

              {/* Send */}
              <button
                onClick={postComment}
                className="ml-auto text-white font-mono-coder font-semibold rounded-lg px-4 py-1.5 transition-all hover:opacity-90 hover:-translate-y-px active:translate-y-0"
                style={{
                  fontSize: 12,
                  letterSpacing: 0.3,
                  background: "linear-gradient(135deg,var(--accent),#9f7aea)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Post →
              </button>
            </div>
          </div>

          {/* ─── COMMENTS LABEL ─── */}
          <div
            className="font-sans-coder font-bold coder-text3 uppercase tracking-widest mb-4"
            style={{ fontSize: 12, letterSpacing: "1.5px" }}
          >
            — Comments
          </div>

          {/* ─── COMMENT THREAD ─── */}
          <div ref={threadRef} className="flex flex-col gap-3.5 min-h-screen overflow-y-scroll">
            {comments.map(c => (
              <CommentCard
                key={c.id}
                comment={c}
                onLike={handleLike}
                onReplyLike={handleReplyLike}
                onAddReply={handleAddReply}
              />
            ))}
          </div>
        </div>
      </div>
  );
}