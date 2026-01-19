import { useState, useEffect } from 'react';
import { Chrome, Calculator, MessageCircle } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export const QuickLaunch = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % 4);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const buttons = [
        {
            id: 0,
            color: 'blue',
            action: () => window.open('microsoft-edge:https://www.bing.com', '_self'),
            icon: (isActive: boolean) => (
                <div
                    className={twMerge(
                        "w-6 h-6 transition-all duration-1000",
                        isActive ? "bg-blue-500 opacity-100" : "bg-blue-500/70 opacity-60 group-hover:opacity-100"
                    )}
                    style={{
                        maskImage: 'url(/edge.png)',
                        WebkitMaskImage: 'url(/edge.png)',
                        maskSize: 'contain',
                        WebkitMaskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        WebkitMaskRepeat: 'no-repeat'
                    }}
                />
            ),
            activeClass: "bg-blue-500/20 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]",
            hoverClass: "bg-blue-500/5 border-blue-500/10 hover:bg-blue-500/10 hover:border-blue-500/30"
        },
        {
            id: 1,
            color: 'red',
            action: () => window.open('https://www.google.com', '_blank'),
            icon: (isActive: boolean) => (
                <Chrome className={twMerge(
                    "w-1/2 h-1/2 transition-all duration-1000",
                    isActive ? "text-red-400 opacity-100 shadow-red-500/50" : "text-red-400/70 opacity-60 group-hover:opacity-100"
                )} />
            ),
            activeClass: "bg-red-500/20 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]",
            hoverClass: "bg-red-500/5 border-red-500/10 hover:bg-red-500/10 hover:border-red-500/30"
        },
        {
            id: 2,
            color: 'yellow',
            action: () => window.open('ms-calculator:', '_self'),
            icon: (isActive: boolean) => (
                <Calculator className={twMerge(
                    "w-1/2 h-1/2 transition-all duration-1000",
                    isActive ? "text-yellow-400 opacity-100" : "text-yellow-400/70 opacity-60 group-hover:opacity-100"
                )} />
            ),
            activeClass: "bg-yellow-500/20 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.3)]",
            hoverClass: "bg-yellow-500/5 border-yellow-500/10 hover:bg-yellow-500/10 hover:border-yellow-500/30"
        },
        {
            id: 3,
            color: 'emerald',
            action: () => window.open('weixin:', '_self'),
            icon: (isActive: boolean) => (
                <MessageCircle className={twMerge(
                    "w-1/2 h-1/2 transition-all duration-1000",
                    isActive ? "text-emerald-400 opacity-100" : "text-emerald-400/70 opacity-60 group-hover:opacity-100"
                )} />
            ),
            activeClass: "bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]",
            hoverClass: "bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10 hover:border-emerald-500/30"
        }
    ];

    return (
        <div className="glass-panel h-full rounded-2xl p-2 flex items-center justify-between relative overflow-hidden">
            {/* Background Glows */}
            {/* Background Glows */}
            <div className="absolute -right-10 -top-10 w-24 h-24 bg-luxury-gold/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-luxury-gold/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-around items-center h-full w-full gap-3">
                {buttons.map((btn) => {
                    const isActive = activeIndex === btn.id;
                    return (
                        <div
                            key={btn.id}
                            onClick={() => btn.action()}
                            className={twMerge(
                                "group h-[70%] aspect-square bg-white/5 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-1000 border border-white/5 shadow-lg relative",
                                isActive ? btn.activeClass : btn.hoverClass
                            )}
                        >
                            {/* Inner Glow Pulse */}
                            {isActive && (
                                <div className="absolute inset-0 rounded-2xl animate-pulse bg-white/5 pointer-events-none" />
                            )}
                            {btn.icon(isActive)}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
