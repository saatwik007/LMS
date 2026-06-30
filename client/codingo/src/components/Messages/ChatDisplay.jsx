import React, { useEffect, useRef } from 'react'
import gsap from "gsap";

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

export default ChatDisplay
