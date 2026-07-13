import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const EMOJIS = ["😀","😂","😍","🥺","😎","🤔","😭","😅","🙏","❤️","🔥","✨","👍","👀","💀","🎉","😤","🥳","💯","🫡"];

function EmojiPicker({ onSelect, pickerRef }) {
  return (
    <div
      ref={pickerRef}
      className="absolute bottom-[calc(100%+10px)] left-0 z-50 grid min-w-[210px] grid-cols-6 gap-1 rounded-xl border border-[#2a2a3a] bg-[#16161f] p-2 shadow-2xl"
    >
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className="rounded-md p-1 text-xl leading-none hover:bg-[#1e1e2c]"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

const InputBar = ({ inputText, dispatch, setInputText, sendMessage }) => {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const pickerRef = useRef(null);
  const wrapRef = useRef(null);
  const sendRef = useRef(null);
  const inputRef = useRef(null);
  const barRef = useRef(null);

  const closeEmoji = () => {
    if (!pickerRef.current) return setEmojiOpen(false);
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
    gsap.fromTo(sendRef.current, { scale: 1 }, { scale: 1.12, duration: 0.1, yoyo: true, repeat: 1 });
    sendMessage();
  };

  useEffect(() => {
    gsap.fromTo(barRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: "power3.out" });
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) closeEmoji();
    };
    if (emojiOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [emojiOpen]);

  return (
    <div ref={barRef} className="shrink-0 border-t border-[#1c1c28] bg-[#0b0b10] px-3 sm:px-5 py-3">
      <div className="flex items-center gap-2.5">
        <div ref={wrapRef} className="relative shrink-0">
          <button
            onClick={() => (emojiOpen ? closeEmoji() : setEmojiOpen(true))}
            className={`rounded-lg p-2 ${emojiOpen ? "text-[#6C63FF]" : "text-[#44445a] hover:text-[#9898b8]"}`}
          >
            😊
          </button>
          {emojiOpen && <EmojiPicker onSelect={handleEmojiSelect} pickerRef={pickerRef} />}
        </div>

        <input
          ref={inputRef}
          value={inputText}
          onChange={(e) => dispatch(setInputText(e.target.value))}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Write a message..."
          className="h-11 flex-1 rounded-full border border-[#2a2a3a] bg-[#16161f] px-4 text-[14px] text-[#d0d0e0] outline-none focus:border-[#6C63FF55]"
        />

        <button
          ref={sendRef}
          onClick={handleSend}
          className="grid h-11 w-11 place-items-center rounded-full bg-[#6C63FF] text-white hover:bg-[#5a52e0]"
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default InputBar;