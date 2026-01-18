import { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { Activity } from 'lucide-react';

export const NetworkGraph = () => {
    // 300 points = 5 minutes at 1 update per second
    const DATA_LENGTH = 300;
    const [data, setData] = useState(generateData(DATA_LENGTH));

    function generateData(length: number) {
        return Array.from({ length }, (_, i) => ({
            name: i,
            uv: 10 + Math.random() * 30 + (Math.sin(i * 0.1) * 5), // Simulated 'download'
            pv: 5 + Math.random() * 10  // Simulated 'upload'
        }));
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => {
                const newData = [...prev.slice(1), {
                    name: prev.length,
                    uv: 10 + Math.random() * 50 + (Math.random() > 0.95 ? 80 : 0), // Occasional spikes
                    pv: 5 + Math.random() * 20
                }];
                return newData;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass-panel rounded-3xl p-4 h-full relative overflow-hidden flex flex-col justify-between">
            {/* Background Glows */}
            <div className="absolute -right-10 -top-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
            {/* Header / Stats */}
            <div className="flex justify-between items-start z-10">
                <div className="flex items-center gap-2">
                    <Activity size={14} className="text-cyan-400" />
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">NETWORK</span>
                </div>
                <div className="text-right">
                    <div className="text-xs font-mono text-white">
                        <span className="text-zinc-500">DWN</span> {(data[data.length - 1].uv * 0.5).toFixed(1)} <span className="text-xs text-zinc-600">MB/s</span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="absolute inset-0 bottom-0 top-6 opacity-60">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <YAxis hide domain={[0, 150]} />
                        <Area
                            type="monotone"
                            dataKey="uv"
                            stroke="#22d3ee"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorUv)"
                            isAnimationActive={false} // Disable animation for smoother 'tick' updates
                        />
                        <Area
                            type="monotone"
                            dataKey="pv"
                            stroke="#a78bfa"
                            strokeWidth={1}
                            style={{ opacity: 0.5 }}
                            fillOpacity={1}
                            fill="url(#colorPv)"
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Grid overlay for aesthetic */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
        </div>
    );
};
