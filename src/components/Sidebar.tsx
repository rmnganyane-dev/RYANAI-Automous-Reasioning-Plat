import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, Trash2, Info, Brain, Github, X, Menu } from 'lucide-react';
import type { Conversation } from '@/lib/types';
import { modelMeta } from '@/lib/models';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onAbout: () => void;
  onMemory: () => void;
  onGithub: () => void;
  githubConnected: boolean;
}

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onAbout,
  onMemory,
  onGithub,
  githubConnected,
}: SidebarProps) {
  return (
    <div className="h-full glass rounded-2xl flex flex-col overflow-hidden corner-brackets">
      {/* Header */}
      <div className="px-4 py-4 border-b border-cyan-500/15">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <span className="font-display font-black text-ink-950 text-sm">R</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-ink-950 animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-bold text-cyan-300 text-sm tracking-wider glow-cyan">RYANAI</h1>
            <p className="text-[10px] text-ink-500 font-mono tracking-widest uppercase">Reasoning Engine</p>
          </div>
        </div>
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-medium text-sm btn-glow hover:bg-cyan-500/20 transition-colors"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Thread
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {conversations.length === 0 && (
          <div className="text-center py-12 px-4">
            <MessageSquare size={32} className="mx-auto text-ink-600 mb-3" />
            <p className="text-xs text-ink-500">No threads yet</p>
            <p className="text-[10px] text-ink-600 mt-1">Start a new conversation to begin reasoning</p>
          </div>
        )}
        <AnimatePresence>
          {conversations.map((conv) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              onClick={() => onSelect(conv.id)}
              className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                activeId === conv.id
                  ? 'bg-cyan-500/15 border border-cyan-500/30'
                  : 'hover:bg-ink-800/50 border border-transparent'
              }`}
            >
              <MessageSquare
                size={14}
                className={activeId === conv.id ? 'text-cyan-400' : 'text-ink-600'}
              />
              <div className="flex-1 min-w-0">
                <p className={`text-xs truncate ${activeId === conv.id ? 'text-cyan-200' : 'text-ink-300'}`}>
                  {conv.title}
                </p>
                <p className="text-[9px] text-ink-600 font-mono mt-0.5">
                  {conv.messages.length} msgs · {modelMeta(conv.model).short}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-ink-600 hover:text-rose-400 transition-all"
              >
                <Trash2 size={13} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer actions */}
      <div className="px-3 py-3 border-t border-cyan-500/15 space-y-1">
        <button
          onClick={onMemory}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-ink-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all text-xs"
        >
          <Brain size={15} />
          Memory Vault
        </button>
        <button
          onClick={onGithub}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-ink-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all text-xs"
        >
          <Github size={15} />
          GitHub
          {githubConnected && (
            <span className="ml-auto status-dot online" />
          )}
        </button>
        <button
          onClick={onAbout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-ink-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all text-xs"
        >
          <Info size={15} />
          About RyanAI
        </button>
      </div>
    </div>
  );
}
