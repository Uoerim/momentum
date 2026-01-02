"use client";

import { useState, useEffect } from "react";

export default function NavigationPopup() {
    const [mounted, setMounted] = useState(false);
    const [show, setShow] = useState(false);
    const [removed, setRemoved] = useState(false);

    useEffect(() => {
        // Mount the component
        setMounted(true);
        
        // Fade in after loading screen finishes (3.1s)
        const fadeInTimer = setTimeout(() => setShow(true), 3200);
        
        // Start fade out after 9 seconds of being visible
        const fadeOutTimer = setTimeout(() => setShow(false), 12000);
        
        // Remove from DOM after fade out animation completes
        const removeTimer = setTimeout(() => setRemoved(true), 13000);

        return () => {
            clearTimeout(fadeInTimer);
            clearTimeout(fadeOutTimer);
            clearTimeout(removeTimer);
        };
    }, []);

    if (removed) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 24,
                left: 0,
                zIndex: 2000,
                background: "rgba(20, 20, 20, 0.95)",
                color: "#e5e5e5",
                borderRadius: "0 4px 4px 0",
                padding: "14px 20px 14px 16px",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontWeight: 500,
                letterSpacing: "0.01em",
                opacity: mounted && show ? 1 : 0,
                transform: mounted && show ? "translateX(0)" : "translateX(-100%)",
                transition: "opacity 0.4s ease, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                pointerEvents: "none",
                borderLeft: "3px solid #e50914",
                boxShadow: "4px 0 20px rgba(0,0,0,0.5)"
            }}
        >
            <span style={{ color: "#b3b3b3" }}>Navigate with</span>
            <img src="/red_diamond.svg" alt="Diamond" style={{ height: 18 }} />
            <img src="/black_spade.svg" alt="Spade" style={{ height: 18, filter: "invert(0.7)" }} />
            <img src="/red_heart.svg" alt="Heart" style={{ height: 18 }} />
            <img src="/black_club.svg" alt="Club" style={{ height: 18, filter: "invert(0.7)" }} />
        </div>
    );
}
