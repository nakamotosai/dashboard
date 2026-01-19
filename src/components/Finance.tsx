import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const Finance = () => {
    const [btcusd, setBtcUsd] = useState(0);
    const [btccny, setBtcCny] = useState(0);
    const [btcChange24h, setBtcChange24h] = useState(0);
    const [btcHistory, setBtcHistory] = useState<number[]>([]);
    const [cnyPer100Jpy, setCnyPer100Jpy] = useState(0);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                // BTC Price and 24h Change
                const btcRes = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,cny&include_24hr_change=true');
                setBtcUsd(btcRes.data.bitcoin.usd);
                setBtcCny(btcRes.data.bitcoin.cny);
                setBtcChange24h(btcRes.data.bitcoin.usd_24h_change);

                // BTC 24h History for Trendline
                const historyRes = await axios.get('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1');
                const prices = historyRes.data.prices.map((p: [number, number]) => p[1]);
                const sampled = prices.filter((_: any, i: number) => i % 4 === 0);
                setBtcHistory(sampled);

                // Exchange Rates
                const exRes = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
                const jpyRate = exRes.data.rates.JPY;
                const cnyRate = exRes.data.rates.CNY;

                // Calculate CNY for 100 JPY
                setCnyPer100Jpy((cnyRate / jpyRate) * 100);
            } catch (e) {
                console.error("Finance fetch error", e);
            }
        };

        fetchRates();
        const interval = setInterval(fetchRates, 60000); // 1 min
        return () => clearInterval(interval);
    }, []);

    const sparklinePath = useMemo(() => {
        if (btcHistory.length < 2) return "";
        const min = Math.min(...btcHistory);
        const max = Math.max(...btcHistory);
        const range = max - min;
        const width = 100;
        const height = 30;

        return btcHistory.map((val, i) => {
            const x = (i / (btcHistory.length - 1)) * width;
            const y = height - ((val - min) / range) * height;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(" ");
    }, [btcHistory]);

    return (
        <div className="grid grid-rows-2 gap-4 h-full">
            <style>{`
                @container (max-height: 60px) {
                    .finance-cny-footer {
                        display: none;
                    }
                }
            `}</style>

            {/* BTC Card - Top Half */}
            <div className="glass-panel p-5 rounded-3xl flex flex-row justify-between relative overflow-hidden group [container-type:size] finance-btc-card">
                {/* Background Glows */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-luxury-gold/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none opacity-50" />

                {/* Left Column: Title, Price, CNY */}
                <div className="flex flex-col h-full flex-1 min-w-0 z-10">
                    {/* Header: Title */}
                    <div className="shrink-0 mb-1">
                        <span className="text-xs font-sans text-luxury-gold font-medium tracking-widest uppercase flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-luxury-gold rounded-full animate-pulse" />
                            Bitcoin
                        </span>
                    </div>

                    {/* Price (Vertically Centered in available space) */}
                    <div className="flex-1 flex items-center">
                        <div className="text-[clamp(1.5rem,15cqw,3.5rem)] font-serif text-white tracking-tight leading-none lining-nums">
                            ${btcusd.toLocaleString()}
                        </div>
                    </div>

                    {/* Footer: CNY Price */}
                    <div className="shrink-0 pt-1 finance-cny-footer">
                        <div className="text-[clamp(0.7rem,4cqw,1rem)] font-sans text-zinc-400 flex items-center gap-1 opacity-80 lining-nums">
                            <span className="text-luxury-gold/70">≈</span>
                            <span>¥ {btccny.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Change & Graph */}
                <div className="flex flex-col justify-between items-end h-full shrink-0 z-10 ml-4">
                    {/* Top: 24h Change Percentage */}
                    <div className="flex items-center gap-1 text-sm font-bold text-luxury-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.4)] lining-nums leading-none">
                        {btcChange24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>{btcChange24h >= 0 ? '+' : ''}{btcChange24h.toFixed(2)}%</span>
                    </div>

                    {/* Bottom: Sparkline Chart */}
                    <div className="w-[30cqw] h-[clamp(1.5rem,15cqh,3rem)] opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                        {sparklinePath && (
                            <svg viewBox="0 0 100 30" width="100%" height="100%" className="overflow-visible">
                                <path
                                    d={sparklinePath}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-luxury-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]"
                                />
                            </svg>
                        )}
                    </div>
                </div>
            </div>

            {/* Currency Card - Bottom Half */}
            <div className="glass-panel p-5 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-luxury-gold/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -left-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none opacity-50" />

                <div className="relative w-full h-full min-h-[80px] z-10">
                    {/* Japan - Top Left */}
                    <div className="absolute top-0 left-0 flex items-center gap-2">
                        <div className="w-[clamp(1.5rem,4vw,2rem)] h-[clamp(1.5rem,4vw,2rem)] rounded-full bg-white border border-white/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                            <div className="w-1/2 h-1/2 rounded-full bg-[#BC002D]" />
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-[clamp(1.2rem,4vw,1.875rem)] font-serif text-white tracking-tight lining-nums">100</span>
                            <span className="text-[clamp(0.6rem,1.5vw,0.75rem)] font-sans font-medium text-luxury-gold uppercase tracking-widest">円</span>
                        </div>
                    </div>

                    {/* Middle Connector */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15">
                        <span className="text-[clamp(1.5rem,5vw,2.5rem)] font-serif text-white">≈</span>
                    </div>

                    {/* China - Bottom Right */}
                    <div className="absolute bottom-0 right-0 flex items-center gap-2">
                        <div className="flex items-baseline gap-1">
                            <span className="text-[clamp(1.2rem,4vw,1.875rem)] font-serif text-white tracking-tight lining-nums">{cnyPer100Jpy.toFixed(2)}</span>
                            <span className="text-[clamp(0.6rem,1.5vw,0.75rem)] font-sans font-medium text-luxury-gold uppercase tracking-widest">元</span>
                        </div>
                        <div className="w-[clamp(1.5rem,4vw,2rem)] h-[clamp(1.5rem,4vw,2rem)] rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(238,28,37,0.2)] relative overflow-hidden">
                            <img
                                src="https://flagcdn.com/cn.svg"
                                alt="CN Flag"
                                className="absolute max-w-none"
                                style={{
                                    width: '230%',
                                    left: '-5%',
                                    top: '0%'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
