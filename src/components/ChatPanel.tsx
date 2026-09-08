import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronDown, Download, Menu, PanelRightOpen, User, Cpu, Mic, MicOff, Square } from 'lucide-react';
import type { Message, ModelId } from '@/lib/types';
import { MODEL_LIST, modelMeta } from '@/lib/models';

interface ChatPanelProps {
  messages: Message[];
  model: ModelId;
  onModelChange: (m: ModelId) => void;
  sending: boolean;
  liveText: string;
  liveModel: ModelId;
  onSend: (text: string) => void;
  onExport: () => void;
  activeTitle?: string;
  onOpenLeft: () => void;
  onOpenRight: () => void;
  voiceState: 'idle' | 'listening' | 'error' | 'unsupported';
  voiceInterim: string;
  voiceSupported: boolean;
  onVoiceToggle: () => void;
  onVoiceCommand: (command: string, args: string) => void;
}

export default function ChatPanel({
  messages,
  model,
  onModelChange,
  sending,
  liveText,
  liveModel,
  onSend,
  onExport,
  activeTitle,
  onOpenLeft,
  onOpenRight,
  voiceState,
  voiceInterim,
  voiceSupported,
  onVoiceToggle,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [modelOpen, setModelOpen] = useState(false);
  const [voiceHint, setVoiceHint] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    if (!text || sending) return;
    onSend(text);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const autoGrow = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const currentMeta = modelMeta(sending ? liveModel : model);
  const isListening = voiceState === 'listening';

  return (
    <div className="h-full glass rounded-2xl flex flex-col overflow-hidden corner-brackets relative">
      {/* Scan line effect */}
      {sending && <div className="scan-line" />}

      {/* Voice listening pulse overlay */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 z-20 pointer-events-none"
          >
            <div className="flex items-center justify-center pt-1">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                </span>
                <span className="text-[10px] font-mono text-cyan-200 uppercase tracking-wider">Listening</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-4 py-3 border-b border-cyan-500/15 flex items-center gap-3">
        <button
          onClick={onOpenLeft}
          className="lg:hidden p-1.5 rounded-lg hover:bg-cyan-500/10 text-ink-400"
        >
          <Menu size={18} />
        </button>

        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-medium text-ink-200 truncate">
            {activeTitle || 'New Thread'}
          </h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`status-dot ${sending ? 'thinking' : isListening ? 'thinking' : 'online'}`} />
            <span className="text-[10px] text-ink-500 font-mono uppercase tracking-wider">
              {sending
                ? currentMeta.label + ' · reasoning'
                : isListening
                  ? 'voice active'
                  : 'idle · ready'}
            </span>
          </div>
        </div>

        {/* Model selector */}
        <div className="relative">
          <button
            onClick={() => setModelOpen(!modelOpen)}
            disabled={sending}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ink-800/60 border border-cyan-500/20 text-xs font-mono text-ink-200 hover:border-cyan-500/40 transition-colors disabled:opacity-50"
          >
            <Cpu size={13} style={{ color: currentMeta.color }} />
            <span className="hidden sm:inline">{currentMeta.label}</span>
            <span className="sm:hidden">{currentMeta.short}</span>
            <ChevronDown size={12} className={`transition-transform ${modelOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {modelOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-64 glass rounded-xl overflow-hidden z-50 shadow-2xl"
              >
                {MODEL_LIST.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onModelChange(m.id);
                      setModelOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-cyan-500/10 transition-colors border-b border-cyan-500/10 last:border-0 ${
                      model === m.id ? 'bg-cyan-500/5' : ''
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: m.color + '20', border: `1px solid ${m.color}40` }}
                    >
                      <Cpu size={14} style={{ color: m.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-ink-200">{m.label}</p>
                      <p className="text-[10px] text-ink-500 mt-0.5">{m.vendor}</p>
                      <p className="text-[9px] text-ink-600 mt-0.5">{m.description}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={onExport}
          disabled={messages.length === 0}
          className="p-1.5 rounded-lg hover:bg-cyan-500/10 text-ink-400 hover:text-cyan-300 transition-colors disabled:opacity-30"
          title="Export thread as Markdown"
        >
          <Download size={16} />
        </button>
        <button
          onClick={onOpenRight}
          className="lg:hidden p-1.5 rounded-lg hover:bg-cyan-500/10 text-ink-400"
        >
          <PanelRightOpen size={18} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !sending && (
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-emerald-400/10 blur-xl animate-pulse-slow" />
                <div className="relative w-20 h-20 rounded-2xl bg-ink-900/80 border border-cyan-500/30 flex items-center justify-center">
                  <span className="font-display font-black text-3xl text-cyan-400 glow-cyan">R</span>
                </div>
              </div>
            </motion.div>
            <h3 className="font-display font-bold text-lg text-cyan-200 mb-2 glow-cyan">RYANAI</h3>
            <p className="text-sm text-ink-400 max-w-md leading-relaxed">
              Autonomous reasoning engine initialized. I plan, execute tools, and resolve
              complex multi-step workflows with persistent memory and full observability.
            </p>
            <p className="text-[11px] text-ink-600 mt-4 font-mono">
              Ask me anything to begin the reasoning pipeline
            </p>
            {voiceSupported && (
              <div className="mt-6 flex items-center gap-2 text-[10px] text-ink-600 font-mono">
                <Mic size={12} className="text-cyan-500" />
                <span>Tip: tap the microphone to speak commands or dictate messages</span>
              </div>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Live streaming response */}
        {sending && (
          <div className="flex gap-3 fade-in">
            <div className="shrink-0 w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
              <span className="font-display font-bold text-xs text-cyan-300">R</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                  RyanAI · {modelMeta(liveModel).label}
                </span>
              </div>
              <div
                className={`text-sm text-ink-200 leading-relaxed whitespace-pre-wrap ${liveText ? '' : 'typing-cursor'}`}
                dangerouslySetInnerHTML={{ __html: formatContent(liveText || '') }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Voice hint tooltip */}
      <AnimatePresence>
        {voiceHint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 px-3 py-2 rounded-lg glass text-[10px] font-mono text-cyan-200 whitespace-nowrap"
          >
            Say a command: "new thread" · "switch to gemini" · "export thread" · "open memory"
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="px-4 py-3 border-t border-cyan-500/15">
        <div className="flex items-end gap-2">
          {/* Voice button */}
          {voiceSupported && (
            <button
              onClick={onVoiceToggle}
              disabled={sending}
              className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 ${
                isListening
                  ? 'bg-cyan-500/25 border border-cyan-400/50 text-cyan-300 animate-pulse'
                  : voiceState === 'error'
                    ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                    : 'bg-ink-800/50 border border-cyan-500/20 text-ink-400 hover:text-cyan-300 hover:border-cyan-500/40'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice command'}
            >
              {isListening ? <Square size={14} fill="currentColor" /> : <Mic size={16} />}
            </button>
          )}

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={autoGrow}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={isListening ? 'Listening...' : 'Send a message to RyanAI...'}
              disabled={sending}
              className={`w-full resize-none bg-ink-800/50 border rounded-xl px-4 py-3 text-sm text-ink-200 placeholder:text-ink-600 focus:outline-none transition-all disabled:opacity-50 ${
                isListening
                  ? 'border-cyan-400/50 ring-1 ring-cyan-500/30 focus:ring-cyan-500/40'
                  : 'border-cyan-500/20 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30'
              }`}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || sending}
            className="shrink-0 w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 btn-glow hover:bg-cyan-500/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send size={16} strokeWidth={2.5} />
          </button>
        </div>
        <p className="text-[9px] text-ink-600 mt-2 font-mono text-center">
          {voiceSupported
            ? 'RyanAI can use tools · Enter to send · Shift+Enter for newline · Tap mic for voice commands'
            : 'RyanAI can use tools · Enter to send · Shift+Enter for newline'}
        </p>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const meta = modelMeta(message.model);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
        isUser
          ? 'bg-ink-700/60 border border-ink-600'
          : 'bg-cyan-500/15 border border-cyan-500/30'
      }`}>
        {isUser ? (
          <User size={13} className="text-ink-400" />
        ) : (
          <span className="font-display font-bold text-xs text-cyan-300">R</span>
        )}
      </div>
      <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
        <div className={`flex items-center gap-2 mb-1 ${isUser ? 'justify-end' : ''}`}>
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-500">
            {isUser ? 'Operator' : `RyanAI · ${meta.label}`}
          </span>
        </div>
        <div
          className={`text-sm leading-relaxed whitespace-pre-wrap inline-block text-left ${
            isUser ? 'text-ink-300' : 'text-ink-200'
          }`}
          dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
        />
      </div>
    </motion.div>
  );
}

function formatContent(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-cyan-200">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="font-mono text-xs text-emerald-300 bg-ink-800/60 px-1.5 py-0.5 rounded">$1</code>')
    .replace(/\*(.+?)\*/g, '<em class="text-ink-400">$1</em>');
}
