// File path: ./src/components/ChatStream.tsx
import React, { useRef, useState } from "react";
import { ScrollControl } from "./scrollcontrol";
export const ChatStream = () => {
    const containerRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const startStream = async () => {
        const eventSource = new EventSource("/api/reasoning/stream");
        eventSource.onmessage = (event) => {
            setMessages((prev) => [...prev, event.data]);
        };
    };
    return (<div className="relative h-[600px] overflow-hidden flex flex-col bg-neutral-900 border border-neutral-800 rounded-lg">
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (<div key={idx} className="p-3 bg-neutral-800 text-neutral-100 rounded-md text-sm font-mono">
            {msg}
          </div>))}
        <ScrollControl containerRef={containerRef}/>
      </div>
      <button onClick={startStream} className="m-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium">
        Trigger Reasoning Stream
      </button>
    </div>);
};
export default ChatStream;
