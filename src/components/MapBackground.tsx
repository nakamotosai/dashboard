import { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export const MapBackground = () => {
    const [opacity, setOpacity] = useState(0.65);

    useEffect(() => {
        const updateOpacity = () => {
            const now = new Date();
            const hour = now.getHours() + now.getMinutes() / 60;

            // 使用非线性算法：cosVal 的 0.5 次方（开根号）
            // 这种处理让极值（0点和12点）附近的持续时间更长
            const cosVal = Math.cos((hour / 12) * Math.PI);
            const calculatedOpacity = 0.5 + 0.35 * Math.sign(cosVal) * Math.pow(Math.abs(cosVal), 0.5);

            setOpacity(calculatedOpacity);
        };

        updateOpacity();
        const interval = setInterval(updateOpacity, 60000); // 每分钟更新一次

        // 监听强制刷新事件
        const handleRefresh = () => updateOpacity();
        window.addEventListener('dashboard-refresh', handleRefresh);

        return () => {
            clearInterval(interval);
            window.removeEventListener('dashboard-refresh', handleRefresh);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none bg-black">
            <MapContainer
                center={[37.5, 138.5]}
                zoom={6}
                scrollWheelZoom={false}
                zoomControl={false}
                attributionControl={false}
                dragging={false}
                doubleClickZoom={false}
                touchZoom={false}
                className="h-full w-full bg-black"
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
                />
            </MapContainer>

            {/* Dynamic dark overlay that updates based on time */}
            <div
                className="absolute inset-0 z-[9999] pointer-events-none bg-black transition-colors duration-[60000ms] ease-linear"
                style={{ opacity: opacity }}
            />
        </div>
    );
};
