import React from 'react';
export default function Modal({ open, isOpen, onClose, title, icon, maxWidth = 'max-w-lg', children, }) {
    const visible = open ?? isOpen ?? false;
    if (!visible)
        return null;
    return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
			<div className={`relative w-full ${maxWidth} rounded-xl bg-gray-900 p-6 text-white border border-gray-800 shadow-2xl`}>
				{title && (<h3 className="flex items-center gap-2 text-lg font-bold pb-2 border-b border-gray-800">
						{icon}
						{title}
					</h3>)}
				<button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white" aria-label="Close modal">
					&times;
				</button>
				<div className="mt-4">{children}</div>
			</div>
		</div>);
}
