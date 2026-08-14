/**
 * MessagesApp.jsx
 * -----------------------------------------------------------------------
 * A responsive, dark-themed messaging UI built with React + Tailwind CSS.
 *
 * Dependencies (all peer dependencies of the file you drop into your project):
 *   - react (^18)
 *   - lucide-react (icons)
 *   - tailwindcss (default/core palette only — no custom theme config needed)
 *   - gsap (animation) — loaded at RUNTIME from a CDN (see the `useGsap`
 *     hook below) so this component works with zero build-step setup.
 *     If your project already has GSAP installed, feel free to delete the
 *     `useGsap` hook and simply `import { gsap } from "gsap"` instead —
 *     every call site below reads from `gsapRef.current`, so swapping the
 *     source is a one-line change.
 *
 * No required props — <MessagesApp /> renders a fully self-contained demo
 * with seeded conversations.
 * -----------------------------------------------------------------------
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Menu,
  ArrowLeft,
  Search,
  X,
  Phone,
  Video,
  MoreVertical,
  Send,
  Mic,
  Paperclip,
  Smile,
  ChevronDown,
  Check,
  CheckCheck,
  Trash2,
  BellOff,
  Ban,
  User,
  FileText,
} from "lucide-react";

/* ============================================================
   PURE HELPERS (module scope — no React state involved)
   ============================================================ */

let _idCounter = 0;
const mid = () => `m${++_idCounter}`;

function daysAgo(n, h, m) {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function timeLabel(d) {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
function dateKey(d) {
  return d.toDateString();
}
function dateDividerLabel(d) {
  const today = new Date();
  if (dateKey(d) === dateKey(today)) return "Today";
  const y = new Date();
  y.setDate(y.getDate() - 1);
  if (dateKey(d) === dateKey(y)) return "Yesterday";
  const opts = { weekday: "long", month: "long", day: "numeric" };
  if (d.getFullYear() !== today.getFullYear()) opts.year = "numeric";
  return d.toLocaleDateString(undefined, opts);
}
function contactTimeLabel(d) {
  const today = new Date();
  if (dateKey(d) === dateKey(today)) return timeLabel(d);
  const y = new Date();
  y.setDate(y.getDate() - 1);
  if (dateKey(d) === dateKey(y)) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function relativeLastSeen(d) {
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "Last seen just now";
  if (mins < 60) return `Last seen ${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `Last seen ${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return days === 1 ? "Last seen yesterday" : `Last seen ${days}d ago`;
}

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-teal-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-emerald-500",
  "bg-indigo-500",
];
function colorForName(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(name) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

const REPLIES = [
  "Sounds good!",
  "Got it, thanks!",
  "Sure thing 👍",
  "On it.",
  "Let me check and get back to you.",
  "Perfect, thanks for the update!",
  "Noted, appreciate it 🙌",
];

const EMOJIS = [
  "😀","😁","😂","🤣","😊","😍","😘","😉","😎","🤔","😴","😢","😭","😡","🥳",
  "👍","👎","👏","🙏","💪","🔥","✨","🎉","❤️","💙","💯","✅","🤝","🙌","👀",
  "😅","🤗","😇","🙃","😐","😬","🤯","🥺","😱","🎨",
];

function buildContacts() {
  const raw = [
    {
      id: "c1",
      name: "Maya Chen",
      online: true,
      lastSeen: null,
      unreadCount: 0,
      messages: [
        { id: mid(), sender: "them", time: daysAgo(3, 10, 15), text: "Hey! Are we still on for the design review Thursday?" },
        { id: mid(), sender: "me", time: daysAgo(3, 10, 42), text: "Yes, 2 PM works for me. I'll send the updated mockups tonight." },
        { id: mid(), sender: "them", time: daysAgo(1, 9, 20), text: "Just saw the mockups, they look great! Quick question about the color palette though." },
        { id: mid(), sender: "me", time: daysAgo(1, 9, 35), text: "Sure, what's up?" },
        { id: mid(), sender: "them", time: daysAgo(1, 9, 41), text: "The accent blue feels a little too saturated on the dark background. Might strain the eyes for long sessions." },
        { id: mid(), sender: "me", time: daysAgo(1, 10, 2), text: "Good catch, I'll tone it down a notch and share a revised version tomorrow." },
        { id: mid(), sender: "them", time: daysAgo(0, 9, 5), text: "Morning! Any update on the palette?" },
        { id: mid(), sender: "me", time: daysAgo(0, 9, 48), text: "Just finished it, sending over now 🎨" },
        { id: mid(), sender: "them", time: daysAgo(0, 10, 10), text: "Looks so much better! Approved from my side ✅" },
        { id: mid(), sender: "me", time: daysAgo(0, 11, 3), text: "Awesome, thank you! I'll get it merged this afternoon.", status: "seen", seenAt: daysAgo(0, 11, 37) },
      ],
    },
    {
      id: "c2",
      name: "Jordan Patel",
      online: false,
      lastSeen: daysAgo(0, 10, 0),
      unreadCount: 3,
      messages: [
        { id: mid(), sender: "them", time: daysAgo(1, 14, 0), text: "Can you review the PR when you get a chance?" },
        { id: mid(), sender: "me", time: daysAgo(1, 16, 20), text: "On it, will finish today." },
        { id: mid(), sender: "them", time: daysAgo(0, 8, 0), text: "Bumping this — also found 2 more edge cases." },
        { id: mid(), sender: "them", time: daysAgo(0, 8, 1), text: "Left comments inline." },
        { id: mid(), sender: "them", time: daysAgo(0, 8, 2), text: "Let me know if anything's unclear!" },
      ],
    },
    {
      id: "c3",
      name: "Sam Rivera",
      online: true,
      lastSeen: null,
      unreadCount: 0,
      messages: [
        { id: mid(), sender: "them", time: daysAgo(0, 7, 30), text: "Lunch later?" },
        { id: mid(), sender: "me", time: daysAgo(0, 7, 45), text: "Definitely, 12:30?", status: "seen", seenAt: daysAgo(0, 7, 46) },
        { id: mid(), sender: "them", time: daysAgo(0, 7, 46), text: "Perfect 👍" },
      ],
    },
    {
      id: "c4",
      name: "Priya Nair",
      online: false,
      lastSeen: daysAgo(1, 19, 0),
      unreadCount: 1,
      messages: [
        { id: mid(), sender: "me", time: daysAgo(2, 12, 0), text: "Sent over the invoice, let me know if it looks right." },
        { id: mid(), sender: "them", time: daysAgo(1, 18, 0), text: "Got it, looks good. Processing payment now." },
        { id: mid(), sender: "them", time: daysAgo(1, 18, 30), text: "Just sent the confirmation to your email." },
      ],
    },
    {
      id: "c5",
      name: "Alex Thompson",
      online: true,
      lastSeen: null,
      unreadCount: 0,
      messages: [
        { id: mid(), sender: "them", time: daysAgo(0, 6, 0), text: "gm ☀️" },
        { id: mid(), sender: "me", time: daysAgo(0, 9, 0), text: "Morning! Ready for the demo?" },
        { id: mid(), sender: "them", time: daysAgo(0, 9, 2), text: "Born ready 😤" },
      ],
    },
    {
      id: "c6",
      name: "Riya Kapoor",
      online: false,
      lastSeen: daysAgo(3, 9, 0),
      unreadCount: 0,
      messages: [
        { id: mid(), sender: "them", time: daysAgo(4, 11, 0), text: "Thanks for the referral, got the callback!" },
        { id: mid(), sender: "me", time: daysAgo(4, 12, 0), text: "That's amazing, congrats!! 🎉", status: "seen", seenAt: daysAgo(4, 12, 20) },
      ],
    },
    {
      id: "c7",
      name: "Chris Owusu",
      online: true,
      lastSeen: null,
      unreadCount: 0,
      messages: [
        { id: mid(), sender: "them", time: daysAgo(0, 7, 0), text: "Deploy went smoothly, all green ✅" },
        { id: mid(), sender: "me", time: daysAgo(0, 7, 10), text: "Nice work, team!", status: "seen", seenAt: daysAgo(0, 7, 25) },
      ],
    },
  ];

  return raw.map((c) => {
    const last = c.messages[c.messages.length - 1];
    return { ...c, lastMessage: last.text, lastTime: last.time };
  });
}

/* ============================================================
   SMALL HOOKS
   ============================================================ */

/** Tracks whether viewport is below Tailwind's `md` breakpoint (768px). */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

/** Loads GSAP from a CDN at runtime (no bundler/npm-install required). */
function useGsap() {
  const gsapRef = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (window.gsap) {
      gsapRef.current = window.gsap;
      setReady(true);
      return;
    }
    let existing = document.querySelector('script[data-gsap-cdn]');
    const onLoad = () => {
      gsapRef.current = window.gsap;
      setReady(true);
    };
    if (existing) {
      existing.addEventListener("load", onLoad);
      return () => existing.removeEventListener("load", onLoad);
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
    script.async = true;
    script.dataset.gsapCdn = "true";
    script.addEventListener("load", onLoad);
    document.head.appendChild(script);
    return () => script.removeEventListener("load", onLoad);
  }, []);
  return { gsapRef, ready };
}

/* ============================================================
   PRESENTATIONAL SUB-COMPONENTS
   ============================================================ */

function Avatar({ name, online, size = "md" }) {
  const sizes = {
    xs: "w-8 h-8 text-xs",
    sm: "w-10 h-10 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-lg",
  };
  const dotSizes = { xs: "w-2 h-2", sm: "w-2.5 h-2.5", md: "w-3 h-3", lg: "w-3.5 h-3.5" };
  return (
    <div className={`relative shrink-0 ${sizes[size]}`}>
      <div
        className={`w-full h-full rounded-full flex items-center justify-center font-bold text-white ${colorForName(
          name
        )}`}
      >
        {initials(name)}
      </div>
      <span
        className={`absolute -right-0.5 -bottom-0.5 rounded-full ring-2 ring-slate-900 ${dotSizes[size]} ${
          online ? "bg-emerald-500" : "bg-slate-500"
        }`}
      />
    </div>
  );
}

function DateDivider({ label }) {
  return (
    <div className="flex items-center justify-center my-4">
      <span className="text-xs font-semibold text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full tracking-wide">
        {label}
      </span>
    </div>
  );
}

function StatusFooter({ msg }) {
  const seen = msg.status === "seen";
  return (
    <div className="flex items-center justify-end gap-1.5 text-xs text-slate-500 mr-1 mb-2 mt-1">
      <span>Sent {timeLabel(msg.time)}</span>
      {seen && (
        <>
          <span className="opacity-50">·</span>
          <span>Seen {timeLabel(msg.seenAt)}</span>
        </>
      )}
      {seen ? <CheckCheck className="w-3.5 h-3.5 text-blue-500" /> : <Check className="w-3.5 h-3.5" />}
    </div>
  );
}

function VoiceBubble({ msg, mine }) {
  const bars = useMemo(
    () => Array.from({ length: 20 }, (_, i) => 6 + Math.round(Math.sin(i * 1.3) * 6 + 6)),
    []
  );
  const mm = Math.floor(msg.duration / 60);
  const ss = String(msg.duration % 60).padStart(2, "0");
  return (
    <div className="flex items-center gap-2 min-w-[160px]">
      <Mic className="w-4 h-4 shrink-0" />
      <div className="flex items-center gap-0.5 h-5 flex-1">
        {bars.map((h, i) => (
          <span
            key={i}
            className={`w-0.5 rounded-full ${mine ? "bg-white/80" : "bg-slate-300/80"}`}
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
      <span className="text-xs opacity-80 shrink-0">
        {mm}:{ss}
      </span>
    </div>
  );
}

function MessageBubble({ msg, mine, gsapReady }) {
  return (
    <div
      data-bubble-id={msg.id}
      className={`flex ${mine ? "justify-end" : "justify-start"} my-0.5 ${
        gsapReady ? "" : "animate-bubble-fallback"
      }`}
    >
      <div
        className={`max-w-[75%] md:max-w-[65%] px-3.5 py-2.5 text-[14.5px] leading-snug flex flex-col gap-1 ${
          mine
            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-md"
            : "bg-slate-800 border border-slate-700 text-slate-100 rounded-2xl rounded-bl-md"
        }`}
      >
        {msg.attachments &&
          msg.attachments.map((f, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm ${
                mine ? "bg-white/15" : "bg-white/5"
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span className="truncate">{f.name}</span>
            </div>
          ))}
        {msg.type === "voice" ? (
          <VoiceBubble msg={msg} mine={mine} />
        ) : (
          msg.text && <span className="whitespace-pre-wrap break-words">{msg.text}</span>
        )}
        <span className="self-end text-[10.5px] opacity-65">{timeLabel(msg.time)}</span>
      </div>
    </div>
  );
}

function TypingIndicator({ innerRef }) {
  return (
    <div ref={innerRef} className="flex justify-start my-1.5">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 typing-dot" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 typing-dot" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 typing-dot" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function MessagesApp() {
  const isMobile = useIsMobile();
  const { gsapRef, ready: gsapReady } = useGsap();

  const [contacts, setContacts] = useState(buildContacts);
  const [activeContactId, setActiveContactId] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 768 ? null : "c1"
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contactQuery, setContactQuery] = useState("");
  const [chatSearchOpen, setChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [typingContactId, setTypingContactId] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [toasts, setToasts] = useState([]);

  const messagesRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingRef = useRef(null);
  const switcherWrapRef = useRef(null);
  const moreWrapRef = useRef(null);
  const emojiWrapRef = useRef(null);
  const animatedIds = useRef(new Set());
  const requestScrollBottom = useRef(false);
  const prevActiveId = useRef(activeContactId);
  const activeContactIdRef = useRef(activeContactId);

  useEffect(() => {
    activeContactIdRef.current = activeContactId;
  }, [activeContactId]);

  const activeContact = contacts.find((c) => c.id === activeContactId) || null;

  /* ---------- toasts ---------- */
  function showToast(text) {
    const id = mid();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
  }

  /* ---------- close popovers on outside click ---------- */
  useEffect(() => {
    function handleClick(e) {
      if (switcherWrapRef.current && !switcherWrapRef.current.contains(e.target)) setSwitcherOpen(false);
      if (moreWrapRef.current && !moreWrapRef.current.contains(e.target)) setMoreMenuOpen(false);
      if (emojiWrapRef.current && !emojiWrapRef.current.contains(e.target)) setEmojiOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ---------- recording timer ---------- */
  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  /* ---------- textarea auto-resize ---------- */
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [drafts, activeContactId]);

  /* ---------- smooth scroll (GSAP, with native fallback) ---------- */
  function smoothScrollToBottom() {
    const el = messagesRef.current;
    if (!el) return;
    const target = el.scrollHeight - el.clientHeight;
    const gsap = gsapRef.current;
    if (gsap) {
      gsap.to(el, { scrollTop: target, duration: 0.45, ease: "power3.out", overwrite: true });
    } else if (el.scrollTo) {
      el.scrollTo({ top: target, behavior: "smooth" });
    } else {
      el.scrollTop = target;
    }
  }

  /* ---------- GSAP pop-in for freshly mounted bubbles ---------- */
  function animateNewBubbles() {
    const gsap = gsapRef.current;
    const container = messagesRef.current;
    if (!gsap || !container) return;
    const nodes = container.querySelectorAll("[data-bubble-id]");
    const fresh = [];
    nodes.forEach((node) => {
      const id = node.getAttribute("data-bubble-id");
      if (!animatedIds.current.has(id)) {
        fresh.push(node);
        animatedIds.current.add(id);
      }
    });
    if (fresh.length) {
      gsap.fromTo(
        fresh,
        { opacity: 0, y: 10, scale: 0.92, transformOrigin: "bottom center" },
        { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: "back.out(1.6)", stagger: 0.035, clearProps: "transform" }
      );
    }
  }

  /* Register non-GSAP ids too, so a later GSAP load doesn't replay old bubbles */
  useEffect(() => {
    if (gsapReady) return;
    const container = messagesRef.current;
    if (!container) return;
    container.querySelectorAll("[data-bubble-id]").forEach((node) => {
      animatedIds.current.add(node.getAttribute("data-bubble-id"));
    });
  });

  /* ---------- scroll + animate whenever message content changes ---------- */
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    const switched = prevActiveId.current !== activeContactId;
    prevActiveId.current = activeContactId;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 140;

    if (switched) {
      el.scrollTop = el.scrollHeight;
    } else if (requestScrollBottom.current || nearBottom) {
      smoothScrollToBottom();
    }
    requestScrollBottom.current = false;
    animateNewBubbles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contacts, typingContactId, activeContactId, gsapReady]);

  /* ---------- typing indicator entrance ---------- */
  useEffect(() => {
    if (typingContactId && typingContactId === activeContactId && typingRef.current && gsapRef.current) {
      gsapRef.current.fromTo(
        typingRef.current,
        { opacity: 0, y: 8, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: "back.out(1.6)" }
      );
    }
  }, [typingContactId, activeContactId, gsapReady]);

  /* ============================================================
     ACTIONS
     ============================================================ */
  function selectContact(id) {
    setActiveContactId(id);
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)));
    setChatSearchOpen(false);
    setChatSearchQuery("");
    setSwitcherOpen(false);
    setMoreMenuOpen(false);
    setEmojiOpen(false);
    setPendingAttachments([]);
    setTypingContactId(null);
    if (isMobile) setSidebarOpen(false);
  }

  function sendMessage() {
    const targetId = activeContactId;
    if (!targetId) return;
    const text = (drafts[targetId] || "").trim();
    if (!text && pendingAttachments.length === 0) return;

    const newMsg = {
      id: mid(),
      sender: "me",
      time: new Date(),
      text: text || null,
      attachments: pendingAttachments.length ? pendingAttachments.slice() : null,
      status: "sent",
    };

    setContacts((prev) =>
      prev.map((c) =>
        c.id === targetId
          ? {
              ...c,
              messages: [...c.messages, newMsg],
              lastMessage: text || (newMsg.attachments ? `📎 ${newMsg.attachments[0].name}` : ""),
              lastTime: newMsg.time,
            }
          : c
      )
    );

    setDrafts((d) => ({ ...d, [targetId]: "" }));
    setPendingAttachments([]);
    requestScrollBottom.current = true;

    setTimeout(() => {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === targetId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === newMsg.id ? { ...m, status: "seen", seenAt: new Date() } : m
                ),
              }
            : c
        )
      );
    }, 1600);

    setTimeout(() => setTypingContactId(targetId), 900);

    setTimeout(() => {
      setTypingContactId(null);
      const reply = REPLIES[Math.floor(Math.random() * REPLIES.length)];
      const replyMsg = { id: mid(), sender: "them", time: new Date(), text: reply };
      setContacts((prev) =>
        prev.map((c) =>
          c.id === targetId
            ? {
                ...c,
                messages: [...c.messages, replyMsg],
                lastMessage: reply,
                lastTime: replyMsg.time,
                unreadCount: activeContactIdRef.current === targetId ? c.unreadCount : (c.unreadCount || 0) + 1,
              }
            : c
        )
      );
      if (activeContactIdRef.current === targetId) requestScrollBottom.current = true;
    }, 2500);
  }

  function insertEmoji(emoji) {
    if (!activeContactId) return;
    const ta = textareaRef.current;
    const current = drafts[activeContactId] || "";
    const start = ta ? ta.selectionStart : current.length;
    const end = ta ? ta.selectionEnd : current.length;
    const next = current.slice(0, start) + emoji + current.slice(end);
    setDrafts((d) => ({ ...d, [activeContactId]: next }));
    requestAnimationFrame(() => {
      if (!ta) return;
      ta.focus();
      const pos = start + emoji.length;
      ta.setSelectionRange(pos, pos);
    });
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      setPendingAttachments((prev) => [...prev, ...files.map((f) => ({ name: f.name }))]);
    }
    e.target.value = "";
  }

  function removeAttachment(index) {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function stopRecordingSend() {
    const targetId = activeContactId;
    if (targetId && recordSeconds > 0) {
      const msg = { id: mid(), sender: "me", time: new Date(), type: "voice", duration: recordSeconds, status: "sent" };
      setContacts((prev) =>
        prev.map((c) =>
          c.id === targetId
            ? { ...c, messages: [...c.messages, msg], lastMessage: "🎤 Voice message", lastTime: msg.time }
            : c
        )
      );
      requestScrollBottom.current = true;
      setTimeout(() => {
        setContacts((prev) =>
          prev.map((c) =>
            c.id === targetId
              ? {
                  ...c,
                  messages: c.messages.map((m) => (m.id === msg.id ? { ...m, status: "seen", seenAt: new Date() } : m)),
                }
              : c
          )
        );
      }, 1600);
    }
    setRecording(false);
    setRecordSeconds(0);
  }

  /* ============================================================
     DERIVED DATA
     ============================================================ */
  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(contactQuery.trim().toLowerCase())
  );

  const visibleMessages = useMemo(() => {
    if (!activeContact) return [];
    const q = chatSearchQuery.trim().toLowerCase();
    if (chatSearchOpen && q) {
      return activeContact.messages.filter((m) => m.text && m.text.toLowerCase().includes(q));
    }
    return activeContact.messages;
  }, [activeContact, chatSearchOpen, chatSearchQuery]);

  const searchingWithNoText = chatSearchOpen && chatSearchQuery.trim().length > 0;
  const hasComposerContent = (drafts[activeContactId] || "").trim().length > 0 || pendingAttachments.length > 0;

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className="h-screen w-full flex bg-slate-950 text-slate-100 overflow-hidden font-sans antialiased">
      <style>{`
        .msgs-scroll::-webkit-scrollbar, .contacts-scroll::-webkit-scrollbar { width: 8px; }
        .msgs-scroll::-webkit-scrollbar-thumb, .contacts-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 8px; }
        .msgs-scroll::-webkit-scrollbar-track, .contacts-scroll::-webkit-scrollbar-track { background: transparent; }
        .msgs-scroll, .contacts-scroll { scrollbar-width: thin; scrollbar-color: #334155 transparent; }
        @keyframes typingBounce { 0%, 60%, 100% { transform: translateY(0); opacity: .5; } 30% { transform: translateY(-5px); opacity: 1; } }
        .typing-dot { animation: typingBounce 1.1s infinite ease-in-out; }
        @keyframes popoverIn { from { opacity: 0; transform: translateY(-4px) scale(.97); } to { opacity: 1; transform: none; } }
        .popover-anim { animation: popoverIn .15s ease; }
        @keyframes recPulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
        .rec-pulse { animation: recPulse 1s infinite; }
        @keyframes msgPop { from { opacity: 0; transform: translateY(8px) scale(.94); } to { opacity: 1; transform: none; } }
        .animate-bubble-fallback { animation: msgPop .3s ease-out both; }
      `}</style>

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed md:static inset-0 md:inset-auto z-40 md:z-auto w-full flex-shrink-0 bg-slate-900 border-slate-800 flex flex-col overflow-hidden transition-all duration-300 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
          ${sidebarOpen ? "md:w-80 md:border-r" : "md:w-0 md:border-r-0"}`}
      >
        <div className="flex-shrink-0 flex items-center justify-between px-4 pt-4 pb-3 min-w-[320px] md:min-w-[320px]">
          <div className="flex items-center gap-2 font-extrabold text-xl tracking-tight">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.18)]" />
            Messages
          </div>
          <button
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close contacts"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-shrink-0 px-4 pb-3 min-w-[320px]">
          <div className="flex items-center gap-2 bg-slate-800/70 border border-slate-700 rounded-xl px-3 py-2 focus-within:border-blue-500 transition-colors">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              value={contactQuery}
              onChange={(e) => setContactQuery(e.target.value)}
              placeholder="Search conversations"
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto contacts-scroll px-2 pb-3 min-w-[320px]">
          {filteredContacts.length === 0 ? (
            <div className="text-center text-sm text-slate-500 px-5 py-8">
              No conversations match &ldquo;{contactQuery}&rdquo;.
            </div>
          ) : (
            filteredContacts.map((c) => {
              const active = c.id === activeContactId;
              const unread = c.unreadCount > 0;
              return (
                <button
                  key={c.id}
                  onClick={() => selectContact(c.id)}
                  className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-xl text-left transition-colors ${
                    active ? "bg-blue-500/15" : "hover:bg-slate-800/70"
                  }`}
                >
                  <Avatar name={c.name} online={c.online} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`text-sm truncate ${unread ? "font-semibold text-slate-100" : "font-semibold text-slate-200"}`}>
                        {c.name}
                      </span>
                      <span className="text-xs text-slate-500 shrink-0">{contactTimeLabel(c.lastTime)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className={`text-sm truncate ${unread ? "text-slate-200 font-medium" : "text-slate-400"}`}>
                        {c.lastMessage}
                      </span>
                      {unread && (
                        <span className="shrink-0 min-w-[18px] h-[18px] px-1.5 rounded-full bg-blue-500 text-white text-[11px] font-bold flex items-center justify-center">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ================= CHAT PANE ================= */}
      <main className="flex-1 min-w-0 flex flex-col bg-slate-950">
        {/* ---- Header ---- */}
        <header className="flex-shrink-0 min-h-[68px] flex items-center gap-1 px-3 md:px-4 bg-slate-900 border-b border-slate-800 relative z-20">
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-100 shrink-0"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={isMobile ? "Back to contacts" : "Toggle contact list"}
          >
            {isMobile ? <ArrowLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {!activeContact ? (
            <div className="font-extrabold text-lg pl-1">Messages</div>
          ) : chatSearchOpen ? (
            <>
              <div className="flex items-center gap-2 flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 mx-1">
                <Search className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  placeholder={`Search in conversation with ${activeContact.name}`}
                  className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-500"
                />
              </div>
              <button
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-100 shrink-0"
                onClick={() => {
                  setChatSearchOpen(false);
                  setChatSearchQuery("");
                }}
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <div ref={switcherWrapRef} className="relative flex-1 min-w-0">
                <button
                  onClick={() => {
                    setSwitcherOpen((v) => !v);
                    setMoreMenuOpen(false);
                    setEmojiOpen(false);
                  }}
                  className="flex items-center gap-2.5 flex-1 min-w-0 py-1.5 pl-1 pr-2 rounded-xl hover:bg-slate-800/70 transition-colors text-left w-full"
                >
                  <Avatar name={activeContact.name} online={activeContact.online} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-[15px] truncate">{activeContact.name}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    </div>
                    <div className={`text-xs ${activeContact.online ? "text-emerald-400" : "text-slate-400"}`}>
                      {activeContact.online ? "Online" : relativeLastSeen(activeContact.lastSeen || activeContact.lastTime)}
                    </div>
                  </div>
                </button>

                {switcherOpen && (
                  <div className="popover-anim absolute left-0 top-[calc(100%+8px)] w-72 md:w-80 max-h-96 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50">
                    {contacts.map((c) => {
                      const active = c.id === activeContactId;
                      return (
                        <button
                          key={c.id}
                          onClick={() => selectContact(c.id)}
                          className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors ${
                            active ? "bg-blue-500/15" : "hover:bg-slate-700/70"
                          }`}
                        >
                          <Avatar name={c.name} online={c.online} size="xs" />
                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate">{c.name}</div>
                            <div className="text-xs text-slate-400 truncate max-w-[190px]">{c.lastMessage}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                  onClick={() => setChatSearchOpen(true)}
                  aria-label="Search in conversation"
                >
                  <Search className="w-[18px] h-[18px]" />
                </button>
                <button
                  className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                  onClick={() => showToast(`Calling ${activeContact.name}…`)}
                  aria-label="Voice call"
                >
                  <Phone className="w-[18px] h-[18px]" />
                </button>
                <button
                  className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                  onClick={() => showToast(`Starting video call with ${activeContact.name}…`)}
                  aria-label="Video call"
                >
                  <Video className="w-[18px] h-[18px]" />
                </button>
                <div ref={moreWrapRef} className="relative">
                  <button
                    className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                    onClick={() => {
                      setMoreMenuOpen((v) => !v);
                      setSwitcherOpen(false);
                      setEmojiOpen(false);
                    }}
                    aria-label="More options"
                  >
                    <MoreVertical className="w-[18px] h-[18px]" />
                  </button>
                  {moreMenuOpen && (
                    <div className="popover-anim absolute right-0 top-[calc(100%+8px)] w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50">
                      <button
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium hover:bg-slate-700/70"
                        onClick={() => {
                          showToast(`Viewing ${activeContact.name}'s profile`);
                          setMoreMenuOpen(false);
                        }}
                      >
                        <User className="w-4 h-4 text-slate-400" /> View contact
                      </button>
                      <button
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium hover:bg-slate-700/70"
                        onClick={() => {
                          showToast(`Notifications muted for ${activeContact.name}`);
                          setMoreMenuOpen(false);
                        }}
                      >
                        <BellOff className="w-4 h-4 text-slate-400" /> Mute notifications
                      </button>
                      <div className="h-px bg-slate-700 my-1.5 mx-1" />
                      <button
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-slate-700/70"
                        onClick={() => {
                          if (window.confirm(`Clear all messages with ${activeContact.name}? This can't be undone.`)) {
                            setContacts((prev) =>
                              prev.map((c) => (c.id === activeContact.id ? { ...c, messages: [], lastMessage: "" } : c))
                            );
                          }
                          setMoreMenuOpen(false);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-rose-400" /> Clear chat
                      </button>
                      <button
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-slate-700/70"
                        onClick={() => {
                          showToast(`${activeContact.name} has been blocked`);
                          setMoreMenuOpen(false);
                        }}
                      >
                        <Ban className="w-4 h-4 text-rose-400" /> Block contact
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </header>

        {/* ---- Messages (the ONLY scrollable region) ---- */}
        <div ref={messagesRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain msgs-scroll px-4 md:px-6 py-5">
          {!activeContact ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-8">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 mb-1">
                <User className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-slate-300 text-base">Select a conversation</h3>
              <p className="text-sm text-slate-500 max-w-xs">Choose a contact from the list to start chatting.</p>
            </div>
          ) : searchingWithNoText && visibleMessages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-slate-500">
              No messages match &ldquo;{chatSearchQuery}&rdquo;.
            </div>
          ) : (
            <>
              {visibleMessages.map((m, idx) => {
                const showDivider = idx === 0 || dateKey(m.time) !== dateKey(visibleMessages[idx - 1].time);
                const isLast = idx === visibleMessages.length - 1;
                return (
                  <React.Fragment key={m.id}>
                    {showDivider && <DateDivider label={dateDividerLabel(m.time)} />}
                    <MessageBubble msg={m} mine={m.sender === "me"} gsapReady={gsapReady} />
                    {isLast && m.sender === "me" && !searchingWithNoText && <StatusFooter msg={m} />}
                  </React.Fragment>
                );
              })}
              {typingContactId === activeContact.id && !searchingWithNoText && <TypingIndicator innerRef={typingRef} />}
            </>
          )}
        </div>

        {/* ---- Input bar ---- */}
        {activeContact && (
          <footer className="flex-shrink-0 bg-slate-900 border-t border-slate-800 px-3 md:px-4 py-2.5">
            {pendingAttachments.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {pendingAttachments.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg pl-2.5 pr-1.5 py-1 text-xs text-slate-300"
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate max-w-[140px]">{f.name}</span>
                    <button
                      className="text-slate-500 hover:text-rose-400 rounded-full p-0.5"
                      onClick={() => removeAttachment(i)}
                      aria-label="Remove attachment"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {recording ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2.5 bg-slate-800 border border-slate-700 rounded-full pl-4 pr-2.5 py-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 rec-pulse shrink-0" />
                  <span className="text-sm font-medium tabular-nums shrink-0">
                    {Math.floor(recordSeconds / 60)}:{String(recordSeconds % 60).padStart(2, "0")}
                  </span>
                  <span className="text-xs text-slate-500 flex-1">Recording voice message…</span>
                  <button
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-rose-400"
                    onClick={() => {
                      setRecording(false);
                      setRecordSeconds(0);
                    }}
                    aria-label="Cancel recording"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <button
                  className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shrink-0 transition-colors"
                  onClick={stopRecordingSend}
                  aria-label="Send voice message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-end gap-1">
                <div ref={emojiWrapRef} className="relative">
                  <button
                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-100 shrink-0"
                    onClick={() => {
                      setEmojiOpen((v) => !v);
                      setSwitcherOpen(false);
                      setMoreMenuOpen(false);
                    }}
                    aria-label="Insert emoji"
                  >
                    <Smile className="w-[19px] h-[19px]" />
                  </button>
                  {emojiOpen && (
                    <div className="popover-anim absolute left-0 bottom-[calc(100%+10px)] w-72 max-h-56 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 grid grid-cols-8 gap-0.5 z-50">
                      {EMOJIS.map((e, i) => (
                        <button
                          key={i}
                          onClick={() => insertEmoji(e)}
                          className="text-lg p-1.5 rounded-lg hover:bg-slate-700 leading-none"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-100 shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Attach file"
                >
                  <Paperclip className="w-[19px] h-[19px]" />
                </button>

                <div className="flex-1 flex items-end gap-1.5 bg-slate-800 border border-slate-700 focus-within:border-blue-500 rounded-3xl pl-4 pr-1.5 py-1.5 transition-colors">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={drafts[activeContactId] || ""}
                    onChange={(e) => setDrafts((d) => ({ ...d, [activeContactId]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder={`Message ${activeContact.name}`}
                    className="flex-1 bg-transparent border-none outline-none resize-none text-[14.5px] leading-snug py-1.5 max-h-[120px] placeholder:text-slate-500"
                  />
                </div>

                {hasComposerContent ? (
                  <button
                    className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 active:scale-95 text-white flex items-center justify-center shrink-0 transition-all"
                    onClick={sendMessage}
                    aria-label="Send message"
                  >
                    <Send className="w-[18px] h-[18px]" />
                  </button>
                ) : (
                  <button
                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-100 shrink-0"
                    onClick={() => setRecording(true)}
                    aria-label="Record voice message"
                  >
                    <Mic className="w-[19px] h-[19px]" />
                  </button>
                )}
              </div>
            )}
          </footer>
        )}
      </main>

      <input ref={fileInputRef} type="file" multiple hidden onChange={handleFileChange} />

      {/* ---- Toasts ---- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-slate-800 border border-slate-700 text-slate-100 px-4 py-2.5 rounded-xl text-sm shadow-2xl popover-anim"
          >
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}