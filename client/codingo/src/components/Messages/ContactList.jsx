import { useDispatch, useSelector } from "react-redux";
import { setActiveContact, setSearchQuery } from "../../redux/slices/chatSlice";
import { Avatar } from "./ChatArea";

export const ContactList = () => {
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
            className="sticky"
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