import React, { useState, useEffect } from 'react';

interface StatBarProps {
    label: string;
    value: number;
    color: string;
    glowColor: string;
}

const StatBar: React.FC<StatBarProps> = ({ label, value, color, glowColor }) => {
    return (
        <div className="flex items-center gap-3 w-full group">
            {/* Label - Reduced Fixed Width */}
            <span className="text-[10px] text-zinc-500 font-sans font-medium tracking-widest uppercase w-14 shrink-0">
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

            {/* Percentage - Right Aligned */}
            <div className="flex items-baseline gap-0.5 w-10 justify-end">
                <span className={`text-xs font-mono font-bold ${color}`}>{value}</span>
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

    useEffect(() => {
        const interval = setInterval(() => {
            setStats({
                cpu: Math.floor(Math.random() * 15) + 12,
                ram: Math.floor(Math.random() * 5) + 52,
                vram: Math.floor(Math.random() * 10) + 30
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass-panel rounded-3xl flex flex-col justify-center gap-4 px-6 py-12 h-full w-full relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />

            <StatBar label="CPU Loading" value={stats.cpu} color="text-blue-400" glowColor="bg-blue-400" />
            <StatBar label="Memory Usage" value={stats.ram} color="text-emerald-400" glowColor="bg-emerald-400" />
            <StatBar label="VRAM Status" value={stats.vram} color="text-orange-400" glowColor="bg-orange-400" />
        </div>
    );
};
