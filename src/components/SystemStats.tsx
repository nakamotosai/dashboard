import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';

interface StatBarProps {
    label: string;
    value: number;
    color: string;
    glowColor: string;
    onClick?: () => void;
}

const StatBar: React.FC<StatBarProps> = ({ label, value, color, glowColor, onClick }) => {
    return (
        <div className="flex items-center gap-3 w-full group cursor-pointer" onClick={onClick}>
            {/* Label - Reduced Fixed Width */}
            <span className={clsx("text-[10px] font-sans font-medium tracking-widest uppercase w-14 shrink-0 transition-colors text-zinc-500", onClick && "group-hover:text-white")}>
                {label.split(' ')[0]}
            </span>

            {/* Progress Bar - Flex Grow */}
            <div className="flex-1 relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                {/* Glow Background */}
                <div
                    className={`absolute inset-0 opacity-20 blur-md transition-all duration-1000 ${glowColor}`}
                    style={{ width: `${value}%` }}
                />
                {/* Filling Bar */}
                <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor] ${color.replace('text-', 'bg-')}`}
                    style={{ width: `${value}%` }}
                />
            </div>

            <div className="flex items-baseline gap-0.5 w-10 justify-end">
                <span className={`text-xs font-mono font-bold ${color} lining-nums`}>{value}</span>
                <span className="text-[8px] text-zinc-600 font-sans">%</span>
            </div>
        </div>
    );
};

export const SystemStats = () => {
    const [stats, setStats] = useState({
        cpu: 18,
        ram: 54,
        vram: 32
    });
    const [clearedDiff, setClearedDiff] = useState<number | null>(null);

    const clearMemory = () => {
        if (clearedDiff !== null) return; // Prevent spamming

        const oldRam = stats.ram;
        const newRam = Math.floor(Math.random() * 10) + 20; // Drop to 20-30%

        if (newRam < oldRam) {
            setStats(prev => ({ ...prev, ram: newRam }));
            setClearedDiff(oldRam - newRam);

            // Revert feedback after 2s
            setTimeout(() => setClearedDiff(null), 2000);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            // Only update if not currently showing "Adjusting/Cleared" state to avoid jumping
            if (clearedDiff === null) {
                setStats(prev => ({
                    cpu: Math.floor(Math.random() * 15) + 12,
                    ram: Math.max(prev.ram + (Math.random() > 0.7 ? 1 : -1), 20),
                    vram: Math.floor(Math.random() * 10) + 30
                }));
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [clearedDiff]);

    return (
        <div className="glass-panel rounded-3xl flex flex-col justify-center gap-[clamp(0.25rem,4cqh,1rem)] p-[clamp(1rem,5cqh,1.25rem)] h-full w-full relative overflow-hidden [container-type:size]">
            {/* Ambient Background Glows */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-luxury-gold/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-luxury-gold/5 rounded-full blur-3xl pointer-events-none" />

            <StatBar label="CPU Loading" value={stats.cpu} color="text-blue-400" glowColor="bg-blue-400" />

            <div className="relative">
                <StatBar
                    label="Memory Usage"
                    value={stats.ram}
                    color={clearedDiff ? "text-emerald-400" : "text-emerald-400"}
                    glowColor="bg-emerald-400"
                    onClick={clearMemory}
                />
                {/* Floating "Freed" Label */}
                {clearedDiff && (
                    <div className="absolute top-0 right-14 -translate-y-full text-[10px] text-emerald-300 font-bold animate-bounce lining-nums">
                        -{clearedDiff}% FREED
                    </div>
                )}
            </div>

            <StatBar label="VRAM Status" value={stats.vram} color="text-orange-400" glowColor="bg-orange-400" />
        </div>
    );
};
