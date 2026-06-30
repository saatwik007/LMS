import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, setInputText } from "../../redux/slices/chatSlice";
import { getAuthHeaders } from "../../utilites/communityHelper";
import axios from "axios";
import gsap from "gsap";
import ChatHeader from "./ChatHeader";
import InputBar from "./ChatInput";

// ─────────────────────────────────────────────────────────────────────────────
// EMOJI PICKER
// ─────────────────────────────────────────────────────────────────────────────
const EMOJIS = [
  "😀","😂","😍","🥺","😎","🤔","😭","😅","🙏","❤️",
  "🔥","✨","👍","👀","💀","🎉","😤","🥳","💯","🫡",
  "😴","🤣","😇","🥰","😬","🤯","😱","🫠","💬","🚀",
];
 
function EmojiPicker({ onSelect, pickerRef }) {
  return (
    <div
      ref={pickerRef}
      style={{
        position: "absolute",
        bottom: "calc(100% + 10px)",
        left: 0,
        background: "#16161f",
        border: "1px solid #2a2a3a",
        borderRadius: 14,
        padding: "10px 8px",
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: 2,
        zIndex: 50,
        minWidth: 210,
        boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
        transformOrigin: "bottom left",
      }}
    >
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 20,
            padding: "5px 4px",
            borderRadius: 8,
            transition: "background 0.12s",
            lineHeight: 1,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#1e1e2c")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

export function Avatar({ contact, size = 40 }) {
  return (
    <div className="relative shrink-0">
      <div
        className={`
      flex items-center justify-center
      rounded-full
      font-['DM_Sans'] font-semibold tracking-[0.02em]
    `}
        style={{
          width: size,
          height: size,
          background: contact.color + "15",
          border: `1.5px solid ${contact.color}55`,
          fontSize: size * 0.32,
          color: contact.color,
        }}
      >
        {contact.initials}
      </div>

      {contact.online && (
        <div
          className="absolute rounded-full bg-[#4ade80] border-2 border-[#0f0f13]"
          style={{
            bottom: 1,
            right: 1,
            width: size * 0.26,
            height: size * 0.26,
          }}
        />
      )}
    </div>
  );
}

function MessageBubble({ msg, contact, animate }) {
  const ref  = useRef(null);
  const isMe = msg.from === "me";
 
  useEffect(() => {
    if (!animate || !ref.current) return;
    gsap.fromTo(ref.current,
      { opacity: 0, y: 10, scale: 0.88, transformOrigin: isMe ? "right bottom" : "left bottom" },
      { opacity: 1, y: 0,  scale: 1,    duration: 0.32, ease: "back.out(1.6)" }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
 
  return (
    <div ref={ref} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      {!isMe && (
        <div className="mr-2 self-end">
          <Avatar contact={contact} size={28} />
        </div>
      )}
      <div className="max-w-[68%]">
        <div
          className={`font-['DM_Sans'] text-[14px] leading-[1.5] px-[14px] py-[10px] ${
            isMe
              ? "bg-[#6C63FF] text-[#f0f0ff] rounded-[18px_18px_4px_18px]"
              : "bg-[#1a1a26] text-[#d8d8ec] rounded-[18px_18px_18px_4px] border border-[#252535]"
          }`}
        >
          {msg.text}
        </div>
        <div
          className={`text-[10.5px] text-[#33334a] mt-1 ${
            isMe ? "text-right pr-1" : "text-left pl-1"
          }`}
        >
          {msg.time}
          {isMe && <span className="ml-1 text-[#6C63FF]">✓✓</span>}
        </div>
      </div>
    </div>
  );
};

export const ChatArea = (
  setInputText,
) => {
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "ws://localhost:5000";
  const dispatch = useDispatch();
  const currentUser = useSelector(s => s.dashboard.currentUser);
  const { activeContactId, inputText, messages, contacts } = useSelector(s => s.chat);
  const msgs = (messages && messages[activeContactId]) || [];
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const wsRef = useRef(null);
  const contact = (contacts || []).find(c => c.id === activeContactId)
    || { name: 'No one', initials: '?', color: '#6C63FF', online: false };

  useEffect(() => {
    if (!activeContactId || !currentUser?.id) return;

    // Fetch msg via HTTP
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/chat/${activeContactId}`, {
          withCredentials: true, headers: getAuthHeaders()
        }); 
        // const data = await res.json();

        if (res.data.success && res.data.messages) {
          res.data.messages.forEach(msg => {
            dispatch(addMessage({
              contactId: msg.senderId === currentUser.id ? msg.recipientId : msg.senderId,
              message: {
                id: msg._id,
                senderId: msg.senderId,
                text: msg.content,
                time: new Date(msg.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                from: msg.senderId === currentUser.id ? "me" : "them"
              }
            }));
            console.log(res.data)
          })
        }
      } catch (error) {
        console.log('failes to fetch msg', error)
      }
    };

    fetchHistory();
  }, [activeContactId, currentUser?.id, dispatch, apiUrl]);

const fetchhistoryy = async () => {
  const res = await axios.get(`${apiUrl}/api/chat/${activeContactId}`, {
    withCredentials: true, headers: getAuthHeaders()
  });
  console.log(res.data)
}

  useEffect(() => {
    if (!currentUser?.id) return; // Don't connect if user isn't loaded yet

    wsRef.current = new WebSocket(SOCKET_URL);

    wsRef.current.onopen = () => {
      console.log("WS connected");

      // Register this user with the server immediately on connect
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "register",
          userId: currentUser.id,
        }))
      };
    };

    wsRef.current.onmessage = (event) => {
      console.log("📥 Message received from server:", JSON.stringify(event.data));
      try {
        const data = JSON.parse(event.data);

        if (data.type === "chat-message") {
          const { senderId, text, time, id } = data.message;
          const msg = { id, senderId, text, time, from: "them" };
          dispatch(addMessage({ contactId: senderId, message: msg }));
        }
      } catch (e) {
        console.error("WS parse error", e);
      }
    };

    wsRef.current.onclose = () => console.log("WS closed");
    wsRef.current.onerror = (err) => console.error("WS error", err);

    return () => wsRef.current?.close();
  }, [currentUser?.id]); // Re-run only if user changes

  const sendMessage = () => {
    console.log("wsRef.current?.readyState:", wsRef.current?.readyState, "WebSocket.OPEN:", WebSocket.OPEN);
    console.log("activeContactId:", activeContactId);
    console.log("currentUser.id:", currentUser?.id);
    console.log("inputText:", inputText);

    if (!inputText?.trim() || !activeContactId || !currentUser?.id) {
      console.log("❌ Early return - validation failed");
      return;
    }

    const message = {
      id: Date.now(),
      senderId: currentUser.id,       // ✅ required for server routing
      recipientId: activeContactId,    // ✅ required for server routing
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "chat-message", message }));
    } else {
      console.warn("WebSocket not open, message not sent");
      return;
    }

    // Optimistic update for sender's UI
    dispatch(addMessage({
      contactId: activeContactId,
      message: { ...message, from: "me" },
    }));
    dispatch(setInputText(""));
  };

   const scrollRef  = useRef(null);
  const prevLen    = useRef(msgs.length);
  const [newMsgIds, setNewMsgIds] = useState(() => new Set());
 
  // scroll to bottom + mark new bubbles whenever msgs grows
  useEffect(() => {
    if (msgs.length > prevLen.current) {
      const lastId = msgs[msgs.length - 1].id;
 
      setNewMsgIds((prev) => new Set(prev).add(lastId));
 
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          gsap.to(scrollRef.current, {
            scrollTop: scrollRef.current.scrollHeight,
            duration: 0.4,
            ease: "power2.out",
          });
        }
      });
 
      setTimeout(() => {
        setNewMsgIds((prev) => {
          const next = new Set(prev);
          next.delete(lastId);
          return next;
        });
      }, 600);
    }
    prevLen.current = msgs.length;
  }, [msgs]);

  const ChatDisplay = () => {
      const ref = useRef(null);
 
  // entrance fade-in
  useEffect(() => {
    gsap.fromTo(ref.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.35, ease: "power2.out", delay: 0.08 }
    );
  }, []);
    return (
       <div
      ref={ref}
      className="flex-1 overflow-y-auto relative flex flex-col gap-2.5 px-4 sm:px-7 py-4 sm:py-6"
      style={{ overscrollBehavior: "contain" }}
    >
      {/* Date label */}
      <div className="text-center mb-2">
        <span className="text-[11px] text-[#33334a] bg-[#14141c] px-3 py-1 rounded-[20px] border border-[#1e1e2c]">
          Today
        </span>
      </div>
 
      {msgs.map((msg) => (
        <MessageBubble
          key={msg.id}
          msg={msg}
          contact={contact}
          animate={newMsgIds.has(msg.id)}
        />
      ))}
 
      <button onClick={fetchhistoryy} className="text-white cursor-pointer">
        msg history
      </button>
    </div>
    )
  }

  return (
   /*
      KEY LAYOUT RULE:
      ─────────────────
      overflow-hidden on the root stops the page from ever scrolling.
      flex-col + h-full makes the three children stack vertically.
      Only <ChatDisplay> has flex-1 + overflow-y-auto — it grows to fill
      remaining space and is the sole scrollable region.
    */
    <div className="flex flex-1 flex-col bg-[#0b0b10] max-h-full overflow-hidden">
 
      {/* 1. Fixed header — flex-shrink-0, never scrolls */}
      <ChatHeader contact={contact} />
 
      {/* 2. Scrollable chat area — flex-1, only this moves */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        style={{ overscrollBehavior: "contain" }}
      >
        <ChatDisplay
          msgs={msgs}
          contact={contact}
          fetchhistoryy={fetchhistoryy}
          newMsgIds={newMsgIds}
        />
      </div>
 
      {/* 3. Fixed input bar — flex-shrink-0, never scrolls */}
      <InputBar
        inputText={inputText}
        dispatch={dispatch}
        setInputText={setInputText}
        sendMessage={sendMessage}
      />
 
    </div>
  );
}