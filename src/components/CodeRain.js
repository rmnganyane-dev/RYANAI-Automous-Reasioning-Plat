import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
export default function CodeRain() {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        let animationId;
        const chars = '01ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂ0123456789ABCDEF{}[]<>/\\=+*-_#'.split('');
        const fontSize = 14;
        let columns;
        let drops;
        function resize() {
            if (!canvas || !ctx)
                return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            columns = Math.floor(canvas.width / fontSize);
            drops = new Array(columns).fill(0).map(() => Math.random() * -100);
        }
        resize();
        window.addEventListener('resize', resize);
        function draw() {
            if (!canvas || !ctx)
                return;
            ctx.fillStyle = 'rgba(2, 6, 23, 0.06)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = `${fontSize}px JetBrains Mono, monospace`;
            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                const x = i * fontSize;
                const y = drops[i] * fontSize;
                // Head character is brighter
                if (Math.random() > 0.975) {
                    ctx.fillStyle = 'rgba(165, 243, 252, 0.9)';
                }
                else {
                    ctx.fillStyle = 'rgba(34, 211, 238, 0.5)';
                }
                ctx.fillText(text, x, y);
                if (y > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i] += 0.5;
            }
            animationId = requestAnimationFrame(draw);
        }
        draw();
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, []);
    return _jsx("canvas", { ref: canvasRef, className: "code-rain" });
}
