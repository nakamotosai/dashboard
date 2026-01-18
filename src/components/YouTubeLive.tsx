import { useState, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

export const YouTubeLive = () => {
    const VIDEO_ID = "_k-5U7IeK8g";
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const sendCommand = (func: string, args: any[] = []) => {
        if (!iframeRef.current) return;
        iframeRef.current.contentWindow?.postMessage(JSON.stringify({
            event: 'command',
            func: func,
            args: args
        }), '*');
    };

    const toggleMute = () => {
        const nextMutedState = !isMuted;
        sendCommand(nextMutedState ? 'mute' : 'unMute');
        setIsMuted(nextMutedState);
    };

    const togglePlay = () => {
        const nextPlayState = !isPlaying;
        sendCommand(nextPlayState ? 'playVideo' : 'pauseVideo');
        setIsPlaying(nextPlayState);
    };

    return (
        <div className="glass-panel rounded-3xl overflow-hidden h-full w-full relative group bg-black border-none shadow-none">
            {/* 
                Scale the video significantly to ensure it covers the card without any black bars.
                Using a 140% scale to cover both horizontal and vertical variances in aspect ratio.
            */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                <iframe
                    ref={iframeRef}
                    src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&mute=1&controls=0&disablekb=1&fs=0&loop=1&modestbranding=1&playsinline=1&rel=0&showinfo=0&iv_load_policy=3&enablejsapi=1&origin=${window.location.origin}`}
                    title="YouTube Live Stream"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] min-w-full min-h-full object-cover"
                ></iframe>
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Play/Pause Button */}
                <button
                    onClick={togglePlay}
                    className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white/80 hover:bg-white/20 hover:text-white transition-all duration-300 pointer-events-auto border border-white/10"
                >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>

                {/* Mute Button */}
                <button
                    onClick={toggleMute}
                    className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white/80 hover:bg-white/20 hover:text-white transition-all duration-300 pointer-events-auto border border-white/10"
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>

            {/* Subtle Gradient Overlay to blend with the dashboard if needed */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]" />
        </div>
    );
};
