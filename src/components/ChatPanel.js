import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronDown, Download, Menu, PanelRightOpen, User, Cpu, Mic, Square } from 'lucide-react';
import { MODEL_LIST, modelMeta } from '@/lib/models';
import Model from './Model';
import { Greeting } from './Greeting';
export default function ChatPanel({ messages, model, onModelChange, sending, liveText, liveModel, onSend, onExport, activeTitle, onOpenLeft, onOpenRight, voiceState, voiceInterim, voiceSupported, onVoiceToggle, }) {
    const [input, setInput] = useState('');
    const [modelOpen, setModelOpen] = useState(false);
    const [voiceHint, setVoiceHint] = useState(false);
    const scrollRef = useRef(null);
    const textareaRef = useRef(null);
    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, []);
    useEffect(() => {
        scrollToBottom();
    }, [messages, liveText, scrollToBottom]);
    // Sync voice interim text into the input field
    useEffect(() => {
        if (voiceState === 'listening' && voiceInterim) {
            setInput(voiceInterim);
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
            }
        }
    }, [voiceInterim, voiceState]);
    // Show hint tooltip briefly
    useEffect(() => {
        if (voiceState === 'listening') {
            setVoiceHint(true);
            const t = setTimeout(() => setVoiceHint(false), 3000);
            return () => clearTimeout(t);
        }
    }, [voiceState]);
    const handleSubmit = () => {
        const text = input.trim();
        if (!text || sending)
            return;
        onSend(text);
        setInput('');
        if (textareaRef.current)
            textareaRef.current.style.height = 'auto';
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };
    const autoGrow = (e) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    };
    const currentMeta = modelMeta(sending ? liveModel : model);
    const isListening = voiceState === 'listening';
    return (_jsxs("div", { className: "h-full glass rounded-2xl flex flex-col overflow-hidden corner-brackets relative", children: [sending && _jsx("div", { className: "scan-line" }), _jsx(AnimatePresence, { children: isListening && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "absolute top-0 left-0 right-0 z-20 pointer-events-none", children: _jsx("div", { className: "flex items-center justify-center pt-1", children: _jsxs("div", { className: "flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 backdrop-blur-sm", children: [_jsxs("span", { className: "relative flex h-2 w-2", children: [_jsx("span", { className: "absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 animate-ping" }), _jsx("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-cyan-400" })] }), _jsx("span", { className: "text-[10px] font-mono text-cyan-200 uppercase tracking-wider", children: "Listening" })] }) }) })) }), _jsxs("div", { className: "px-4 py-3 border-b border-cyan-500/15 flex items-center gap-3", children: [_jsx("button", { onClick: onOpenLeft, className: "lg:hidden p-1.5 rounded-lg hover:bg-cyan-500/10 text-ink-400", children: _jsx(Menu, { size: 18 }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h2", { className: "text-sm font-medium text-ink-200 truncate", children: activeTitle || 'New Thread' }), _jsxs("div", { className: "flex items-center gap-1.5 mt-0.5", children: [_jsx("span", { className: `status-dot ${sending ? 'thinking' : isListening ? 'thinking' : 'online'}` }), _jsx("span", { className: "text-[10px] text-ink-500 font-mono uppercase tracking-wider", children: sending
                                            ? currentMeta.label + ' · reasoning'
                                            : isListening
                                                ? 'voice active'
                                                : 'idle · ready' })] })] }), _jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setModelOpen(!modelOpen), disabled: sending, className: "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ink-800/60 border border-cyan-500/20 text-xs font-mono text-ink-200 hover:border-cyan-500/40 transition-colors disabled:opacity-50", children: [_jsx(Cpu, { size: 13, style: { color: currentMeta.color } }), _jsx("span", { className: "hidden sm:inline", children: currentMeta.label }), _jsx("span", { className: "sm:hidden", children: currentMeta.short }), _jsx(ChevronDown, { size: 12, className: `transition-transform ${modelOpen ? 'rotate-180' : ''}` })] }), _jsx(AnimatePresence, { children: modelOpen && (_jsx(motion.div, { initial: { opacity: 0, y: -8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.15 }, className: "absolute right-0 top-full mt-2 w-64 glass rounded-xl overflow-hidden z-50 shadow-2xl", children: MODEL_LIST.map((m) => (_jsx(Model, { model: m, selected: model === m.id, onSelect: () => {
                                            onModelChange(m.id);
                                            setModelOpen(false);
                                        } }, m.id))) })) })] }), _jsx("button", { onClick: onExport, disabled: messages.length === 0, className: "p-1.5 rounded-lg hover:bg-cyan-500/10 text-ink-400 hover:text-cyan-300 transition-colors disabled:opacity-30", title: "Export thread as Markdown", children: _jsx(Download, { size: 16 }) }), _jsx("button", { onClick: onOpenRight, className: "lg:hidden p-1.5 rounded-lg hover:bg-cyan-500/10 text-ink-400", children: _jsx(PanelRightOpen, { size: 18 }) })] }), _jsxs("div", { ref: scrollRef, className: "flex-1 overflow-y-auto px-4 py-4 space-y-4", children: [messages.length === 0 && !sending && (_jsxs("div", { className: "h-full flex flex-col items-center justify-center text-center px-8", children: [_jsx(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.4 }, className: "mb-6", children: _jsxs("div", { className: "relative w-20 h-20 mx-auto", children: [_jsx("div", { className: "absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-emerald-400/10 blur-xl animate-pulse-slow" }), _jsx("div", { className: "relative w-20 h-20 rounded-2xl bg-ink-900/80 border border-cyan-500/30 flex items-center justify-center", children: _jsx("span", { className: "font-display font-black text-3xl text-cyan-400 glow-cyan", children: "R" }) })] }) }), _jsx(Greeting, { name: "RYANAI", subtitle: "Autonomous reasoning engine initialized. I plan, execute tools, and resolve complex multi-step workflows with persistent memory and full observability." }), _jsx("p", { className: "text-[11px] text-ink-600 mt-4 font-mono", children: "Ask me anything to begin the reasoning pipeline" }), voiceSupported && (_jsxs("div", { className: "mt-6 flex items-center gap-2 text-[10px] text-ink-600 font-mono", children: [_jsx(Mic, { size: 12, className: "text-cyan-500" }), _jsx("span", { children: "Tip: tap the microphone to speak commands or dictate messages" })] }))] })), messages.map((msg) => (_jsx(MessageBubble, { message: msg }, msg.id))), sending && (_jsxs("div", { className: "flex gap-3 fade-in", children: [_jsx("div", { className: "shrink-0 w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center", children: _jsx("span", { className: "font-display font-bold text-xs text-cyan-300", children: "R" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "flex items-center gap-2 mb-1", children: _jsxs("span", { className: "text-[10px] font-mono text-cyan-400 uppercase tracking-wider", children: ["RyanAI \u00B7 ", modelMeta(liveModel).label] }) }), _jsx("div", { className: `text-sm text-ink-200 leading-relaxed whitespace-pre-wrap ${liveText ? '' : 'typing-cursor'}`, dangerouslySetInnerHTML: { __html: formatContent(liveText || '') } })] })] }))] }), _jsx(AnimatePresence, { children: voiceHint && (_jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 10 }, className: "absolute bottom-20 left-1/2 -translate-x-1/2 z-30 px-3 py-2 rounded-lg glass text-[10px] font-mono text-cyan-200 whitespace-nowrap", children: "Say a command: \"new thread\" \u00B7 \"switch to gemini\" \u00B7 \"export thread\" \u00B7 \"open memory\"" })) }), _jsxs("div", { className: "px-4 py-3 border-t border-cyan-500/15", children: [_jsxs("div", { className: "flex items-end gap-2", children: [voiceSupported && (_jsx("button", { onClick: onVoiceToggle, disabled: sending, className: `shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 ${isListening
                                    ? 'bg-cyan-500/25 border border-cyan-400/50 text-cyan-300 animate-pulse'
                                    : voiceState === 'error'
                                        ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                                        : 'bg-ink-800/50 border border-cyan-500/20 text-ink-400 hover:text-cyan-300 hover:border-cyan-500/40'}`, title: isListening ? 'Stop listening' : 'Start voice command', children: isListening ? _jsx(Square, { size: 14, fill: "currentColor" }) : _jsx(Mic, { size: 16 }) })), _jsx("div", { className: "flex-1 relative", children: _jsx("textarea", { ref: textareaRef, value: input, onChange: autoGrow, onKeyDown: handleKeyDown, rows: 1, placeholder: isListening ? 'Listening...' : 'Send a message to RyanAI...', disabled: sending, className: `w-full resize-none bg-ink-800/50 border rounded-xl px-4 py-3 text-sm text-ink-200 placeholder:text-ink-600 focus:outline-none transition-all disabled:opacity-50 ${isListening
                                        ? 'border-cyan-400/50 ring-1 ring-cyan-500/30 focus:ring-cyan-500/40'
                                        : 'border-cyan-500/20 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30'}` }) }), _jsx("button", { onClick: handleSubmit, disabled: !input.trim() || sending, className: "shrink-0 w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 btn-glow hover:bg-cyan-500/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed", children: _jsx(Send, { size: 16, strokeWidth: 2.5 }) })] }), _jsx("p", { className: "text-[9px] text-ink-600 mt-2 font-mono text-center", children: voiceSupported
                            ? 'RyanAI can use tools · Enter to send · Shift+Enter for newline · Tap mic for voice commands'
                            : 'RyanAI can use tools · Enter to send · Shift+Enter for newline' })] })] }));
}
function MessageBubble({ message }) {
    const isUser = message.role === 'user';
    const meta = modelMeta(message.model);
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.2 }, className: `flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`, children: [_jsx("div", { className: `shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${isUser
                    ? 'bg-ink-700/60 border border-ink-600'
                    : 'bg-cyan-500/15 border border-cyan-500/30'}`, children: isUser ? (_jsx(User, { size: 13, className: "text-ink-400" })) : (_jsx("span", { className: "font-display font-bold text-xs text-cyan-300", children: "R" })) }), _jsxs("div", { className: `flex-1 min-w-0 ${isUser ? 'text-right' : ''}`, children: [_jsx("div", { className: `flex items-center gap-2 mb-1 ${isUser ? 'justify-end' : ''}`, children: _jsx("span", { className: "text-[10px] font-mono uppercase tracking-wider text-ink-500", children: isUser ? 'Operator' : `RyanAI · ${meta.label}` }) }), _jsx("div", { className: `text-sm leading-relaxed whitespace-pre-wrap inline-block text-left ${isUser ? 'text-ink-300' : 'text-ink-200'}`, dangerouslySetInnerHTML: { __html: formatContent(message.content) } })] })] }));
}
function formatContent(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-cyan-200">$1</strong>')
        .replace(/`(.+?)`/g, '<code class="font-mono text-xs text-emerald-300 bg-ink-800/60 px-1.5 py-0.5 rounded">$1</code>')
        .replace(/\*(.+?)\*/g, '<em class="text-ink-400">$1</em>');
}
