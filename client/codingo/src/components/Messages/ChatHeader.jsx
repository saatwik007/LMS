import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Avatar } from "./ChatArea";
import { useDispatch } from "react-redux";
import { setActiveContact } from "../../redux/slices/chatSlice";

const ChatHeader = ({ contact }) => {
  const ref = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    gsap.fromTo(ref.current, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" });
  }, []);

  return (
    <div
      ref={ref}
      className="flex shrink-0 items-center gap-3.5 border-b border-[#1c1c28] bg-[#0b0b10] px-3 sm:px-5 py-3 sm:py-4"
    >
      <button
        className="lg:hidden rounded-md p-1.5 text-[#7d7d9a] hover:text-white"
        onClick={() => dispatch(setActiveContact(null))}
        aria-label="Back to contacts"
      >
        ←
      </button>

      <Avatar contact={contact} size={40} />

      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] sm:text-[16px] font-bold text-[#eeeefc]">{contact.name}</div>
        <div className={`mt-px text-[12px] ${contact.online ? "text-[#4ade80]" : "text-[#44445a]"}`}>
          {contact.online ? "Active now" : "Offline"}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;