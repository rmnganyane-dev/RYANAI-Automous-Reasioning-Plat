import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
export function Greeting({ name, subtitle }) {
    return (_jsxs(_Fragment, { children: [_jsx("h3", { className: "font-display font-bold text-lg text-cyan-200 mb-2 glow-cyan", children: name }), subtitle && _jsx("p", { className: "text-sm text-ink-400 max-w-md leading-relaxed", children: subtitle })] }));
}
