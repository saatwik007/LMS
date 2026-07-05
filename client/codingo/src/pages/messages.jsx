import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchContacts } from "../redux/slices/chatSlice";
import { ChatArea } from "../components/Messages/ChatArea";
import { ContactList } from "../components/Messages/ContactList";

export default function MessagesPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchContacts());
  }, [dispatch]);

  return (
    <div className="flex max-h-screen bg-[#0b0b10] font-['DM_Sans']">
      {/* Left Sidebar — Contacts */}
      <ContactList />

      {/* Thin separator */}
      <div className="w-px bg-[#1c1c28] shrink-0" />

      {/* Right — Chat Area */}
      <ChatArea />
    </div>
  );
}