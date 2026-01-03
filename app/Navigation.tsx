"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

const navItems = [
    { id: "home", name: "Home", icon: "/red_diamond.svg", glowColor: "#FE2336" },
    { id: "projects", name: "Projects", icon: "/black_spade.svg", glowColor: "#333333" },
    { id: "blog", name: "Blog", icon: "/red_heart.svg", glowColor: "#FD2636" },
    { id: "contact", name: "Contact", icon: "/black_club.svg", glowColor: "#333333" },
];

export default function Navigation() {
    const [activeSection, setActiveSection] = useState("home");
    const [tooltip, setTooltip] = useState({ visible: false, text: "", x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        const handleActiveSectionChange = (e: CustomEvent<string>) => {
            setActiveSection(e.detail);
        };

        window.addEventListener("activeSectionChange", handleActiveSectionChange as EventListener);

        return () => {
            window.removeEventListener("activeSectionChange", handleActiveSectionChange as EventListener);
        };
    }, []);

    const handleClick = (id: string) => {
        const scrollToSection = (window as unknown as { scrollToSection?: (id: string) => void }).scrollToSection;
        if (scrollToSection) {
            scrollToSection(id);
        }
    };

    const handleMouseMove = (e: React.MouseEvent, name: string) => {
        if (isMobile) return;
        setTooltip({
            visible: true,
            text: name,
            x: e.clientX + 15,
            y: e.clientY + 10,
        });
    };

    const handleMouseLeave = () => {
        setTooltip((prev) => ({ ...prev, visible: false }));
    };

    const getGlowStyle = (item: typeof navItems[0], isActive: boolean) => {
        if (!isActive) return {};
        return {
            transform: "scale(1.1)",
            filter: `drop-shadow(0 0 8px ${item.glowColor}) drop-shadow(0 0 15px ${item.glowColor})`,
        };
    };

    // Don't render navigation on mobile - all sections are stacked
    if (isMobile) return null;

    return (
        <>
            <nav className="nav-bar">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        className="nav-bar-btn"
                        onClick={() => handleClick(item.id)}
                        onMouseMove={(e) => handleMouseMove(e, item.name)}
                        onMouseLeave={handleMouseLeave}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: isMobile ? "4px" : "0"
                        }}
                    >
                        <Image
                            src={item.icon}
                            alt={item.name}
                            width={49}
                            height={49}
                            style={getGlowStyle(item, activeSection === item.id)}
                        />
                        {isMobile && (
                            <span style={{
                                fontSize: "0.6rem",
                                color: activeSection === item.id ? "#fff" : "#666",
                                fontWeight: activeSection === item.id ? 500 : 400,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                transition: "color 0.2s"
                            }}>
                                {item.name}
                            </span>
                        )}
                    </button>
                ))}
            </nav>
            {!isMobile && (
                <div
                    ref={tooltipRef}
                    className={`tooltip ${tooltip.visible ? "visible" : ""}`}
                    style={{ left: tooltip.x, top: tooltip.y }}
                >
                    {tooltip.text}
                </div>
            )}
        </>
    );
}
