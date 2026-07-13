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
    <div className="h-[calc(100vh-64px)] w-full bg-[#0b0b10]">
      {/* Mobile: stacked. Desktop: fixed 2-column split */}
      <div className="h-full w-full lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
        <ContactList />
        <ChatArea />
      </div>
    </div>
  );
}