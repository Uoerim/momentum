"use client";

import { useState, useRef } from "react";

interface HomeContentProps {
    isLoading?: boolean;
}

export default function HomeContent({ isLoading = false }: HomeContentProps) {
    const [tooltip, setTooltip] = useState({ visible: false, text: "", x: 0, y: 0 });
    const [careerTooltip, setCareerTooltip] = useState({ visible: false, company: "", year: "", x: 0, y: 0 });
    const tooltipRef = useRef<HTMLDivElement>(null);

    const tools = [
        { name: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-plain.svg" },
        { name: "TypeScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-plain.svg" },
        { name: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" },
        { name: "Next.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-plain.svg" },
        { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-plain.svg" },
        { name: "C++", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-plain.svg" },
        { name: "Docker", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-plain.svg" },
        { name: "Git", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-plain.svg" },
        { name: "Figma", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-plain.svg" },
    ];

    const careerStops = [
        { id: 1, title: "Engineering", company: "Ainshams University", year: "2022" },
        { id: 2, title: "Graphic Designer", company: "ASU Racing Team", year: "2024" },
        { id: 3, title: "Mobile Developer", company: "DevHouse", year: "2025" },
        { id: 4, title: "Freelancer", company: "Self-Employed", year: "2026" },
    ];

    const handleMouseMove = (e: React.MouseEvent, name: string) => {
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

    const handleCareerMouseMove = (e: React.MouseEvent, company: string, year: string) => {
        setCareerTooltip({
            visible: true,
            company,
            year,
            x: e.clientX + 15,
            y: e.clientY + 10,
        });
    };

    const handleCareerMouseLeave = () => {
        setCareerTooltip((prev) => ({ ...prev, visible: false }));
    };

    return (
        <>
            <div className={`page-content ${!isLoading ? "animate-home" : ""}`} style={{ 
                display: "flex", 
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                padding: "4rem 6rem",
                maxWidth: "1400px",
                width: "100%",
                margin: "0 auto",
                gap: "6rem"
            }}>
                {/* Left Content */}
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    flex: "1",
                    maxWidth: "600px"
                }}>
                    <p className="animate-fade-in-up delay-100" style={{ 
                        fontSize: "0.9rem", 
                        color: "#666", 
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        marginBottom: "0.5rem",
                        fontWeight: 400
                    }}>
                        Computer Engineer
                    </p>
                    
                    <h1 className="animate-fade-in-up delay-200" style={{ 
                        fontSize: "4rem", 
                        fontWeight: 300, 
                        marginBottom: "1.5rem",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.1
                    }}>
                        Yosif Ibrahim
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
                        Building complete end-to-end solutions, from low-level system components 
                        to user-facing applications. <br/> Focused on correctness, performance, and 
                        real-world constraints.
                    </p>

                    <p className="animate-fade-in-up delay-400" style={{ 
                        fontSize: "0.8rem", 
                        color: "#555", 
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        marginBottom: "1.5rem",
                        fontWeight: 400
                    }}>
                        I work with
                    </p>

                    <div className="animate-fade-in-up delay-500" style={{ 
                        display: "flex", 
                        flexWrap: "wrap", 
                        gap: "1.5rem",
                        alignItems: "center"
                    }}>
                        {tools.map((tool) => (
                            <div 
                                key={tool.name}
                                style={{
                                    display: "flex",
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
                                onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
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
                    {careerStops.map((stop, index) => {
                        // Position each stop along the vertical curved path
                        // Path: M 60 420 -> C curves to 120,340 -> 180,260 -> 100,180 -> 200,100 -> 280,30
                        const positions = [
                            { x: 40, y: 418 },    // Ainshams University - Start point
                            { x: 190, y: 280 },   // ASU Racing Team - On curve
                            { x: 80, y: 185 },    // DevHouse - On curve
                            { x: 268, y: 17 },    // Freelancer - End point
                        ];
                        // Rotation for each pin: Engineering -90, Graphic Designer 90, Mobile Developer -90, Freelancer 0
                        const rotations = [-90, 90, -90, 0];
                        // Staggered animation delays for each pin
                        const animationDelays = ["delay-1000", "delay-1200", "delay-1400", "delay-1600"];
                        const pos = positions[index];
                        const rotation = rotations[index];
                        const isLast = index === careerStops.length - 1;
                        
                        return (
                            <div
                                key={stop.id}
                                className={`animate-fade-in ${animationDelays[index]}`}
                                style={{
                                    position: "absolute",
                                    left: pos.x,
                                    top: pos.y,
                                    transform: "translate(0, -50%)",
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    gap: "10px"
                                }}
                                onMouseMove={(e) => handleCareerMouseMove(e, stop.company, stop.year)}
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
                                        transform: `rotate(${rotation}deg)`
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
            
            {/* Tool Tooltip */}
            <div
                ref={tooltipRef}
                className={`tooltip ${tooltip.visible ? "visible" : ""}`}
                style={{ left: tooltip.x, top: tooltip.y }}
            >
                {tooltip.text}
            </div>
            
            {/* Career Tooltip */}
            <div
                className={`tooltip ${careerTooltip.visible ? "visible" : ""}`}
                style={{ left: careerTooltip.x, top: careerTooltip.y }}
            >
                <span style={{ color: "#dc143c", fontWeight: 500 }}>{careerTooltip.company}</span>
                <span style={{ color: "#666", marginLeft: "6px" }}>•</span>
                <span style={{ color: "#888", marginLeft: "6px" }}>{careerTooltip.year}</span>
            </div>
        </>
    );
}
