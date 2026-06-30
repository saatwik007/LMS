import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

// ─────────────────────────────────────────────────────────────────────────────
// INPUT BAR — fixed, never scrolls
// ─────────────────────────────────────────────────────────────────────────────
const InputBar = ({ inputText, dispatch, setInputText, sendMessage }) => {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const pickerRef = useRef(null);
  const wrapRef = useRef(null);
  const sendRef = useRef(null);
  const inputRef = useRef(null);
  const barRef = useRef(null);

  const closeEmoji = () => {
    if (!pickerRef.current) { setEmojiOpen(false); return; }
    gsap.to(pickerRef.current, {
      opacity: 0, scale: 0.82, y: 6, duration: 0.16, ease: "power2.in",
      onComplete: () => setEmojiOpen(false),
    });
  };

  const handleEmojiSelect = (emoji) => {
    dispatch(setInputText(inputText + emoji));
    inputRef.current?.focus();
  };

  const handleSend = () => {
    gsap.fromTo(sendRef.current,
      { scale: 1 },
      {
        scale: 1.22, duration: 0.12, ease: "power2.out",
        onComplete: () => gsap.to(sendRef.current, { scale: 1, duration: 0.18, ease: "back.out(2)" })
      }
    );
    sendMessage();
  };

  // entrance animation
  useEffect(() => {
    gsap.fromTo(barRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power3.out", delay: 0.15 }
    );
  }, []);

  // animate emoji picker open
  useEffect(() => {
    if (emojiOpen && pickerRef.current) {
      gsap.fromTo(pickerRef.current,
        { opacity: 0, scale: 0.82, y: 6 },
        { opacity: 1, scale: 1, y: 0, duration: 0.22, ease: "back.out(1.8)" }
      );
    }
  }, [emojiOpen]);

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) closeEmoji();
    };
    if (emojiOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [emojiOpen]);

  return (
    <div
      ref={barRef}
      className="flex items-center gap-2.5 flex-shrink-0 px-5 py-3.5 border-t border-[#1c1c28] bg-[#0b0b10]"
    >
      {/* Emoji button + picker */}
      <div ref={wrapRef} style={{ position: "relative", flexShrink: 0 }}>
        <button
          onClick={() => (emojiOpen ? closeEmoji() : setEmojiOpen(true))}
          className="cursor-pointer p-[6px] rounded-[8px] transition-colors duration-150"
          style={{ background: "none", border: "none", color: emojiOpen ? "#6C63FF" : "#44445a" }}
          onMouseEnter={(e) => { if (!emojiOpen) e.currentTarget.style.color = "#9898b8"; }}
          onMouseLeave={(e) => { if (!emojiOpen) e.currentTarget.style.color = "#44445a"; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 13s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </button>
        {emojiOpen && <EmojiPicker onSelect={handleEmojiSelect} pickerRef={pickerRef} />}
      </div>

      {/* Text input */}
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          value={inputText}
          onChange={(e) => dispatch(setInputText(e.target.value))}
          onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
          placeholder="Write a message..."
          className="w-full px-[16px] py-[10px] bg-[#16161f] border border-[#2a2a3a] rounded-[24px] text-[#d0d0e0] text-[14px] font-['DM_Sans'] outline-none box-border transition-colors duration-150"
          onFocus={(e) => (e.target.style.borderColor = "#6C63FF44")}
          onBlur={(e) => (e.target.style.borderColor = "#2a2a3a")}
        />
      </div>

      {/* Voice */}
      <button
        className="cursor-pointer p-[6px] rounded-[8px] transition-colors duration-150 flex-shrink-0"
        style={{ background: "none", border: "none", color: "#44445a" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#9898b8")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#44445a")}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
      </button>

      {/* Send */}
      <button
        ref={sendRef}
        onClick={handleSend}
        className="bg-[#6C63FF] border-none cursor-pointer p-[10px] rounded-full text-white flex items-center justify-center flex-shrink-0 transition duration-150 ease-in-out"
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#5a52e0";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#6C63FF";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </svg>
      </button>
    </div>
  );
}

export default InputBar;