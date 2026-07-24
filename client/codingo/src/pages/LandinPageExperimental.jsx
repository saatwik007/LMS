import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Heart, Send, Mic, Smile, Play, Pause, MessageCircle, MoreHorizontal } from 'lucide-react';

const AVATAR_COLORS = ['#52525b', '#57534e', '#3f3f46', '#44403c', '#525252', '#71717a', '#4b5563', '#5b5b62'];
const EMOJIS = ['😀','😂','😍','🥰','😎','🤔','👍','👏','🔥','🎉','❤️','😢','😮','🙌','💯','😅','🙏','✨','😁','😊','🥳','😴','👀','💀'];

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
  return h;
}
function pickColor(name) { return AVATAR_COLORS[Math.abs(hashCode(name)) % AVATAR_COLORS.length]; }
function initials(name) { return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase(); }
function formatLikes(n) { return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n); }
function formatTime(s) { const m = Math.floor(s / 60); const sec = s % 60; return `${m}:${sec < 10 ? '0' : ''}${sec}`; }
function parseDuration(str) { if (!str) return 0; const [m, s] = str.split(':').map(Number); return m * 60 + s; }
function genLiveBars() { return Array.from({ length: 20 }, () => 8 + Math.random() * 16); }

const initialComments = [
  {
    id: 1, user: { name: 'Maya Chen' },
    text: "This is honestly one of the best shots I've seen this week 🔥 the lighting is unreal.",
    time: '2h', likes: 214, liked: false,
    replies: [
      { id: 2, user: { name: 'Theo Park' }, text: 'Agreed, the color grading is insane.', time: '1h', likes: 12, liked: false },
      { id: 3, user: { name: 'Aria Singh' }, text: 'The way the shadows fall though 😍', time: '40m', likes: 6, liked: false },
    ],
  },
  { id: 4, user: { name: 'Jordan Lee' }, text: 'This lives in my head rent free 😭', time: '3h', likes: 89, liked: false, replies: [] },
  {
    id: 5, user: { name: 'Sam Okafor' }, time: '4h', likes: 34, liked: false, replies: [],
    voice: { duration: '0:18', bars: [30,60,45,80,55,90,40,65,50,75,35,60,85,45,70,55,30,65,50,80,40,60,45,70] },
  },
  {
    id: 6, user: { name: 'Priya Nair' }, text: 'Okay but the composition here is a masterclass in negative space.',
    time: '5h', likes: 156, liked: false,
    replies: [{ id: 7, user: { name: 'Liam Brooks' }, text: 'Underrated comment right here.', time: '4h', likes: 9, liked: false }],
  },
  { id: 8, user: { name: 'Devon Marsh' }, text: 'wait is this shot on film or digital??', time: '6h', likes: 21, liked: false, replies: [] },
  { id: 9, user: { name: 'Aiko Tanaka' }, text: 'saving this for inspiration, thank you for sharing your process 🙏', time: '1d', likes: 47, liked: false, replies: [] },
  { id: 10, user: { name: 'Noah Kim' }, text: '🔥🔥🔥', time: '1d', likes: 12, liked: false, replies: [] },
];

const SEED_TOP_LEVEL_COUNT = 7;

function CommentRow({
  comment, isReply, delay, expanded, onToggleExpand, onReplyClick,
  replyOpen, replyValue, onReplyChange, onReplySubmit,
  onLikeById, pulseId, playingVoiceId, onTogglePlay,
}) {
  const c = comment;
  const pulsing = pulseId === c.id;
  const avatarSize = isReply ? 'w-7 h-7' : 'w-9 h-9';

  return (
    <div className={`flex gap-2.5 ${isReply ? 'py-1.5 pl-3 border-l border-neutral-800 ml-1' : 'py-2'} comment-pop-anim`} style={{ animationDelay: `${delay}ms` }}>
      <div className={`${avatarSize} flex-shrink-0 rounded-full flex items-center justify-center font-semibold text-xs text-white`} style={{ background: pickColor(c.user.name) }}>
        {initials(c.user.name)}
      </div>

      <div className="flex-1 min-w-0">
        {c.voice ? (
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 w-64 max-w-full">
            <div className="text-xs font-semibold mb-1.5">{c.user.name}</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onTogglePlay(c.id, c.voice.duration)}
                aria-label={playingVoiceId === c.id ? 'Pause voice note' : 'Play voice note'}
                className="w-7 h-7 flex-shrink-0 rounded-full bg-neutral-700 border border-neutral-600 flex items-center justify-center text-neutral-100"
              >
                {playingVoiceId === c.id ? <Pause size={11} /> : <Play size={11} fill="currentColor" />}
              </button>
              <div className="flex-1 flex items-center h-6 min-w-0 overflow-hidden" style={{ gap: '2px' }}>
                {c.voice.bars.map((h, i) => (
                  <span
                    key={i}
                    className={`flex-shrink-0 rounded-sm ${playingVoiceId === c.id ? 'bg-neutral-300 wave-bar-anim' : 'bg-neutral-500'}`}
                    style={{ width: '2.5px', height: `${h}%`, animationDelay: playingVoiceId === c.id ? `${-(i * 0.05)}s` : undefined }}
                  />
                ))}
              </div>
              <span className="text-xs text-neutral-500 flex-shrink-0">{c.voice.duration}</span>
            </div>
          </div>
        ) : (
          <div className="text-sm leading-relaxed break-words">
            <span className="font-semibold mr-1">{c.user.name}</span>{c.text}
          </div>
        )}

        <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
          <span>{c.time}</span>
          {c.likes > 0 && <span className="font-semibold text-neutral-500">{formatLikes(c.likes)} likes</span>}
          {!isReply && (
            <button onClick={onReplyClick} className="font-semibold hover:text-neutral-300 transition-colors">Reply</button>
          )}
        </div>

        {!isReply && c.replies && c.replies.length > 0 && (
          <button onClick={onToggleExpand} className="block mt-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-300 transition-colors">
            {expanded ? '— Hide replies' : `— View ${c.replies.length} ${c.replies.length === 1 ? 'reply' : 'replies'}`}
          </button>
        )}

        {!isReply && expanded && c.replies && c.replies.map((r, i) => (
          <CommentRow
            key={r.id}
            comment={r}
            isReply={true}
            delay={i * 60}
            onLikeById={onLikeById}
            pulseId={pulseId}
            playingVoiceId={playingVoiceId}
            onTogglePlay={onTogglePlay}
          />
        ))}

        {!isReply && (
          <div className={`items-center gap-2 mt-2.5 ${replyOpen ? 'flex' : 'hidden'}`}>
            <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold" style={{ background: pickColor('You') }}>Y</div>
            <input
              autoFocus={replyOpen}
              value={replyValue || ''}
              onChange={(e) => onReplyChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onReplySubmit(); } }}
              placeholder={`Reply to ${c.user.name}...`}
              type="text"
              className="flex-1 min-w-0 bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder-neutral-500 text-xs rounded-full px-3 py-1.5 focus:outline-none focus:border-neutral-500"
            />
            <button onClick={onReplySubmit} className="text-xs font-bold text-red-500 flex-shrink-0 px-1">Post</button>
          </div>
        )}
      </div>

      <button
        onClick={() => onLikeById(c.id)}
        aria-label={isReply ? 'Like reply' : 'Like comment'}
        className={`flex-shrink-0 self-start mt-0.5 p-1 transition-colors ${c.liked ? 'text-red-500' : 'text-neutral-500 hover:text-neutral-300'} ${pulsing ? 'heart-pop-anim' : ''}`}
      >
        <Heart size={isReply ? 13 : 15} fill={c.liked ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}

export default function CommentModal() {
  const [comments, setComments] = useState(initialComments);
  const [isOpen, setIsOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState(() => new Set([1]));
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [pulseId, setPulseId] = useState(null);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [liveBars, setLiveBars] = useState(genLiveBars);

  const idCounter = useRef(100);
  const newId = () => { idCounter.current += 1; return idCounter.current; };

  const listRef = useRef(null);
  const firstRenderRef = useRef(true);
  const emojiRef = useRef(null);
  const emojiBtnRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  const totalCount = useMemo(
    () => comments.reduce((sum, c) => sum + 1 + (c.replies ? c.replies.length : 0), 0),
    [comments]
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const openModal = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
  };

  const closeModal = () => {
    setEntered(false);
    setEmojiOpen(false);
    if (recording) { setRecording(false); setRecordSeconds(0); }
    closeTimeoutRef.current = setTimeout(() => setIsOpen(false), 320);
  };

  useEffect(() => {
    const t = setTimeout(openModal, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (firstRenderRef.current) { firstRenderRef.current = false; return; }
    if (listRef.current) listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [comments.length]);

  useEffect(() => {
    if (!emojiOpen) return undefined;
    const onClick = (e) => {
      if (
        emojiRef.current && !emojiRef.current.contains(e.target) &&
        emojiBtnRef.current && !emojiBtnRef.current.contains(e.target)
      ) setEmojiOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [emojiOpen]);

  useEffect(() => {
    if (!recording) return undefined;
    const t = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const toggleExpand = (id) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleLike = (id) => {
    setComments((prev) => prev.map((c) => {
      if (c.id === id) return { ...c, liked: !c.liked, likes: c.likes + (!c.liked ? 1 : -1) };
      if (c.replies && c.replies.length) {
        const nextReplies = c.replies.map((r) => (r.id === id ? { ...r, liked: !r.liked, likes: r.likes + (!r.liked ? 1 : -1) } : r));
        if (nextReplies !== c.replies) return { ...c, replies: nextReplies };
      }
      return c;
    }));
    setPulseId(id);
    setTimeout(() => setPulseId((curr) => (curr === id ? null : curr)), 300);
  };

  const togglePlay = (id, durationStr) => {
    if (playingVoiceId === id) {
      setPlayingVoiceId(null);
      return;
    }
    setPlayingVoiceId(id);
    const secs = parseDuration(durationStr) || 1;
    setTimeout(() => setPlayingVoiceId((curr) => (curr === id ? null : curr)), secs * 1000);
  };

  const openReplyBox = (id) => {
    setActiveReplyId((prev) => (prev === id ? null : id));
    setReplyText('');
  };

  const submitReply = (parentId) => {
    const val = replyText.trim();
    if (!val) return;
    const reply = { id: newId(), user: { name: 'You' }, text: val, time: 'now', likes: 0, liked: false };
    setComments((prev) => prev.map((c) => (c.id === parentId ? { ...c, replies: [...c.replies, reply] } : c)));
    setExpandedReplies((prev) => new Set(prev).add(parentId));
    setActiveReplyId(null);
    setReplyText('');
  };

  const submitComment = () => {
    const val = inputValue.trim();
    if (!val) return;
    const c = { id: newId(), user: { name: 'You' }, text: val, time: 'now', likes: 0, liked: false, replies: [] };
    setComments((prev) => [...prev, c]);
    setInputValue('');
  };

  const startRecording = () => { setRecording(true); setRecordSeconds(0); setLiveBars(genLiveBars()); };
  const cancelRecording = () => { setRecording(false); setRecordSeconds(0); };
  const sendRecording = () => {
    const secs = recordSeconds || 1;
    const bars = Array.from({ length: 24 }, () => 25 + Math.random() * 70);
    const c = { id: newId(), user: { name: 'You' }, time: 'now', likes: 0, liked: false, replies: [], voice: { duration: formatTime(secs), bars } };
    setComments((prev) => [...prev, c]);
    setRecording(false);
    setRecordSeconds(0);
  };

  const modalStyle = isMobile
    ? { width: '100%', height: '82vh', maxHeight: '88vh' }
    : { width: 'clamp(380px, 27vw, 460px)', maxWidth: '92vw', height: 'clamp(500px, 64vh, 720px)', maxHeight: '90vh' };

  const modalTransformClass = isMobile
    ? (entered ? 'translate-y-0' : 'translate-y-full')
    : (entered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2');

  return (
    <div className="min-h-screen w-full bg-neutral-950 flex items-center justify-center p-6 font-sans text-neutral-100">
      <style>{`
        @keyframes commentPop { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .comment-pop-anim { animation: commentPop 0.35s ease-out both; }
        @keyframes heartPop { 0% { transform: scale(1); } 40% { transform: scale(1.3); } 100% { transform: scale(1); } }
        .heart-pop-anim { animation: heartPop 0.3s ease-out; }
        @keyframes recDotPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .45; transform: scale(.8); } }
        .rec-dot-anim { animation: recDotPulse 1.1s ease-in-out infinite; }
        @keyframes recBar { 0%, 100% { transform: scaleY(.35); } 50% { transform: scaleY(1); } }
        .rec-bar-anim { animation: recBar .8s ease-in-out infinite; }
        @keyframes waveBounce { 0%, 100% { transform: scaleY(.5); } 50% { transform: scaleY(1); } }
        .wave-bar-anim { animation: waveBounce .9s ease-in-out infinite; }
        .comments-scroll::-webkit-scrollbar { width: 6px; }
        .comments-scroll::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 9999px; }
        .comments-scroll { scrollbar-width: thin; scrollbar-color: #3f3f46 transparent; }
        @media (prefers-reduced-motion: reduce) {
          .comment-pop-anim, .heart-pop-anim, .rec-dot-anim, .rec-bar-anim, .wave-bar-anim { animation: none !important; }
        }
      `}</style>

      {/* mock post, for context */}
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 py-3.5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0" style={{ background: '#52525b' }}>WS</div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">wanderlust.studio</span>
            <span className="text-xs text-neutral-500">Kyoto, Japan</span>
          </div>
          <button aria-label="More options" className="ml-auto text-neutral-500 hover:text-neutral-300 px-1">
            <MoreHorizontal size={20} />
          </button>
        </div>
        <div className="w-full h-64" style={{ background: 'linear-gradient(160deg, #1c1c20, #101012 70%)' }} />
        <div className="flex items-center gap-4 px-4 pt-3 pb-1">
          <button aria-label="Like post" className="text-neutral-300 hover:text-red-500 transition-colors">
            <Heart size={22} />
          </button>
          <button onClick={openModal} className="flex items-center gap-1.5 text-neutral-100 hover:text-neutral-300 transition-colors">
            <MessageCircle size={22} />
            <span className="text-sm">{totalCount} comments</span>
          </button>
        </div>
        <div className="px-4 pb-4 pt-1.5 text-sm text-neutral-400 leading-relaxed">
          <span className="font-semibold text-neutral-100">wanderlust.studio</span> golden hour through the bamboo grove — some places don't need a filter.
        </div>
      </div>

      {isOpen && (
        <div
          className={`fixed inset-0 z-50 flex ${isMobile ? 'items-end' : 'items-center'} justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300 ${entered ? 'opacity-100' : 'opacity-0'}`}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Comments"
            style={modalStyle}
            className={`relative flex flex-col bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden transition-all duration-300 ease-out ${isMobile ? 'rounded-t-3xl' : 'rounded-3xl'} ${modalTransformClass}`}
          >
            {isMobile && <div className="w-9 h-1 rounded-full bg-neutral-700 mx-auto mt-2.5 flex-shrink-0" />}

            <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-800 flex-shrink-0">
              <h2 className="text-sm font-semibold flex items-baseline gap-1.5 m-0">
                Comments <span className="text-neutral-500 font-medium text-xs">{totalCount}</span>
              </h2>
              <button onClick={closeModal} aria-label="Close comments" className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div ref={listRef} className="comments-scroll flex-1 min-h-0 overflow-y-auto px-4 pt-3 pb-1">
              {comments.map((c, idx) => (
                <CommentRow
                  key={c.id}
                  comment={c}
                  isReply={false}
                  delay={idx < SEED_TOP_LEVEL_COUNT ? 150 + idx * 70 : 0}
                  expanded={expandedReplies.has(c.id)}
                  onToggleExpand={() => toggleExpand(c.id)}
                  onReplyClick={() => openReplyBox(c.id)}
                  replyOpen={activeReplyId === c.id}
                  replyValue={activeReplyId === c.id ? replyText : ''}
                  onReplyChange={setReplyText}
                  onReplySubmit={() => submitReply(c.id)}
                  onLikeById={toggleLike}
                  pulseId={pulseId}
                  playingVoiceId={playingVoiceId}
                  onTogglePlay={togglePlay}
                />
              ))}
            </div>

            <div className="flex-shrink-0 border-t border-neutral-800 bg-neutral-900 px-3 py-2.5 relative">
              {emojiOpen && (
                <div ref={emojiRef} className="absolute left-3 right-3 bottom-full mb-2 bg-neutral-800 border border-neutral-700 rounded-2xl p-2.5 grid grid-cols-6 gap-1 shadow-xl">
                  {EMOJIS.map((e) => (
                    <button key={e} onClick={() => setInputValue((v) => v + e)} className="text-lg py-1.5 rounded-lg hover:bg-neutral-700 leading-none">
                      {e}
                    </button>
                  ))}
                </div>
              )}

              {!recording ? (
                <div className="flex items-center gap-1.5">
                  <button ref={emojiBtnRef} onClick={() => setEmojiOpen((o) => !o)} aria-label="Add emoji" className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 transition-colors">
                    <Smile size={19} />
                  </button>
                  <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submitComment(); } }}
                    type="text"
                    placeholder="Add a comment..."
                    className="flex-1 min-w-0 bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder-neutral-500 text-sm rounded-full px-3.5 py-2 focus:outline-none focus:border-neutral-500"
                  />
                  <button onClick={startRecording} aria-label="Record voice note" className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 transition-colors">
                    <Mic size={18} />
                  </button>
                  <button
                    onClick={submitComment}
                    disabled={!inputValue.trim()}
                    aria-label="Post comment"
                    className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full transition-colors ${inputValue.trim() ? 'text-red-500 hover:bg-neutral-800' : 'text-neutral-600'}`}
                  >
                    <Send size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 px-1">
                  <button onClick={cancelRecording} aria-label="Cancel recording" className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-neutral-800 text-neutral-400 hover:text-neutral-100 transition-colors">
                    <X size={15} />
                  </button>
                  <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 rec-dot-anim" />
                  <div className="flex-1 flex items-center h-6 min-w-0 overflow-hidden" style={{ gap: '2px' }}>
                    {liveBars.map((h, i) => (
                      <span key={i} className="flex-shrink-0 rounded-sm bg-red-500 rec-bar-anim" style={{ width: '2.5px', height: `${h}px`, animationDelay: `${-(i * 0.05)}s` }} />
                    ))}
                  </div>
                  <span className="text-xs text-neutral-400 flex-shrink-0 tabular-nums w-9">{formatTime(recordSeconds)}</span>
                  <button onClick={sendRecording} aria-label="Send voice note" className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-red-500 bg-opacity-20 text-red-500">
                    <Send size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}