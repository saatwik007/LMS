import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Avatar } from "./ChatArea";


// ─────────────────────────────────────────────────────────────────────────────
// CHAT HEADER — fixed, never scrolls
// ─────────────────────────────────────────────────────────────────────────────
 const ChatHeader = ({ contact }) => {
  const ref = useRef(null);
 
  useEffect(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, y: -16 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }
    );
  }, []);
 
  return (
    <div
      ref={ref}
      className="flex items-center flex-shrink-0 z-10 bg-[#0b0b10] border-b border-[#1c1c28] px-4 sm:px-6 py-3 sm:py-4 gap-3.5"
    >
      <Avatar contact={contact} size={40} />
      <div className="flex-1">
        <div className="font-['DM_Sans'] font-bold text-[#eeeefc] tracking-[-0.01em] text-[15px] sm:text-[16px]">
          {contact.name}
        </div>
        <div
          className={`mt-px text-[12px] ${
            contact.online ? "text-[#4ade80]" : "text-[#44445a]"
          }`}
        >
          {contact.online ? "Active now" : "Offline"}
        </div>
      </div>
      <div className="flex gap-1">
        {[
          {
            title: "Call",
            path: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.93 3.4 2 2 0 0 1 3.9 1.22h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.337 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z",
          },
          {
            title: "Video",
            path: "m22 8-6 4 6 4V8ZM2 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8Z",
          },
          {
            title: "Info",
            path: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10ZM12 8h.01M11 12h1v4h1",
          },
        ].map((btn) => (
          <button
            key={btn.title}
            title={btn.title}
            className="cursor-pointer p-2 rounded-lg text-[#44445a] transition-colors duration-150 hover:text-[#9898b8]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={btn.path} />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ChatHeader;