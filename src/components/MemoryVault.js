import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Brain, Plus, Trash2, Search } from 'lucide-react';
import Modal from './Modal';
import { loadMemory, saveMemory, uid } from '@/lib/storage';
const CATEGORIES = [
    { id: 'preference', label: 'Preference', color: 'cyan' },
    { id: 'fact', label: 'Fact', color: 'emerald' },
    { id: 'project', label: 'Project', color: 'amber' },
    { id: 'skill', label: 'Skill', color: 'rose' },
];
export default function MemoryVault({ open, onClose }) {
    const [entries, setEntries] = useState([]);
    const [key, setKey] = useState('');
    const [value, setValue] = useState('');
    const [category, setCategory] = useState('preference');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
    useEffect(() => {
        if (open)
            setEntries(loadMemory());
    }, [open]);
    const persist = (next) => {
        setEntries(next);
        saveMemory(next);
    };
    const addEntry = () => {
        if (!key.trim() || !value.trim())
            return;
        const entry = {
            id: uid('mem'),
            key: key.trim(),
            value: value.trim(),
            category,
            createdAt: Date.now(),
        };
        persist([entry, ...entries]);
        setKey('');
        setValue('');
    };
    const deleteEntry = (id) => {
        persist(entries.filter((e) => e.id !== id));
    };
    const colorMap = {
        cyan: 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10',
        emerald: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
        amber: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
        rose: 'text-rose-300 border-rose-500/30 bg-rose-500/10',
    };
    const filteredEntries = entries.filter((entry) => {
        const matchesCategory = selectedCategoryFilter === 'all' || entry.category === selectedCategoryFilter;
        const matchesQuery = searchQuery === '' ||
            entry.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.value.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesQuery;
    });
    return (_jsx(Modal, { open: open, onClose: onClose, title: "Memory Vault", icon: _jsx(Brain, { size: 16 }), maxWidth: "max-w-xl", children: _jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "text-xs text-ink-400 leading-relaxed", children: "Everything RyanAI has remembered about you and your projects. This persistent memory carries across sessions and threads." }), _jsxs("div", { className: "bg-ink-800/40 rounded-xl p-4 border border-cyan-500/15 space-y-3", children: [_jsx("div", { className: "flex gap-2 flex-wrap", children: CATEGORIES.map((c) => (_jsx("button", { onClick: () => setCategory(c.id), className: `px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider border transition-all ${category === c.id
                                    ? colorMap[c.color]
                                    : 'text-ink-500 border-ink-700 bg-ink-800/30 hover:border-ink-600'}`, children: c.label }, c.id))) }), _jsx("input", { value: key, onChange: (e) => setKey(e.target.value), placeholder: "Key (e.g. preferred_language)", className: "w-full bg-ink-900/50 border border-cyan-500/15 rounded-lg px-3 py-2 text-xs text-ink-200 placeholder:text-ink-600 focus:outline-none focus:border-cyan-500/40" }), _jsx("textarea", { value: value, onChange: (e) => setValue(e.target.value), placeholder: "Value (e.g. TypeScript with strict mode)", rows: 2, className: "w-full bg-ink-900/50 border border-cyan-500/15 rounded-lg px-3 py-2 text-xs text-ink-200 placeholder:text-ink-600 focus:outline-none focus:border-cyan-500/40 resize-none" }), _jsxs("button", { onClick: addEntry, disabled: !key.trim() || !value.trim(), className: "w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-medium btn-glow hover:bg-cyan-500/25 transition-colors disabled:opacity-30", children: [_jsx(Plus, { size: 14 }), "Store Memory"] })] }), entries.length > 0 && (_jsxs("div", { className: "flex gap-2 items-center", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { size: 13, className: "absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" }), _jsx("input", { value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search memories...", className: "w-full bg-ink-900/40 border border-cyan-500/15 rounded-lg pl-8 pr-3 py-1.5 text-xs text-ink-200 placeholder:text-ink-600 focus:outline-none focus:border-cyan-500/40" })] }), _jsxs("select", { value: selectedCategoryFilter, onChange: (e) => setSelectedCategoryFilter(e.target.value), className: "bg-ink-900/40 border border-cyan-500/15 rounded-lg px-2.5 py-1.5 text-xs text-ink-300 focus:outline-none focus:border-cyan-500/40 font-mono", children: [_jsx("option", { value: "all", children: "All Categories" }), CATEGORIES.map((c) => (_jsx("option", { value: c.id, children: c.label }, c.id)))] })] })), _jsxs("div", { className: "space-y-2 max-h-64 overflow-y-auto pr-1", children: [filteredEntries.length === 0 && entries.length > 0 && (_jsx("div", { className: "text-center py-6", children: _jsx("p", { className: "text-xs text-ink-500", children: "No matching memories found" }) })), entries.length === 0 && (_jsxs("div", { className: "text-center py-8", children: [_jsx(Brain, { size: 28, className: "mx-auto text-ink-700 mb-2" }), _jsx("p", { className: "text-xs text-ink-500", children: "No memories stored yet" })] })), filteredEntries.map((entry) => {
                            const cat = CATEGORIES.find((c) => c.id === entry.category);
                            return (_jsxs("div", { className: "group flex items-start gap-3 bg-ink-800/30 rounded-lg p-3 border border-cyan-500/10 hover:border-cyan-500/25 transition-colors", children: [_jsx("div", { className: `shrink-0 px-2 py-1 rounded text-[9px] font-mono uppercase border ${colorMap[cat?.color || 'cyan']}`, children: cat?.label }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-xs font-medium text-cyan-200", children: entry.key }), _jsx("p", { className: "text-[11px] text-ink-400 mt-0.5 whitespace-pre-wrap", children: entry.value })] }), _jsx("button", { onClick: () => deleteEntry(entry.id), className: "opacity-0 group-hover:opacity-100 text-ink-600 hover:text-rose-400 transition-all p-1", title: "Delete memory", children: _jsx(Trash2, { size: 13 }) })] }, entry.id));
                        })] })] }) }));
}
