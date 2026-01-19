import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind } from 'lucide-react';
import axios from 'axios';

interface WeatherData {
    temperature: number;
    weathercode: number;
    windspeed: number;
    humidity: number;
    feelsLike: number;
    uvIndex: number;
}

export const Weather = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    const [location] = useState({ lat: 35.6762, lon: 139.6503 });

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const res = await axios.get(
                    `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=uv_index_max&timezone=auto`
                );

                const current = res.data.current;
                const daily = res.data.daily;

                setWeather({
                    temperature: current.temperature_2m,
                    weathercode: current.weather_code,
                    windspeed: current.wind_speed_10m,
                    humidity: current.relative_humidity_2m,
                    feelsLike: current.apparent_temperature,
                    uvIndex: daily.uv_index_max[0]
                });
            } catch (error) {
                console.error("Weather fetch failed", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
        const interval = setInterval(fetchWeather, 600000);
        return () => clearInterval(interval);
    }, [location]);

    const getWeatherInfo = (code: number) => {
        const mapping: Record<number, { icon: React.ReactNode, text: string }> = {
            0: { icon: <Sun className="w-full h-full text-luxury-gold" />, text: "晴" },
            1: { icon: <Sun className="w-full h-full text-luxury-gold/80" />, text: "晴间多云" },
            2: { icon: <Cloud className="w-full h-full text-zinc-400" />, text: "多云" },
            3: { icon: <Cloud className="w-full h-full text-zinc-500" />, text: "阴" },
            45: { icon: <Wind className="w-full h-full text-zinc-400" />, text: "雾" },
            48: { icon: <Wind className="w-full h-full text-zinc-400" />, text: "霾" },
            51: { icon: <CloudRain className="w-full h-full text-blue-300" />, text: "小雨" },
            53: { icon: <CloudRain className="w-full h-full text-blue-400" />, text: "中雨" },
            55: { icon: <CloudRain className="w-full h-full text-blue-500" />, text: "大雨" },
            61: { icon: <CloudRain className="w-full h-full text-blue-400" />, text: "阵雨" },
            95: { icon: <CloudRain className="w-full h-full text-purple-400" />, text: "雷阵雨" },
        };
        return mapping[code] || { icon: <Cloud className="w-full h-full text-zinc-400" />, text: "未知" };
    };

    if (loading || !weather) return <div className="animate-pulse bg-white/5 h-full w-full rounded-3xl" />;

    const { icon, text } = getWeatherInfo(weather.weathercode);

    return (
        <div className="glass-panel w-full h-full rounded-3xl p-5 flex flex-col relative overflow-hidden group [container-type:size]">
            {/* Background Glows */}
            <style>{`
                @keyframes breathing-glow {
                    0%, 100% { 
                        filter: drop-shadow(0 0 15px rgba(234, 179, 8, 0.3)); 
                        transform: scale(0.96) rotate(-2deg); 
                    }
                    50% { 
                        filter: drop-shadow(0 0 40px rgba(234, 179, 8, 0.8)); 
                        transform: scale(1.12) rotate(3deg); 
                    }
                }
                @keyframes halo-pulse {
                    0%, 100% { transform: scale(1); opacity: 0.4; }
                    50% { transform: scale(1.8); opacity: 0.8; }
                }
            `}</style>
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-luxury-gold/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />

            {/* Fixed Header: Location */}
            <div className="shrink-0 z-10">
                <h3 className="text-luxury-gold font-sans text-sm font-medium uppercase tracking-widest truncate flex items-center gap-2">
                    日本, 东京
                </h3>
            </div>

            {/* Elastic Middle: Temperature & Icon */}
            <div className="flex-1 flex flex-row items-center justify-between min-h-0 w-full z-10 px-1">
                <div className="flex flex-col justify-center gap-[1cqh]">
                    {/* Temperature */}
                    <div className="flex items-start leading-none font-serif text-white">
                        <span className="text-[clamp(2.5rem,25cqw,5rem)] tabular-nums tracking-tighter">
                            {Math.round(weather.temperature)}
                        </span>
                        <span className="text-[clamp(1rem,8cqw,2rem)] text-luxury-gold/60 mt-[1cqw] ml-1">°C</span>
                    </div>
                    {/* Weather Condition Text */}
                    <div className="text-[clamp(1rem,8cqw,1.5rem)] font-sans font-medium text-zinc-300">
                        {text}
                    </div>
                </div>

                {/* Weather Icon with Halo */}
                <div className="relative w-[clamp(3.5rem,28cqw,7rem)] h-[clamp(3.5rem,28cqw,7rem)] flex items-center justify-center">
                    {/* Breathing Halo */}
                    <div
                        className="absolute w-1/2 h-1/2 bg-luxury-gold rounded-full blur-2xl pointer-events-none"
                        style={{ animation: 'halo-pulse 4s ease-in-out infinite' }}
                    />
                    {/* Rotating & Scaling Icon */}
                    <div
                        className="w-full h-full relative z-10"
                        style={{ animation: 'breathing-glow 4s ease-in-out infinite' }}
                    >
                        {icon}
                    </div>
                </div>
            </div>

            {/* Fixed Footer: Detailed Stats Grid */}
            <div className="shrink-0 mt-auto pt-4 border-t border-white/5 z-10">
                <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-sans font-medium tracking-widest uppercase text-zinc-500 whitespace-nowrap">体感</span>
                        <span className="text-xs font-mono text-zinc-200">{Math.round(weather.feelsLike)}°C</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-sans font-medium tracking-widest uppercase text-zinc-500 whitespace-nowrap">湿度</span>
                        <span className="text-xs font-mono text-zinc-200">{weather.humidity}%</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-sans font-medium tracking-widest uppercase text-zinc-500 whitespace-nowrap">紫外线</span>
                        <span className="text-xs font-mono text-zinc-200">{weather.uvIndex.toFixed(1)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
