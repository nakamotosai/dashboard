import React, { useState, useEffect } from 'react';

interface StatCircleProps {
    label: string;
    value: number;
    color: string;
    glowColor: string;
}

const StatCircle: React.FC<StatCircleProps> = ({ label, value, color, glowColor }) => {
    return (
        <div className="relative w-16 h-16 flex items-center justify-center group">
            {/* Outer Glow Effect */}
            <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${glowColor}`} />

            <svg className="w-full h-full transform -rotate-90 overflow-visible drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">
                {/* Background Track */}
                <circle
                    cx="32"
                    cy="32"
                    r="24"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-white/5"
                />
                {/* Progress Bar */}
                <circle
                    cx="32"
                    cy="32"
                    r="24"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={151}
                    strokeDashoffset={151 * (1 - value / 100)}
                    strokeLinecap="round"
                    className={`${color} transition-all duration-1000 ease-out`}
                    style={{
                        filter: `drop-shadow(0 0 10px currentColor)`
                    }}
                />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[8px] text-zinc-500 font-sans font-bold tracking-widest leading-none mb-0.5">{label}</span>
                <div className="flex items-baseline">
                    <span className={`text-xs font-black font-mono tracking-tighter ${color}`}>{value}</span>
                    <span className="text-[8px] text-zinc-500 font-sans ml-0.5">%</span>
                </div>
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
        <div className="glass-panel rounded-3xl flex items-center justify-around p-6 h-full w-full bg-gradient-to-br from-white/5 to-transparent border border-white/10 shadow-[inner_0_0_20px_rgba(0,0,0,0.5)]">
            <StatCircle label="CPU" value={stats.cpu} color="text-blue-500" glowColor="bg-blue-500" />
            <StatCircle label="RAM" value={stats.ram} color="text-emerald-400" glowColor="bg-emerald-400" />
            <StatCircle label="VRAM" value={stats.vram} color="text-orange-400" glowColor="bg-orange-400" />
        </div>
    );
};
