import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, setInputText } from "../../redux/slices/chatSlice";
import { getAuthHeaders } from "../../utilites/communityHelper";
import axios from "axios";
import gsap from "gsap";
import ChatHeader from "./ChatHeader";
import InputBar from "./ChatInput";
import ChatDisplay from "./ChatDisplay";

export function Avatar({ contact, size = 40 }) {
  return (
    <div className="relative shrink-0">
      <div
        className="flex items-center justify-center rounded-full font-semibold tracking-[0.02em]"
        style={{
          width: size,
          height: size,
          background: `${contact.color}15`,
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
          style={{ bottom: 1, right: 1, width: size * 0.26, height: size * 0.26 }}
        />
      )}
    </div>
  );
}

function MessageBubble({ msg, contact, animate }) {
  const ref = useRef(null);
  const isMe = msg.from === "me";

  useEffect(() => {
    if (!animate || !ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 10, scale: 0.88, transformOrigin: isMe ? "right bottom" : "left bottom" },
      { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: "back.out(1.6)" }
    );
  }, [animate, isMe]);

  return (
    <div ref={ref} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      {!isMe && (
        <div className="mr-2 self-end">
          <Avatar contact={contact} size={28} />
        </div>
      )}
      <div className="max-w-[85%] sm:max-w-[72%]">
        <div
          className={`px-3.5 py-2.5 text-[13px] sm:text-[14px] leading-[1.5] break-words ${
            isMe
              ? "bg-[#6C63FF] text-[#f0f0ff] rounded-[18px_18px_4px_18px]"
              : "bg-[#1a1a26] text-[#d8d8ec] rounded-[18px_18px_18px_4px] border border-[#252535]"
          }`}
        >
          {msg.text}
        </div>
        <div className={`mt-1 text-[10.5px] text-[#33334a] ${isMe ? "text-right pr-1" : "text-left pl-1"}`}>
          {msg.time}
          {isMe && <span className="ml-1 text-[#6C63FF]">✓✓</span>}
        </div>
      </div>
    </div>
  );
}

export const ChatArea = () => {
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "ws://localhost:5000";
  const apiUrl = import.meta.env.VITE_API_URL || "";

  const dispatch = useDispatch();
  const wsRef = useRef(null);
  const scrollRef = useRef(null);

  const currentUser = useSelector((s) => s.dashboard.currentUser);
  const { activeContactId, inputText, messages, contacts } = useSelector((s) => s.chat);

  const msgs = (messages && messages[activeContactId]) || [];
  const contact =
    (contacts || []).find((c) => c.id === activeContactId) || {
      name: "No one",
      initials: "?",
      color: "#6C63FF",
      online: false,
    };

  const prevLen = useRef(msgs.length);
  const [newMsgIds, setNewMsgIds] = useState(() => new Set());

  useEffect(() => {
    if (!activeContactId || !currentUser?.id) return;

    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/chat/${activeContactId}`, {
          withCredentials: true,
          headers: getAuthHeaders(),
        });

        if (res.data.success && res.data.messages) {
          res.data.messages.forEach((msg) => {
            dispatch(
              addMessage({
                contactId: msg.senderId === currentUser.id ? msg.recipientId : msg.senderId,
                message: {
                  id: msg._id,
                  senderId: msg.senderId,
                  text: msg.content,
                  time: new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  from: msg.senderId === currentUser.id ? "me" : "them",
                },
              })
            );
          });
        }
      } catch (error) {
        console.log("failed to fetch msg", error);
      }
    };

    fetchHistory();
  }, [activeContactId, currentUser?.id, dispatch, apiUrl]);

  useEffect(() => {
    if (!currentUser?.id) return;

    wsRef.current = new WebSocket(SOCKET_URL);

    wsRef.current.onopen = () => {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "register", userId: currentUser.id }));
      }
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "chat-message") {
          const { senderId, text, time, id } = data.message;
          dispatch(addMessage({ contactId: senderId, message: { id, senderId, text, time, from: "them" } }));
        }
      } catch (e) {
        console.error("WS parse error", e);
      }
    };

    return () => wsRef.current?.close();
  }, [SOCKET_URL, currentUser?.id, dispatch]);

  const sendMessage = () => {
    if (!inputText?.trim() || !activeContactId || !currentUser?.id) return;

    const message = {
      id: Date.now(),
      senderId: currentUser.id,
      recipientId: activeContactId,
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    if (wsRef.current?.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: "chat-message", message }));

    dispatch(addMessage({ contactId: activeContactId, message: { ...message, from: "me" } }));
    dispatch(setInputText(""));
  };

  useEffect(() => {
    if (msgs.length > prevLen.current) {
      const lastId = msgs[msgs.length - 1].id;
      setNewMsgIds((prev) => new Set(prev).add(lastId));

      requestAnimationFrame(() => {
        if (scrollRef.current) {
          gsap.to(scrollRef.current, {
            scrollTop: scrollRef.current.scrollHeight,
            duration: 0.35,
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

  return (
    <div className={`${activeContactId ? "flex" : "hidden lg:flex"} min-w-0 h-full flex-1 flex-col bg-[#0b0b10]`}>
      <ChatHeader contact={contact} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <ChatDisplay
          msgs={msgs}
          contact={contact}
          newMsgIds={newMsgIds}
          MessageBubble={MessageBubble}
        />
      </div>

      <InputBar
        inputText={inputText}
        dispatch={dispatch}
        setInputText={setInputText}
        sendMessage={sendMessage}
      />
    </div>
  );
};