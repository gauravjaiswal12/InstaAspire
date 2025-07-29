import React, {useEffect, useRef, useState, useCallback, forwardRef} from "react";
import Hls from "hls.js/dist/hls.js";
import { Volume2, VolumeX, Settings } from "lucide-react";

// Simple CSS for the quality selector menu
const styles = {
    qualityMenu: {
        position: 'absolute',
        bottom: 60, // Position above the mute button
        right: 16,
        background: 'rgba(0,0,0,0.8)',
        borderRadius: '6px',
        padding: '5px 0',
        color: '#fff',
        zIndex: 10,
    },
    qualityMenuItem: {
        padding: '8px 20px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    activeQuality: {
        fontWeight: 'bold',
        backgroundColor: 'rgba(255,255,255,0.2)',
    }
};

const VideoPlayer = forwardRef(({src},ref) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const hlsRef = useRef(null); // Ref to store the HLS instance

    const [isMuted, setIsMuted] = useState(true);
    const [qualityLevels, setQualityLevels] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState(-1); // -1 means 'auto'
    const [showQualityMenu, setShowQualityMenu] = useState(false);

    // --- NEW CODE: A function to set both refs ---
    // This callback ref will be called by React when the <video> element mounts.
    // It receives the DOM node as an argument.
    const setVideoRef = useCallback((node) => {
        // 1. Set our internal ref so the component's own logic can use it.
        videoRef.current = node;

        // 2. Check the type of the forwarded ref and set it accordingly.
        // This allows the parent component (ReelCard) to get the reference.
        if (typeof ref === 'function') {
            ref(node);
        } else if (ref) {
            ref.current = node;
        }
    }, [ref]); // This function depends on the forwarded 'ref'

    const loadHls = useCallback(() => {
        const v = videoRef.current;
        if (!v || !src) return;

        // Clean up any old HLS instance
        if (hlsRef.current) {
            hlsRef.current.destroy();
        }

        if (Hls.isSupported()) {
            const hls = new Hls({ autoStartLoad: true });
            hlsRef.current = hls; // Store instance

            hls.loadSource(src);
            hls.attachMedia(v);

            // When manifest is parsed, get the quality levels
            hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
                console.log("Manifest parsed!", data.levels);
                setQualityLevels(data.levels);
            });

            hls.on(Hls.Events.ERROR, (_, data) => {
                if (data.fatal) {
                    console.error("Fatal HLS error:", data);
                } else {
                    console.warn("Non-fatal HLS error:", data);
                }
            });

        } else if (v.canPlayType("application/vnd.apple.mpegurl")) {
            v.src = src;
        }
    }, [src]);

    useEffect(() => {
        const v = videoRef.current;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    loadHls();
                    v.play().catch(() => {});
                } else {
                    v.pause();
                }
            },
            { threshold: 0.6 }
        );
        containerRef.current && obs.observe(containerRef.current);

        return () => {
            obs.disconnect();
            v?.pause();
            hlsRef.current?.destroy(); // Cleanup on component unmount
        };
    }, [loadHls]);

    const toggleMute = (e) => {
        e.stopPropagation();
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(videoRef.current.muted);
    };

    const handleQualityChange = (levelIndex) => {
        if (hlsRef.current) {
            hlsRef.current.currentLevel = levelIndex;
            setSelectedLevel(levelIndex);
            setShowQualityMenu(false); // Hide menu after selection
        }
    };

    const toggleQualityMenu = (e) => {
        e.stopPropagation();
        setShowQualityMenu(prev => !prev);
    }

    return (
        <div
            ref={containerRef}
            style={{ position: "relative", width: "100%", height: "100%", background: "#000", cursor: "pointer" ,zIndex:"40" }}
            onClick={toggleMute}>
            <video
                ref={setVideoRef}
                // ref={videoRef}
                muted={isMuted}
                playsInline
                loop
                preload="metadata"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {/* --- UI Controls --- */}
            <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', gap: '10px',zIndex: 50 }} >
                {/* Quality Selector */}
                {qualityLevels.length > 1 && (
                    <div
                        onClick={toggleQualityMenu}
                        style={{ background: "rgba(0,0,0,0.6)", padding: 8, borderRadius: "50%", zIndex: 55 }}
                    >
                        <Settings size={20} color="#fff" />
                    </div>
                )}
                {/* Mute Button */}
                <div
                    onClick={toggleMute}
                    style={{ background: "rgba(0,0,0,0.6)", padding: 8, borderRadius: "50%", zIndex: 40 }}
                >
                    {isMuted ? <VolumeX size={20} color="#fff" /> : <Volume2 size={20} color="#fff" />}
                </div>
            </div>

            {/* Quality Menu Popup */}
            {showQualityMenu && (
                <div style={styles.qualityMenu} onClick={e => e.stopPropagation()} className="h-fit bg-black/80 rounded-lg p-1 z-80 w-auto">
                    {/* Auto Option */}
                    <div
                        style={{ ...styles.qualityMenuItem, ...(selectedLevel === -1 ? styles.activeQuality : {}) }}
                        onClick={() => handleQualityChange(-1)}



                    >
                        Auto
                    </div>
                    {/* Map through available levels */}
                    <div className={"bottom-10 bg-black/80 rounded-lg p-1 z-40 w-auto"}>
                        {qualityLevels.map((level, index) => (
                            <div
                                key={level.height}
                                style={{ ...styles.qualityMenuItem, ...(selectedLevel === index ? styles.activeQuality : {}) }}
                                onClick={() => handleQualityChange(index)}

                            >
                                {level.height}p
                            </div>
                        ))}
                    </div>

                </div>
            )}
        </div>
    );
});

export default VideoPlayer;