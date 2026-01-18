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
            icon: (isActive: boolean) => (
                <div
                    className={twMerge(
                        "w-6 h-6 bg-zinc-400 opacity-60 transition-all duration-1000",
                        isActive ? "bg-blue-500 opacity-100" : "group-hover:bg-blue-500 group-hover:opacity-100"
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
            hoverClass: "hover:bg-blue-500/20 hover:border-blue-500/50"
        },
        {
            id: 1,
            color: 'red',
            icon: (isActive: boolean) => (
                <Chrome className={twMerge(
                    "text-zinc-400 opacity-60 transition-all duration-1000",
                    isActive ? "text-red-400 opacity-100 shadow-red-500/50" : "group-hover:text-red-400 group-hover:opacity-100"
                )} size={24} />
            ),
            activeClass: "bg-red-500/20 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]",
            hoverClass: "hover:bg-red-500/20 hover:border-red-500/50"
        },
        {
            id: 2,
            color: 'yellow',
            icon: (isActive: boolean) => (
                <Calculator className={twMerge(
                    "text-zinc-400 opacity-60 transition-all duration-1000",
                    isActive ? "text-yellow-400 opacity-100" : "group-hover:text-yellow-400 group-hover:opacity-100"
                )} size={24} />
            ),
            activeClass: "bg-yellow-500/20 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.3)]",
            hoverClass: "hover:bg-yellow-500/20 hover:border-yellow-500/50"
        },
        {
            id: 3,
            color: 'emerald',
            icon: (isActive: boolean) => (
                <MessageCircle className={twMerge(
                    "text-zinc-400 opacity-60 transition-all duration-1000",
                    isActive ? "text-emerald-400 opacity-100" : "group-hover:text-emerald-400 group-hover:opacity-100"
                )} size={24} />
            ),
            activeClass: "bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]",
            hoverClass: "hover:bg-emerald-500/20 hover:border-emerald-500/50"
        }
    ];

    return (
        <div className="glass-panel rounded-3xl p-4 flex flex-col justify-center h-full relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute -right-10 -top-10 w-24 h-24 bg-luxury-gold/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-4 gap-4 h-full items-center px-2">
                {buttons.map((btn) => {
                    const isActive = activeIndex === btn.id;
                    return (
                        <div
                            key={btn.id}
                            className={twMerge(
                                "group aspect-square bg-white/5 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-1000 border border-white/5 shadow-lg relative",
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
