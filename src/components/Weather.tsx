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
        <div className="glass-panel w-full h-full rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group">
            {/* Background Glows */}
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-luxury-gold/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-center z-10">
                <div className="flex flex-col">
                    <h3 className="text-luxury-gold font-sans text-sm font-medium uppercase tracking-widest mb-1 truncate">日本, 东京</h3>
                    <div className="flex flex-col text-white">
                        <div className="text-5xl font-serif leading-tight">
                            {Math.round(weather.temperature)}
                            <span className="text-3xl text-luxury-gold/50 ml-1">°C</span>
                        </div>
                        <div className="text-xl font-sans font-medium text-zinc-300 mt-1">
                            {text}
                        </div>
                    </div>
                </div>
                <div className="w-16 h-16 opacity-90 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)] mt-15">
                    {icon}
                </div>
            </div>

            {/* Detailed Stats Grid */}
            <div className="grid grid-cols-3 gap-2 pt-4 mt-2 border-t border-white/5 z-10">
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
    );
};
