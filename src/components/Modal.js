import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
export default function Modal({ open, isOpen, onClose, title, icon, maxWidth = 'max-w-lg', children, }) {
    const visible = open ?? isOpen ?? false;
    if (!visible)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4", children: _jsxs("div", { className: `relative w-full ${maxWidth} rounded-xl bg-gray-900 p-6 text-white border border-gray-800 shadow-2xl`, children: [title && (_jsxs("h3", { className: "flex items-center gap-2 text-lg font-bold pb-2 border-b border-gray-800", children: [icon, title] })), _jsx("button", { onClick: onClose, className: "absolute top-4 right-4 text-gray-400 hover:text-white", "aria-label": "Close modal", children: "\u00D7" }), _jsx("div", { className: "mt-4", children: children })] }) }));
}
