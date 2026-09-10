// src/components/ChatInterface.tsx
import React, { useState } from 'react';
import { dispatchInference } from '../services/inference';
export function ChatInterface() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading)
            return;
        const userPrompt = input;
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userPrompt }]);
        setLoading(true);
        try {
            const aiResponse = await dispatchInference(userPrompt);
            setMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }]);
        }
        catch {
            setMessages((prev) => [...prev, { role: 'system', content: 'RyanAI could not complete that request.' }]);
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="flex flex-col h-full p-4 bg-zinc-950 text-zinc-100">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((m, idx) => (<div key={idx} className={`p-3 rounded-lg ${m.role === 'user' ? 'bg-blue-600 ml-auto' : 'bg-zinc-800'}`}>
            <p className="text-sm">{m.content}</p>
          </div>))}
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask RyanAI..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"/>
        <button type="submit" disabled={loading} className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-50">
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </div>);
}
