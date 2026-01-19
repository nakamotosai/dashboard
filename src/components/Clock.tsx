import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { zhCN, ja } from 'date-fns/locale';
import { twMerge } from 'tailwind-merge';

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

    const tzOffset = format(time, 'xxx');

    return (
        <div className="flex flex-col h-full w-full glass-panel px-5 pt-5 pb-5 relative overflow-hidden group select-none rounded-3xl [container-type:size]">
            {/* Background Glows */}
            <div className="absolute -right-16 -top-16 w-60 h-60 bg-luxury-gold/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-60 h-60 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Header: Date and TimeZone (Pure text, no labels) */}
            <div className="flex justify-between items-start pb-3 shrink-0">
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-sans font-medium text-luxury-text tracking-wide tabular-nums">
                        {format(time, 'yyyy-MM-dd')}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium tracking-widest tabular-nums italic opacity-80">
                        UTC {tzOffset}
                    </span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-sm font-sans font-medium text-luxury-gold tracking-widest leading-none mt-1">
                        {format(time, 'EEEE', { locale: zhCN })}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium tracking-widest italic opacity-80 mt-1 uppercase">
                        {format(time, 'EEEE', { locale: ja })}
                    </span>
                </div>
            </div>

            {/* Center: Time (Adaptive font size based on container WIDTH to prevent horizontal overflow) */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-0">
                <div className="grid grid-cols-[auto_auto_auto_auto] items-center gap-[1cqw]">
                    {/* AM/PM Indicator */}
                    <div className="flex flex-col gap-1 mr-[2cqw] font-sans font-bold tracking-tighter">
                        <span className={twMerge(
                            "text-[clamp(0.6rem,6cqw,1.2rem)] leading-none transition-colors duration-500",
                            format(time, 'a') === 'AM' ? "text-luxury-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" : "text-white/10"
                        )}>AM</span>
                        <span className={twMerge(
                            "text-[clamp(0.6rem,6cqw,1.2rem)] leading-none transition-colors duration-500",
                            format(time, 'a') === 'PM' ? "text-luxury-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" : "text-white/10"
                        )}>PM</span>
                    </div>

                    {/* Hour and Minute Side (12-hour format) */}
                    <h1 className="text-[clamp(1.5rem,24cqw,6rem)] font-serif font-light tracking-tighter text-luxury-text tabular-nums lining-nums leading-none drop-shadow-2xl flex items-center">
                        <span className="inline-block text-center min-w-[1.1ch]">{format(time, 'hh')}</span>
                        <span className="opacity-50 mx-[0.2cqw] pb-[1cqw]">:</span>
                        <span className="inline-block text-center min-w-[1.1ch]">{format(time, 'mm')}</span>
                    </h1>

                    {/* Spacer / Divider */}
                    <div className="w-[1cqw]" />

                    {/* Seconds */}
                    <div className="flex flex-col justify-end">
                        <span className="text-[clamp(0.8rem,12cqw,3rem)] font-serif text-luxury-gold tabular-nums lining-nums drop-shadow-[0_0_10px_rgba(212,175,55,0.8)] leading-none mb-[1cqw] inline-block text-center min-w-[2.1ch]">
                            {format(time, 'ss')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer: Progress (Fixed bottom) */}
            <div className="mt-auto pt-4 shrink-0">
                <div className="flex justify-between text-[10px] text-zinc-500 font-sans tracking-widest uppercase mb-1.5">
                    <span>Daily Progress</span>
                    <span className="font-mono">{dayProgress.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 overflow-hidden rounded-full relative">
                    <div
                        className="h-full bg-luxury-gold shadow-[0_0_10px_rgba(212,175,55,0.4)] transition-all duration-1000"
                        style={{ width: `${dayProgress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};
