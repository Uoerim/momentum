"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import homeData from "@/data/json/home.json";

interface HomeContentProps {
    isLoading?: boolean;
    isActive?: boolean;
}

export default function HomeContent({ isLoading = false }: HomeContentProps) {
    const [tooltip, setTooltip] = useState({ visible: false, text: "", x: 0, y: 0 });
    const [careerTooltip, setCareerTooltip] = useState({ visible: false, company: "", year: "", description: "", x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(false);
    const [expandedCareer, setExpandedCareer] = useState<number | null>(null);
    const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
    const tooltipRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

    const { name, title, subtitle, tools, career } = homeData;

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Scroll animation observer
    useEffect(() => {
        if (!isMobile) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const id = entry.target.getAttribute("data-scroll-id");
                    if (!id) return;
                    
                    setVisibleSections((prev) => {
                        const newSet = new Set(prev);
                        if (entry.isIntersecting) {
                            newSet.add(id);
                        } else {
                            newSet.delete(id);
                        }
                        return newSet;
                    });
                });
            },
            { threshold: 0.15, rootMargin: "-50px" }
        );

        Object.values(sectionRefs.current).forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [isMobile]);

    const setRef = useCallback((id: string) => (el: HTMLElement | null) => {
        sectionRefs.current[id] = el;
    }, []);

    const isVisible = (id: string) => visibleSections.has(id);

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

    const handleCareerMouseMove = (e: React.MouseEvent, company: string, year: string, description: string) => {
        if (isMobile) return;
        setCareerTooltip({
            visible: true,
            company,
            year,
            description,
            x: e.clientX + 15,
            y: e.clientY + 10,
        });
    };

    const handleCareerMouseLeave = () => {
        setCareerTooltip((prev) => ({ ...prev, visible: false }));
    };

    const handleCareerClick = (id: number) => {
        if (isMobile) {
            setExpandedCareer(expandedCareer === id ? null : id);
        }
    };

    return (
        <>
            {/* Mobile: Sections */}
            {isMobile ? (
                <>
                    {/* Section 1: About + Tools - Full Viewport */}
                    <div className={`page-content mobile-hero ${!isLoading ? "animate-home" : ""}`} style={{ 
                        display: "flex", 
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "2rem 1.5rem",
                        width: "100%",
                        boxSizing: "border-box"
                    }}>
                        {/* Playing Card Suits */}
                        <div className="animate-fade-in-up" style={{
                            display: "flex",
                            gap: "1.5rem",
                            marginBottom: "2.5rem",
                            alignItems: "center"
                        }}>
                            <img src="/red_diamond.svg" alt="Diamond" style={{ width: 28, height: "auto", opacity: 0.9 }} />
                            <img src="/white_spade.svg" alt="Spade" style={{ width: 24, height: "auto", opacity: 0.7 }} />
                            <img src="/red_heart.svg" alt="Heart" style={{ width: 24, height: "auto", opacity: 0.9 }} />
                            <img src="/white_club.svg" alt="Club" style={{ width: 22, height: "auto", opacity: 0.7 }} />
                        </div>
                        
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            maxWidth: "100%",
                            padding: "0 1rem"
                        }}>
                            <p className="animate-fade-in-up delay-100" style={{ 
                                fontSize: "0.75rem", 
                                color: "#666", 
                                letterSpacing: "0.15em",
                                textTransform: "uppercase",
                                marginBottom: "0.5rem",
                                fontWeight: 400,
                                textAlign: "center"
                            }}>
                                {title}
                            </p>
                            
                            <h1 className="animate-fade-in-up delay-200" style={{ 
                                fontSize: "2.5rem", 
                                fontWeight: 300, 
                                marginBottom: "1.5rem",
                                letterSpacing: "-0.02em",
                                lineHeight: 1.1,
                                textAlign: "center"
                            }}>
                                {name}
                            </h1>
                            
                            <p className="animate-fade-in-up delay-300" style={{ 
                                fontSize: "0.95rem", 
                                color: "#888", 
                                maxWidth: "600px",
                                lineHeight: 1.8,
                                fontWeight: 400,
                                marginBottom: "2.5rem",
                                fontStyle: "normal",
                                textAlign: "center"
                            }}>
                                {subtitle}
                            </p>

                            <p className="animate-fade-in-up delay-400" style={{ 
                                fontSize: "0.8rem", 
                                color: "#555", 
                                letterSpacing: "0.2em",
                                textTransform: "uppercase",
                                marginBottom: "1.5rem",
                                fontWeight: 400,
                                textAlign: "center",
                                width: "100%"
                            }}>
                                I work with
                            </p>

                            <div className="animate-fade-in-up delay-500" style={{ 
                                display: "flex", 
                                flexWrap: "wrap", 
                                gap: "1rem",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                {tools.map((tool) => (
                                    <div 
                                        key={tool.name}
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "0.25rem"
                                        }}
                                    >
                                        <img 
                                            src={tool.icon} 
                                            alt={tool.name}
                                            style={{ 
                                                width: 28, 
                                                height: 28,
                                                filter: "brightness(0) invert(1)"
                                            }} 
                                        />
                                        <span style={{
                                            fontSize: "0.6rem",
                                            color: "#888",
                                            textAlign: "center"
                                        }}>
                                            {tool.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Career Journey */}
                    <div 
                        ref={setRef("career")}
                        data-scroll-id="career"
                        className={`page-content ${!isLoading ? "animate-home" : ""}`} 
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "2rem 1.5rem",
                            width: "100%",
                            boxSizing: "border-box",
                            opacity: isVisible("career") ? 1 : 0,
                            transition: "opacity 0.5s ease-out"
                        }}
                    >
                        <div style={{
                            width: "100%",
                            maxWidth: "100%",
                            padding: "0 1rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.75rem"
                        }}>
                            <p style={{
                                fontSize: "0.8rem",
                                color: "#555",
                                letterSpacing: "0.2em",
                                textTransform: "uppercase",
                                marginBottom: "1rem",
                                fontWeight: 400,
                                textAlign: "center"
                            }}>
                                Career Journey
                            </p>
                            {[...career].reverse().map((stop, index) => {
                                const isFirst = index === 0;
                                const isExpanded = expandedCareer === stop.id;
                                return (
                                    <div
                                        key={stop.id}
                                        onClick={() => handleCareerClick(stop.id)}
                                        style={{
                                            background: isFirst ? "rgba(220, 20, 60, 0.1)" : "rgba(255, 255, 255, 0.03)",
                                            border: `1px solid ${isFirst ? "rgba(220, 20, 60, 0.3)" : "rgba(255, 255, 255, 0.1)"}`,
                                            borderRadius: "12px",
                                            padding: "1rem 1.25rem",
                                            cursor: "pointer",
                                            transition: "all 0.2s"
                                        }}
                                    >
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        }}>
                                            <span style={{
                                                fontSize: "0.95rem",
                                                color: isFirst ? "#fff" : "#ccc",
                                                fontWeight: isFirst ? 500 : 400
                                            }}>
                                                {stop.title}
                                            </span>
                                            <span style={{
                                                fontSize: "0.75rem",
                                                color: "#888"
                                            }}>
                                                {stop.year}
                                            </span>
                                        </div>
                                        {isExpanded && (
                                            <div style={{
                                                marginTop: "0.75rem",
                                                paddingTop: "0.75rem",
                                                borderTop: "1px solid rgba(255, 255, 255, 0.1)"
                                            }}>
                                                <p style={{
                                                    fontSize: "0.8rem",
                                                    color: "#dc143c",
                                                    margin: "0 0 0.25rem 0"
                                                }}>
                                                    {stop.company}
                                                </p>
                                                <p style={{
                                                    fontSize: "0.8rem",
                                                    color: "#888",
                                                    margin: 0,
                                                    lineHeight: 1.5
                                                }}>
                                                    {stop.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            ) : (
            /* Desktop Layout */
            <div className={`page-content ${!isLoading ? "animate-home" : ""}`} style={{ 
                display: "flex", 
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                padding: "4rem 6rem",
                maxWidth: "1400px",
                width: "100%",
                margin: "0 auto",
                gap: "6rem",
                overflowY: "auto"
            }}>
                {/* Left Content */}
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    flex: "1",
                    maxWidth: "600px",
                    width: "100%"
                }}>
                    <p className="animate-fade-in-up delay-100" style={{ 
                        fontSize: "0.9rem", 
                        color: "#666", 
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        marginBottom: "0.5rem",
                        fontWeight: 400,
                        textAlign: "left"
                    }}>
                        {title}
                    </p>
                    
                    <h1 className="animate-fade-in-up delay-200" style={{ 
                        fontSize: "4rem", 
                        fontWeight: 300, 
                        marginBottom: "1.5rem",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.1,
                        textAlign: "left"
                    }}>
                        {name}
                    </h1>
                    
                    <p className="animate-fade-in-up delay-300" style={{ 
                        fontSize: "1.1rem", 
                        color: "#888", 
                        maxWidth: "600px",
                        lineHeight: 1.8,
                        fontWeight: 400,
                        marginBottom: "3rem",
                        fontStyle: "normal",
                        textAlign: "left"
                    }}>
                        {subtitle}
                    </p>

                    <p className="animate-fade-in-up delay-400" style={{ 
                        fontSize: "0.8rem", 
                        color: "#555", 
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        marginBottom: "1.5rem",
                        fontWeight: 400,
                        textAlign: "left",
                        width: "100%"
                    }}>
                        I work with
                    </p>

                    <div className="animate-fade-in-up delay-500" style={{ 
                        display: "flex", 
                        flexWrap: "wrap", 
                        gap: "1.5rem",
                        alignItems: "center",
                        justifyContent: "flex-start"
                    }}>
                        {tools.map((tool) => (
                            <div 
                                key={tool.name}
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    opacity: 0.7,
                                    transition: "opacity 0.2s ease",
                                    cursor: "pointer"
                                }}
                                onMouseMove={(e) => handleMouseMove(e, tool.name)}
                                onMouseLeave={(e) => {
                                    handleMouseLeave();
                                    e.currentTarget.style.opacity = "0.7";
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
                            >
                                <img 
                                    src={tool.icon} 
                                    alt={tool.name}
                                    style={{ 
                                        width: 32, 
                                        height: 32,
                                        filter: "brightness(0) invert(1)"
                                    }} 
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side - Career Pathway */}
                <div style={{
                    position: "relative",
                    width: "350px",
                    height: "450px",
                    flexShrink: 0
                }}>
                    {/* SVG Path */}
                    <svg
                        width="350"
                        height="450"
                        viewBox="0 0 350 450"
                        style={{ position: "absolute", top: 0, left: 0 }}
                    >
                        {/* Glow filter */}
                        <defs>
                            <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur"/>
                                <feColorMatrix in="blur" type="matrix" 
                                    values="1 0 0 0 0  0 0.1 0 0 0  0 0 0.2 0 0  0 0 0 0.6 0" 
                                    result="glow"/>
                                <feMerge>
                                    <feMergeNode in="glow"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                            <linearGradient id="pathGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                                <stop offset="0%" stopColor="#8b0000" />
                                <stop offset="50%" stopColor="#dc143c" />
                                <stop offset="100%" stopColor="#ff4757" />
                            </linearGradient>
                        </defs>
                        
                        {/* Main curved path with integrated glow */}
                        <path
                            className="animate-draw-path delay-600"
                            d="M 60 420 
                               C 60 380, 60 360, 120 340
                               C 180 320, 200 300, 180 260
                               C 160 220, 100 220, 100 180
                               C 100 140, 160 120, 200 100
                               C 240 80, 280 60, 280 30"
                            fill="none"
                            stroke="url(#pathGradient)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            filter="url(#glow)"
                        />
                    </svg>

                    {/* Career Stop Markers */}
                    {career.map((stop, index) => {
                        // Staggered animation delays for each pin
                        const animationDelays = ["delay-1000", "delay-1200", "delay-1400", "delay-1600"];
                        const isLast = index === career.length - 1;
                        
                        return (
                            <div
                                key={stop.id}
                                className={`animate-fade-in ${animationDelays[index]}`}
                                style={{
                                    position: "absolute",
                                    left: stop.position.x,
                                    top: stop.position.y,
                                    transform: "translate(0, -50%)",
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    gap: "10px"
                                }}
                                onMouseMove={(e) => handleCareerMouseMove(e, stop.company, stop.year, stop.description)}
                                onMouseLeave={handleCareerMouseLeave}
                            >
                                {/* Pin SVG */}
                                <svg 
                                    width={isLast ? "24" : "18"} 
                                    height={isLast ? "24" : "18"} 
                                    viewBox="0 0 444.406 444.406"
                                    style={{
                                        filter: isLast 
                                            ? "drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))" 
                                            : "drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))",
                                        flexShrink: 0,
                                        transform: `rotate(${stop.rotation}deg)`
                                    }}
                                >
                                    <path 
                                        fill={isLast ? "#ffffff" : "#cccccc"}
                                        d="M222.208,0c-66.672,0-120.906,54.234-120.906,120.916c0,48.704,28.959,90.736,70.55,109.875
                                            l46.076,213.615h8.559l46.076-213.615c41.582-19.15,70.541-61.171,70.541-109.875C343.104,54.234,288.889,0,222.208,0z
                                            M222.208,215.823c-52.329,0-94.917-42.578-94.917-94.917c0-52.349,42.578-94.907,94.917-94.907s94.907,42.569,94.907,94.907
                                            S274.537,215.823,222.208,215.823z"
                                    />
                                </svg>
                                
                                {/* Title Label */}
                                <div
                                    style={{
                                        background: "rgba(20, 20, 20, 0.95)",
                                        padding: "6px 12px",
                                        borderRadius: "4px",
                                        whiteSpace: "nowrap",
                                        backdropFilter: "blur(8px)"
                                    }}
                                >
                                    <p style={{
                                        fontSize: "0.7rem",
                                        color: isLast ? "#fff" : "#aaa",
                                        margin: 0,
                                        fontWeight: isLast ? 500 : 400,
                                        letterSpacing: "0.02em"
                                    }}>
                                        {stop.title}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            )}
            
            {/* Tool Tooltip - Desktop only */}
            {!isMobile && (
                <div
                    ref={tooltipRef}
                    className={`tooltip ${tooltip.visible ? "visible" : ""}`}
                    style={{ left: tooltip.x, top: tooltip.y }}
                >
                    {tooltip.text}
                </div>
            )}
            
            {/* Career Tooltip - Desktop only */}
            {!isMobile && (
                <div
                    className={`tooltip ${careerTooltip.visible ? "visible" : ""}`}
                    style={{ 
                        left: careerTooltip.x, 
                        top: careerTooltip.y,
                        maxWidth: "280px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: "6px",
                        whiteSpace: "normal"
                    }}
                >
                    <div>
                        <span style={{ color: "#dc143c", fontWeight: 500 }}>{careerTooltip.company}</span>
                        <span style={{ color: "#666", marginLeft: "6px" }}>•</span>
                        <span style={{ color: "#888", marginLeft: "6px" }}>{careerTooltip.year}</span>
                    </div>
                    {careerTooltip.description && (
                        <p style={{ 
                            color: "#aaa", 
                            fontSize: "0.75rem", 
                            margin: 0,
                            lineHeight: 1.4,
                            whiteSpace: "normal",
                            wordWrap: "break-word"
                        }}>
                            {careerTooltip.description}
                        </p>
                    )}
                </div>
            )}
        </>
    );
}
