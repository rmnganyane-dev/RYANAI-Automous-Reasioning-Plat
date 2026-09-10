import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// File path: ./src/components/ChatStream.tsx
import { useRef, useState } from "react";
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
    return (_jsxs("div", { className: "relative h-[600px] overflow-hidden flex flex-col bg-neutral-900 border border-neutral-800 rounded-lg", children: [_jsxs("div", { ref: containerRef, className: "flex-1 overflow-y-auto p-4 space-y-3", children: [messages.map((msg, idx) => (_jsx("div", { className: "p-3 bg-neutral-800 text-neutral-100 rounded-md text-sm font-mono", children: msg }, idx))), _jsx(ScrollControl, { containerRef: containerRef })] }), _jsx("button", { onClick: startStream, className: "m-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium", children: "Trigger Reasoning Stream" })] }));
};
export default ChatStream;
