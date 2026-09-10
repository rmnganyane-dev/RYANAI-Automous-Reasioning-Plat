"use client";
import React, { useEffect, useState, useCallback } from "react";
import { ArrowDown } from "lucide-react";
export const ScrollControl = ({ containerRef, className = "", threshold = 100, }) => {
    const [showButton, setShowButton] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const handleScroll = useCallback(() => {
        const container = containerRef.current;
        if (!container)
            return;
        const { scrollTop, scrollHeight, clientHeight } = container;
        const distanceToBottom = scrollHeight - scrollTop - clientHeight;
        const atBottom = distanceToBottom <= threshold;
        setIsAtBottom(atBottom);
        setShowButton(!atBottom);
    }, [containerRef, threshold]);
    const scrollToBottom = useCallback((behavior = "smooth") => {
        const container = containerRef.current;
        if (!container)
            return;
        container.scrollTo({
            top: container.scrollHeight,
            behavior,
        });
    }, [containerRef]);
    useEffect(() => {
        const container = containerRef.current;
        if (!container)
            return;
        container.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => {
            container.removeEventListener("scroll", handleScroll);
        };
    }, [containerRef, handleScroll]);
    // Auto-scroll when new content arrives and user was already at the bottom
    useEffect(() => {
        const container = containerRef.current;
        if (!container)
            return;
        const handleResizeOrMutation = () => {
            if (isAtBottom) {
                scrollToBottom("auto");
            }
        };
        const resizeObserver = new ResizeObserver(handleResizeOrMutation);
        resizeObserver.observe(container);
        return () => {
            resizeObserver.disconnect();
        };
    }, [containerRef, isAtBottom, scrollToBottom]);
    if (!showButton)
        return null;
    return (<div className={`absolute bottom-6 right-6 z-20 ${className}`}>
      <button onClick={() => scrollToBottom("smooth")} aria-label="Scroll to bottom" className="flex items-center justify-center w-10 h-10 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-full shadow-lg border border-neutral-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500">
        <ArrowDown className="w-5 h-5"/>
      </button>
    </div>);
};
export default ScrollControl;
