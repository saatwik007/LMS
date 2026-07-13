import { useDispatch, useSelector } from "react-redux";
import { setActiveContact, setSearchQuery } from "../../redux/slices/chatSlice";
import { Avatar } from "./ChatArea";

export const ContactList = () => {
  const dispatch = useDispatch();
  const { activeContactId, searchQuery, contacts } = useSelector((s) => s.chat);

  const filtered = (contacts || []).filter((c) =>
    c.name.toLowerCase().includes((searchQuery || "").toLowerCase())
  );

  return (
<aside
  className={`${
    activeContactId ? "hidden lg:flex" : "flex"
  } h-full w-full lg:w-[320px] lg:min-w-[320px] lg:max-w-[320px] flex-col bg-[#0f0f13] border-r border-[#1c1c28]`}
>
      <div className="shrink-0 border-b border-[#1c1c28] px-4 sm:px-5 py-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#f0f0f5]">Messages</h2>
        </div>

        <div className="relative">
          <input
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            placeholder="Search"
            className="w-full rounded-xl border border-[#2a2a3a] bg-[#1a1a24] py-2 pl-9 pr-3 text-sm text-[#d0d0e0] outline-none"
          />
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#44445a]">⌕</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filtered.map((contact) => (
          <button
            key={contact.id}
            onClick={() => dispatch(setActiveContact(contact.id))}
            className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
              activeContactId === contact.id ? "bg-[#1e1e2e]" : "hover:bg-[#16161f]"
            }`}
          >
            <Avatar contact={contact} size={42} />
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex items-center justify-between">
                <span className="truncate text-sm font-semibold text-[#e8e8f2]">{contact.name}</span>
                <span className="ml-2 shrink-0 text-[11px] text-[#555568]">{contact.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="truncate text-xs text-[#777790]">{contact.lastMsg}</span>
                {contact.unread > 0 && (
                  <span className="ml-2 rounded-full bg-[#6C63FF] px-2 py-0.5 text-[10px] font-bold text-white">
                    {contact.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
};