import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Github } from 'lucide-react';
import Modal from './Modal';
export default function GithubModal({ open, onClose, connected }) {
    return (_jsx(Modal, { open: open, onClose: onClose, title: "GitHub Repository", icon: _jsx(Github, { size: 16 }), children: _jsxs("div", { className: "space-y-4 text-sm text-gray-300", children: [_jsx("p", { children: "Access source code and system documentation for the RYANAI Platform." }), _jsxs("p", { className: "text-xs text-gray-400", children: ["Status: ", connected ? 'Connected' : 'Not connected'] }), _jsx("a", { href: "https://github.com", target: "_blank", rel: "noopener noreferrer", className: "inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium", children: "View on GitHub" })] }) }));
}
