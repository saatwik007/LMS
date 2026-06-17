import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, setActiveContact, setInputText, setSearchQuery, fetchContacts } from "../redux/slices/chatSlice";
import { ChatArea } from "../components/Messages/ChatArea";
import { ContactList } from "../components/Messages/ContactList";

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