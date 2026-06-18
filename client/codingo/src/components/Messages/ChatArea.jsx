import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, setInputText } from "../../redux/slices/chatSlice";
import { getAuthHeaders } from "../../utilites/communityHelper";
import axios from "axios";

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

export const ChatArea = () => {
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

  return (
    <div className="flex flex-1 flex-col bg-[#0b0b10] h-full relative">
      {/* Chat Header */}
      <div className="flex items-center flex-shrink-0 bg-[#0b0b10] border-b border-[#1c1c28] px-4 sm:px-6 py-3 sm:py-4 gap-3.5">
        <Avatar contact={contact} size={40} />
        <div className="flex-1">
          <div className="font-['DM_Sans'] font-bold text-[#eeeefc] tracking-[-0.01em] text-[15px] sm:text-[16px]">
            {contact.name}
          </div>
          <div
            className={`mt-px text-[12px] ${contact.online ? "text-[#4ade80]" : "text-[#44445a]"
              }`}
          >
            {contact.online ? "Active now" : "Offline"}
          </div>
        </div>
        <div className="flex gap-1">
          {[
            { title: "Call", path: "M22 16.92v3..." },
            { title: "Video", path: "m22 8-6 4..." },
            { title: "Info", path: "M12 22c5.523..." },
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 px-4 sm:px-7 py-4 sm:py-6">
        {/* Date label */}
        <div className="text-center mb-2">
          <span className="text-[11px] text-[#33334a] bg-[#14141c] px-3 py-1 rounded-[20px] border border-[#1e1e2c]">
            Today
          </span>
        </div>

        {msgs.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
          >
            {msg.from === "them" && (
              <div className="mr-2 self-end">
                <Avatar contact={contact} size={28} />
              </div>
            )}

            <div className="max-w-[68%]">
              <div
                className={`font-['DM_Sans'] text-[14px] leading-[1.5] px-[14px] py-[10px] ${msg.from === "me"
                  ? "bg-[#6C63FF] text-[#f0f0ff] rounded-[18px_18px_4px_18px]"
                  : "bg-[#1a1a26] text-[#d8d8ec] rounded-[18px_18px_18px_4px] border border-[#252535]"
                  }`}
              >
                {msg.text}
              </div>

              <div
                className={`text-[10.5px] text-[#33334a] mt-1 ${msg.from === "me" ? "text-right pr-1" : "text-left pl-1"
                  }`}
              >
                {msg.time}
                {msg.from === "me" && (
                  <span className="ml-1 text-[#6C63FF]">✓✓</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {/* <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar contact={contact} size={28} />
          <div style={{
            padding: "10px 16px", borderRadius: "18px 18px 18px 4px",
            background: "#1a1a26", border: "1px solid #252535",
            display: "flex", gap: 4, alignItems: "center",
          }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: "50%", background: "#44445a",
                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        </div> */}

      </div>

      {/* Attachment popup */}
      {/* {attachOpen && (
        <div style={{
          position: "absolute", bottom: 90, left: 24,
          background: "#16161f", border: "1px solid #2a2a3a",
          borderRadius: 16, padding: "12px 8px",
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4,
          zIndex: 10, minWidth: 180,
        }}>
          {attachOptions.map(opt => (
            <button key={opt.label} onClick={() => setAttachOpen(false)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              padding: "10px 8px", borderRadius: 10, background: "none", border: "none",
              cursor: "pointer", color: "#9898b8", fontSize: 11,
              fontFamily: "'DM Sans', sans-serif", transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#1e1e2c"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              <span style={{ fontSize: 22 }}>{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      )} */}

      {/* Input Bar */}
      <div className="flex items-center gap-2.5 flex-shrink-0 px-5 py-3.5 border-t border-[#1c1c28] bg-[#0b0b10]">
        {/* Emoji */}
        <button
          className="bg-none border-none cursor-pointer p-[6px] text-[#44445a] rounded-[8px] transition-colors duration-150 flex-shrink-0"
          onMouseEnter={(e) => (e.currentTarget.style.color = "#9898b8")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#44445a")}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 13s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </button>
        {/* Attachment */}
        {/* <button onClick={() => setAttachOpen(!attachOpen)} style={{
          background: attachOpen ? "#1e1e2e" : "none", border: "none", cursor: "pointer",
          padding: 6, color: attachOpen ? "#6C63FF" : "#44445a",
          borderRadius: 8, transition: "all 0.15s", flexShrink: 0,
        }}
          onMouseEnter={e => { if (!attachOpen) e.currentTarget.style.color = "#9898b8" }}
          onMouseLeave={e => { if (!attachOpen) e.currentTarget.style.color = "#44445a" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button> */}

        {/* Text Input */}
        <div className="flex-1 relative">
          <input
            value={inputText}
            onChange={(e) => dispatch(setInputText(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Write a message..."
            className="w-full px-[16px] py-[10px] bg-[#16161f] border border-[#2a2a3a] rounded-[24px] text-[#d0d0e0] text-[14px] font-['DM_Sans'] outline-none box-border transition-colors duration-150"
            onFocus={(e) => (e.target.style.borderColor = "#6C63FF44")}
            onBlur={(e) => (e.target.style.borderColor = "#2a2a3a")}
          />
        </div>

        {/* Voice Message */}
        <button
          className="bg-none border-none cursor-pointer p-[6px] text-[#44445a] rounded-[8px] transition-colors duration-150 flex-shrink-0"
          onMouseEnter={(e) => (e.currentTarget.style.color = "#9898b8")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#44445a")}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
        </button>


        {/* Send */}
        <button
          onClick={sendMessage}
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
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
          </svg>
        </button>

      </div>
    </div >
  );
}
