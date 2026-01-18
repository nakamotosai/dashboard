import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export const MapBackground = () => {
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

            {/* Simple solid dark overlay to prevent banding while keeping the map subtle */}
            <div className="absolute inset-0 z-[9999] pointer-events-none bg-black/65" />
        </div>
    );
};
