import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCw, Maximize, Minimize } from 'lucide-react';


export const YouTubeLive = () => {
    const VIDEO_ID = "_k-5U7IeK8g";
    const [isMuted, setIsMuted] = useState(true);
    const [volume, setVolume] = useState(30);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isZoomed, setIsZoomed] = useState(true); // Default to Zoomed (Cover)
    const [refreshKey, setRefreshKey] = useState(0);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isPlayingRef = useRef(isPlaying);
    const isMutedRef = useRef(isMuted);
    const volumeRef = useRef(volume);
    const autoPausedRef = useRef(false);

    // Sync ref with mute state
    useEffect(() => {
        isMutedRef.current = isMuted;
    }, [isMuted]);

    useEffect(() => {
        volumeRef.current = volume;
    }, [volume]);

    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // Sync ref with state
    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    const sendCommand = (func: string, args: any[] = []) => {
        if (!iframeRef.current) return;
        iframeRef.current.contentWindow?.postMessage(JSON.stringify({
            event: 'command',
            func: func,
            args: args
        }), '*');
    };

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                if (isPlayingRef.current) {
                    sendCommand('pauseVideo');
                    autoPausedRef.current = true;
                    setIsPlaying(false);
                }
            } else {
                if (autoPausedRef.current) {
                    sendCommand('playVideo');
                    autoPausedRef.current = false;
                    setIsPlaying(true);
                }
            }
        };

        // Standard Page Visibility API
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Lively Wallpaper Specific API
        (window as any).livelyWindowStateChangeListener = (state: number) => {
            // state 0: hidden/obscured, 1: visible
            if (state === 0) {
                if (isPlayingRef.current) {
                    sendCommand('pauseVideo');
                    autoPausedRef.current = true;
                    setIsPlaying(false);
                }
            } else if (state === 1) {
                if (autoPausedRef.current) {
                    sendCommand('playVideo');
                    autoPausedRef.current = false;
                    setIsPlaying(true);
                }
            }
        };

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            delete (window as any).livelyWindowStateChangeListener;
        };
    }, []);

    // Auto-unmute strategy to facilitate autoplay with sound
    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 5;

        const attemptUnmute = () => {
            if (isMutedRef.current) {
                sendCommand('unMute');
                sendCommand('setVolume', [volumeRef.current]);
                // We don't set setIsMuted(false) here yet to keep UI state in sync with actual success
                // but for YouTube iFrame API, there's no reliable "unmuted" callback without the heavy script.
                // So we'll optimistically set it after some time or on success if we had the full API.
                // To keep it simple and responsive:
                setIsMuted(false);
                console.log(`Unmute attempt ${attempts + 1} sent`);
            }
        };

        // 1. Periodic attempts in the first 10 seconds
        const interval = setInterval(() => {
            attempts++;
            attemptUnmute();
            if (attempts >= maxAttempts) clearInterval(interval);
        }, 2000);

        // 2. Immediate unmute on any user interaction (Browser Requirement)
        const handleGlobalClick = () => {
            console.log("Global click detected, flushing unmute");
            attemptUnmute();
            window.removeEventListener('click', handleGlobalClick);
            window.removeEventListener('keydown', handleGlobalClick);
        };

        window.addEventListener('click', handleGlobalClick);
        window.addEventListener('keydown', handleGlobalClick);

        return () => {
            clearInterval(interval);
            window.removeEventListener('click', handleGlobalClick);
            window.removeEventListener('keydown', handleGlobalClick);
        };
    }, [refreshKey]);

    const toggleMute = () => {
        const nextMutedState = !isMuted;
        sendCommand(nextMutedState ? 'mute' : 'unMute');
        if (!nextMutedState) {
            sendCommand('setVolume', [volume]);
        }
        setIsMuted(nextMutedState);
    };

    const handleVolumeChange = (newVolume: number) => {
        setVolume(newVolume);
        sendCommand('setVolume', [newVolume]);
        if (isMuted && newVolume > 0) {
            setIsMuted(false);
            sendCommand('unMute');
        }
    };

    const togglePlay = () => {
        const nextPlayState = !isPlaying;
        sendCommand(nextPlayState ? 'playVideo' : 'pauseVideo');
        setIsPlaying(nextPlayState);
    };

    const toggleZoom = () => {
        setIsZoomed(prev => !prev);
    };

    // Calculate dimensions for intelligent adaptive scaling
    const getIframeStyle = () => {
        if (!containerSize.width || !containerSize.height) {
            return { width: '100%', height: '100%' };
        }

        // When paused/minimized, we now keep the same size to avoid "jumping"
        // if (!isPlaying) { ... } logic removed per user request

        const videoRatio = 16 / 9;
        const containerRatio = containerSize.width / containerSize.height;

        let width, height;

        if (isZoomed) {
            // COVER MODE (Adaptive Zoom)
            // If container is wider than video, match width (crop height potentially, but here we want to cover)
            // Wait, if container is wider (e.g. 21:9), video (16:9) width=100% -> height is small -> black bars?
            // NO, to COVER:
            // If containerRatio > videoRatio (Wide): Width=100%, Height=Width/Ratio. 
            //    Wait, 100% width on 21:9 gives height that is LESS than container height?
            //    Example: 1000x100 -> Ratio 10. Video 1000x562. Covers.
            //    Example: 1000x1000 -> Ratio 1. Video 1000x562. Gaps on top/bottom. Fails to cover.
            // Correct logic for COVER:
            if (containerRatio > videoRatio) {
                // Container is "flatter"/wider than video.
                // To cover height, we need to match WIDTH.
                width = containerSize.width;
                height = width / videoRatio;
            } else {
                // Container is taller/narrower than video.
                // To cover width, we need to match HEIGHT.
                height = containerSize.height;
                width = height * videoRatio;
            }
        } else {
            // ORIGINAL/CONTAIN MODE (Adaptive Fit)
            // Show full video without cropping
            if (containerRatio > videoRatio) {
                // Container is wider. Limit by HEIGHT.
                height = containerSize.height;
                width = height * videoRatio;
            } else {
                // Container is taller. Limit by WIDTH.
                width = containerSize.width;
                height = width / videoRatio;
            }
        }

        return {
            width: `${width}px`,
            height: `${height}px`,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)', // Center it
        };
    };

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
        setIsPlaying(true);
        // Dispatch a custom event to sync other components if they listen for it
        window.dispatchEvent(new CustomEvent('dashboard-refresh'));
    };

    return (
        <div
            ref={containerRef}
            className="glass-panel rounded-3xl overflow-hidden h-full w-full relative group bg-black border-none shadow-none"
        >
            {/* 
                Intelligent Adaptive Video Container
                Dynamically detected dimensions replace hardcoded scaling.
            */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none" key={refreshKey}>
                <iframe
                    ref={iframeRef}
                    src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&mute=1&controls=0&disablekb=1&fs=0&loop=1&modestbranding=1&playsinline=1&rel=0&showinfo=0&iv_load_policy=3&enablejsapi=1&origin=${window.location.origin}`}
                    title="YouTube Live Stream"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    style={getIframeStyle()}
                    className="absolute transition-all duration-700 ease-in-out object-cover"
                ></iframe>
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Refresh Button */}
                <button
                    onClick={handleRefresh}
                    className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white/80 hover:bg-white/20 hover:text-white transition-all duration-300 pointer-events-auto border border-white/10"
                    title="Refresh Live Stream"
                >
                    <RotateCw size={20} className={refreshKey > 0 ? "transition-transform" : ""} style={{ transform: `rotate(${refreshKey * 360}deg)` }} />
                </button>

                {/* Play/Pause Button */}
                <button
                    onClick={togglePlay}
                    className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white/80 hover:bg-white/20 hover:text-white transition-all duration-300 pointer-events-auto border border-white/10"
                >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>

                {/* Zoom/Fit Button (4th Button) */}
                {isPlaying && (
                    <button
                        onClick={toggleZoom}
                        className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white/80 hover:bg-white/20 hover:text-white transition-all duration-300 pointer-events-auto border border-white/10"
                        title={isZoomed ? "Show Original Size" : "Fill Card"}
                    >
                        {isZoomed ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                )}

                {/* Mute and Volume Control Container */}
                <div
                    className="relative flex items-center group/volume"
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    onMouseLeave={() => setShowVolumeSlider(false)}
                >
                    {/* Volume Slider - Horizontal */}
                    <div className={`flex items-center h-full transition-all duration-300 overflow-hidden ${showVolumeSlider ? 'w-24 opacity-100 mr-2' : 'w-0 opacity-0 mr-0'}`}>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                            className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-luxury-gold hover:accent-white transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                        />
                    </div>

                    <button
                        onClick={toggleMute}
                        className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white/80 hover:bg-white/20 hover:text-white transition-all duration-300 pointer-events-auto border border-white/10 shrink-0"
                    >
                        {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>

                    {/* Floating percentage label */}
                    {showVolumeSlider && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] text-white font-mono border border-white/10">
                            {volume}%
                        </div>
                    )}
                </div>
            </div>

            {/* Subtle Gradient Overlay to blend with the dashboard if needed */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]" />
        </div>
    );
};
