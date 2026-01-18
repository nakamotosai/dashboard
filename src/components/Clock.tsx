import { useState, useEffect } from 'react';
import { format, getDayOfYear, getISOWeek } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const Clock = () => {
    const [time, setTime] = useState(new Date());
    const [dayProgress, setDayProgress] = useState(0);

    useEffect(() => {
        const update = () => {
            const now = new Date();
            setTime(now);

            // Calculate day progress
            const start = new Date(now);
            start.setHours(0, 0, 0, 0);
            const passed = now.getTime() - start.getTime();
            const total = 24 * 60 * 60 * 1000;
            setDayProgress((passed / total) * 100);
        };

        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, []);

    const dayOfYear = getDayOfYear(time);
    const weekNumber = getISOWeek(time);
    const tzOffset = format(time, 'xxx');

    return (
        <div className="flex flex-col justify-between h-full w-full bg-black/40 backdrop-blur-md border border-white/10 px-8 pt-8 pb-12 relative overflow-hidden group select-none rounded-3xl">
            {/* Background Glows */}
            <div className="absolute -right-16 -top-16 w-60 h-60 bg-luxury-gold/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-60 h-60 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Corner Accents (Simplified) */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-luxury-gold/50" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-luxury-gold/50" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-luxury-gold/50" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-luxury-gold/50" />

            {/* Header: Date Info */}
            <div className="flex justify-between items-end border-b border-white/5 pb-4">
                <div className="flex flex-col">
                    <span className="text-[10px] text-luxury-muted tracking-widest uppercase mb-1">Date</span>
                    <span className="text-lg font-sans font-medium text-luxury-text tracking-wide tabular-nums">
                        {format(time, 'yyyy-MM-dd')}
                    </span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-[10px] text-luxury-muted tracking-widest uppercase mb-1">Day</span>
                    <span className="text-lg font-sans font-medium text-luxury-gold tracking-widest">
                        {format(time, 'EEEE', { locale: zhCN })}
                    </span>
                </div>
            </div>

            {/* Center: Time */}
            <div className="flex flex-col items-center justify-center py-4">
                <div className="flex items-baseline gap-3">
                    <h1 className="text-5xl lg:text-6xl font-serif font-light tracking-tighter text-luxury-text tabular-nums drop-shadow-2xl">
                        {format(time, 'HH:mm')}
                    </h1>
                    <div className="flex flex-col justify-end pb-1 lg:pb-2">
                        <span className="text-xl lg:text-2xl font-serif text-luxury-gold tabular-nums drop-shadow-[0_0_10px_rgba(212,175,55,0.8)]">
                            {format(time, 'ss')}
                        </span>
                    </div>
                </div>
                <div className="text-[10px] text-luxury-muted/50 tracking-[0.5em] uppercase mt-4 font-sans">
                    UTC {tzOffset}
                </div>
            </div>

            {/* Footer: Progress & Stats */}
            <div className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-luxury-muted font-sans tracking-wider uppercase">
                        <span>Daily Progress</span>
                        <span>{dayProgress.toFixed(1)}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 overflow-hidden rounded-full">
                        <div
                            className="h-full bg-luxury-gold shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                            style={{ width: `${dayProgress}%` }}
                        />
                    </div>
                </div>

                {/* Sub-stats (Simplified Grid) */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded px-3 py-1.5 flex justify-between items-center border border-white/5 hover:border-luxury-gold/30 transition-colors">
                        <span className="text-[10px] text-luxury-muted uppercase tracking-wider">Day No.</span>
                        <span className="text-xs text-luxury-text font-mono">{dayOfYear}</span>
                    </div>
                    <div className="bg-white/5 rounded px-3 py-1.5 flex justify-between items-center border border-white/5 hover:border-luxury-gold/30 transition-colors">
                        <span className="text-[10px] text-luxury-muted uppercase tracking-wider">Week</span>
                        <span className="text-xs text-luxury-text font-mono">#{weekNumber}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
