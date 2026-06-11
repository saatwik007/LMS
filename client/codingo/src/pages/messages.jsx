import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, setActiveContact, setInputText, setSearchQuery, fetchContacts } from "../redux/slices/chatSlice";

function Avatar({ contact, size = 40 }) {
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: contact.color + "22",
        border: `1.5px solid ${contact.color}55`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.32, fontWeight: 600,
        color: contact.color, letterSpacing: "0.02em",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {contact.initials}
      </div>
      {contact.online && (
        <div style={{
          position: "absolute", bottom: 1, right: 1,
          width: size * 0.26, height: size * 0.26,
          borderRadius: "50%", background: "#4ade80",
          border: "2px solid #0f0f13",
        }} />
      )}
    </div>
  );
}

function ContactList() {
  const dispatch = useDispatch();
  const { activeContactId, searchQuery, contacts } = useSelector(s => s.chat);

  const filtered = (contacts || []).filter(c =>
    c.name.toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  return (
    <div style={{
      width: 300, minWidth: 260, display: "flex", flexDirection: "column",
      height: "100%", background: "#0f0f13",
    }}>
      {/* Header */}
      <div style={{ padding: "24px 20px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#f0f0f5", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em" }}>
            Messages
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#555566", padding: 6, borderRadius: 8,
              transition: "color 0.15s",
            }}
              onMouseEnter={e => e.target.style.color = "#9898b8"}
              onMouseLeave={e => e.target.style.color = "#555566"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative" }}>
          <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#44445a" }}
            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={searchQuery}
            onChange={e => dispatch(setSearchQuery(e.target.value))}
            placeholder="Search"
            style={{
              width: "100%", padding: "8px 12px 8px 32px",
              background: "#1a1a24", border: "1px solid #2a2a3a",
              borderRadius: 10, color: "#d0d0e0", fontSize: 13,
              fontFamily: "'DM Sans', sans-serif", outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Contacts */}
      <div style={{ overflowY: "auto", flex: 1, padding: "0 8px" }}>
        {filtered.map(contact => (
          <button
            key={contact.id}
            onClick={() => dispatch(setActiveContact(contact.id))}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              width: "100%", padding: "10px 12px", borderRadius: 12,
              background: activeContactId === contact.id ? "#1e1e2e" : "none",
              border: "none", cursor: "pointer", textAlign: "left",
              marginBottom: 2, transition: "background 0.15s",
            }}
            onMouseEnter={e => { if (activeContactId !== contact.id) e.currentTarget.style.background = "#16161f" }}
            onMouseLeave={e => { if (activeContactId !== contact.id) e.currentTarget.style.background = "none" }}
          >
            <Avatar contact={contact} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#e8e8f2", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.01em" }}>
                  {contact.name}
                </span>
                <span style={{ fontSize: 11, color: "#44445a", flexShrink: 0, marginLeft: 8 }}>{contact.time}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12.5, color: "#555568", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 140 }}>
                  {contact.lastMsg}
                </span>
                {contact.unread > 0 && (
                  <span style={{
                    background: "#6C63FF", color: "#fff", fontSize: 10, fontWeight: 700,
                    borderRadius: 20, padding: "1px 6px", flexShrink: 0, marginLeft: 6,
                  }}>{contact.unread}</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatArea() {
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "ws://localhost:5000";
  const dispatch = useDispatch();
  const { activeContactId, inputText, messages, contacts } = useSelector(s => s.chat);
  const msgs = (messages && messages[activeContactId]) || [];
  const wsRef = useRef(null);
  const contact = (contacts || []).find(c => c.id === activeContactId) || { name: 'No one', initials: '?', color: '#6C63FF', online: false };
  
  useEffect(() => {
    wsRef.current = new WebSocket(SOCKET_URL);

    wsRef.current.onopen = () => console.log("WS connected");
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat-message") {
        dispatch(addMessage({ contactId: data.message.contactId, message: data.message }));
      }
    };

    wsRef.current.onclose = () => console.log("WS closed");
    wsRef.current.onerror = (err) => console.error("WS error", err);

    return () => wsRef.current?.close();
  }, [dispatch]);

  const sendMessage = () => {
    if (!inputText || !inputText.trim()) return;
    if (!activeContactId) return;

    const message = {
      id: Date.now(),
      contactId: activeContactId,
      from: "me",
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "chat-message", message }));
      }
    } catch (e) {
      console.error('WS send failed', e);
    }

    dispatch(addMessage({ contactId: activeContactId, message }));
    dispatch(setInputText(""));
  };
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0b0b10", height: "100%", position: "relative" }}>
      {/* Chat Header */}
      <div style={{
        padding: "16px 24px", display: "flex", alignItems: "center", gap: 14,
        borderBottom: "1px solid #1c1c28", flexShrink: 0, background: "#0b0b10",
      }}>
        <Avatar contact={contact} size={40} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#eeeefc", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.01em" }}>
            {contact.name}
          </div>
          <div style={{ fontSize: 12, color: contact.online ? "#4ade80" : "#44445a", marginTop: 1 }}>
            {contact.online ? "Active now" : "Offline"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { title: "Call", path: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.58a16 16 0 0 0 6.08 6.08l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" },
            { title: "Video", path: "m22 8-6 4 6 4V8Z M2 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z" },
            { title: "Info", path: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z M12 16v-4 M12 8h.01" },
          ].map(btn => (
            <button key={btn.title} title={btn.title} style={{
              background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: 8,
              color: "#44445a", transition: "color 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "#9898b8"}
              onMouseLeave={e => e.currentTarget.style.color = "#44445a"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={btn.path} />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Date label */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: "#33334a", background: "#14141c", padding: "4px 12px", borderRadius: 20, border: "1px solid #1e1e2c" }}>
            Today
          </span>
        </div>

        {msgs.map(msg => (
          <div key={msg.id} style={{
            display: "flex", justifyContent: msg.from === "me" ? "flex-end" : "flex-start",
          }}>
            {msg.from === "them" && (
              <div style={{ marginRight: 8, alignSelf: "flex-end" }}>
                <Avatar contact={contact} size={28} />
              </div>
            )}
            <div style={{ maxWidth: "68%" }}>
              <div style={{
                padding: "10px 14px", borderRadius: msg.from === "me" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: msg.from === "me" ? "#6C63FF" : "#1a1a26",
                color: msg.from === "me" ? "#f0f0ff" : "#d8d8ec",
                fontSize: 14, lineHeight: 1.5,
                fontFamily: "'DM Sans', sans-serif",
                border: msg.from === "me" ? "none" : "1px solid #252535",
              }}>
                {msg.text}
              </div>
              <div style={{ fontSize: 10.5, color: "#33334a", marginTop: 4, textAlign: msg.from === "me" ? "right" : "left", paddingLeft: msg.from === "them" ? 4 : 0, paddingRight: msg.from === "me" ? 4 : 0 }}>
                {msg.time}
                {msg.from === "me" && (
                  <span style={{ marginLeft: 4, color: "#6C63FF" }}>✓✓</span>
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
      <div style={{
        padding: "14px 20px", borderTop: "1px solid #1c1c28", background: "#0b0b10",
        display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
      }}>
        {/* Emoji */}
        <button style={{
          background: "none", border: "none", cursor: "pointer", padding: 6,
          color: "#44445a", borderRadius: 8, transition: "color 0.15s", flexShrink: 0,
        }}
          onMouseEnter={e => e.currentTarget.style.color = "#9898b8"}
          onMouseLeave={e => e.currentTarget.style.color = "#44445a"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
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
        <div style={{ flex: 1, position: "sticky" }}>
          <input
            value={inputText}
            onChange={e => dispatch(setInputText(e.target.value))}
            onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
            placeholder="Write a message..."
            style={{
              width: "100%", padding: "10px 16px",
              background: "#16161f", border: "1px solid #2a2a3a",
              borderRadius: 24, color: "#d0d0e0", fontSize: 14,
              fontFamily: "'DM Sans', sans-serif", outline: "none",
              boxSizing: "border-box", transition: "border-color 0.15s",
            }}
            onFocus={e => e.target.style.borderColor = "#6C63FF44"}
            onBlur={e => e.target.style.borderColor = "#2a2a3a"}
          />
        </div>

        {/* Voice Message */}
        <button style={{
          background: "none", border: "none", cursor: "pointer", padding: 6,
          color: "#44445a", borderRadius: 8, transition: "color 0.15s", flexShrink: 0,
        }}
          onMouseEnter={e => e.currentTarget.style.color = "#9898b8"}
          onMouseLeave={e => e.currentTarget.style.color = "#44445a"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
        </button>

        {/* Send */}
        <button onClick={sendMessage} style={{
          background: "#6C63FF", border: "none", cursor: "pointer",
          padding: 10, borderRadius: "50%", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, transition: "background 0.15s, transform 0.1s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "#5a52e0"; e.currentTarget.style.transform = "scale(1.05)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#6C63FF"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
          </svg>
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 4px; }
        input::placeholder { color: #33334a; }
      `}</style>
    </div>
  );
}

export default function MessagesPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchContacts());
  }, [dispatch]);

  return (
    <div style={{
      display: "flex", height: "100vh", background: "#0b0b10",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Left Sidebar — Contacts */}
      <ContactList />

      {/* Thin separator */}
      <div style={{ width: "1px", background: "#1c1c28", flexShrink: 0 }} />

      {/* Right — Chat Area */}
      <ChatArea />
    </div>
  );
}