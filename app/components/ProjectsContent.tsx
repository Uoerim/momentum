"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import projectsData from "@/data/json/projects.json";

interface Project {
    id: number;
    name: string;
    description: string;
    fullDescription: string;
    technologies: string[];
    suit: "diamond" | "spade" | "heart" | "club";
    value: string;
    image: string;
    customIcon?: string | null;
    link?: string;
}

const suits = projectsData.suits as Record<string, { icon: string; color: string }>;
const projects = projectsData.projects as Project[];

interface CardPosition {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ProjectsContentProps {
    isLoading?: boolean;
    isActive?: boolean;
}

export default function ProjectsContent({ isLoading = false, isActive = false }: ProjectsContentProps) {
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showBackdrop, setShowBackdrop] = useState(false);
    const [cardRect, setCardRect] = useState<CardPosition | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [visibleCards, setVisibleCards] = useState<number[]>([]);
    const [cardsAnimated, setCardsAnimated] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const prevIsActive = useRef(false);
    const cardRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

    const cardsPerPage = 8;
    const totalPages = Math.ceil(projects.length / cardsPerPage);
    const currentPageProjects = projects.slice(currentPage * cardsPerPage, (currentPage + 1) * cardsPerPage);

    // Trigger card loading animation when section becomes active or page changes
    useEffect(() => {
        // Detect when isActive changes from false to true
        if (!isLoading && isActive && !prevIsActive.current) {
            prevIsActive.current = true;
            
            // Stagger each card's appearance with individual timeouts
            currentPageProjects.forEach((project, index) => {
                setTimeout(() => {
                    setVisibleCards(prev => [...prev, project.id]);
                }, 100 + index * 120); // 100ms initial delay + 120ms per card
            });
            
            // Mark animations complete after all cards have animated
            setTimeout(() => setCardsAnimated(true), 100 + currentPageProjects.length * 120 + 500);
        }
        
        // Reset when section becomes inactive
        if (!isActive && prevIsActive.current) {
            prevIsActive.current = false;
            setVisibleCards([]);
            setCardsAnimated(false);
        }
    }, [isLoading, isActive]);

    // Animate cards when page changes
    useEffect(() => {
        if (isActive && prevIsActive.current) {
            setVisibleCards([]);
            setCardsAnimated(false);
            
            // Stagger each card's appearance with individual timeouts
            currentPageProjects.forEach((project, index) => {
                setTimeout(() => {
                    setVisibleCards(prev => [...prev, project.id]);
                }, 50 + index * 80); // Faster animation for page changes
            });
            
            setTimeout(() => setCardsAnimated(true), 50 + currentPageProjects.length * 80 + 300);
        }
    }, [currentPage]);

    const openModal = (projectId: number) => {
        const cardEl = cardRefs.current[projectId];
        if (!cardEl) return;
        
        const rect = cardEl.getBoundingClientRect();
        setCardRect({
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
        });
        setSelectedId(projectId);
        setIsAnimating(true);
        
        // Start the animation to center after capturing position
        requestAnimationFrame(() => {
            setShowBackdrop(true);
            setTimeout(() => {
                setIsFlipped(true);
            }, 400);
        });
    };

    const closeModal = () => {
        // Re-capture the card position before animating back
        if (selectedId !== null) {
            const cardEl = cardRefs.current[selectedId];
            if (cardEl) {
                const rect = cardEl.getBoundingClientRect();
                setCardRect({
                    x: rect.left,
                    y: rect.top,
                    width: rect.width,
                    height: rect.height
                });
            }
        }
        
        setIsFlipped(false);
        // Wait for flip to complete, then move back
        setTimeout(() => {
            setShowBackdrop(false);
        }, 350);
        // Clean up after return animation - wait for position animation to fully complete
        setTimeout(() => {
            setIsAnimating(false);
            setSelectedId(null);
            setCardRect(null);
        }, 850);
    };

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && selectedId !== null && isFlipped) {
                closeModal();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedId, isFlipped]);

    // Calculate center position for modal - center the card+image combination
    // Card: 450px, Gap: 30px, Image: 700px = 1180px total. Offset = 1180/2 = 590
    const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 - 590 : 0;
    const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 - 325 : 0;

    return (
        <div
            className={`${!isLoading ? "animate-projects" : ""}`}
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: "var(--background)",
                padding: "2rem",
                boxSizing: "border-box"
            }}
        >
            {/* Backdrop */}
            <div
                onClick={() => isFlipped && closeModal()}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: showBackdrop ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0)",
                    zIndex: selectedId !== null ? 998 : -1,
                    transition: "background 0.4s ease",
                    cursor: isFlipped ? "pointer" : "default",
                    pointerEvents: selectedId !== null && showBackdrop ? "auto" : "none"
                }}
            />

            {/* Cards Container */}
            <div 
                className="animate-fade-in-up delay-200"
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "0 4rem",
                    minHeight: 0
                }}
            >
                {/* Header */}
                <div style={{
                    width: "100%",
                    maxWidth: "800px",
                    marginBottom: "1.5rem"
                }}>
                    <p style={{
                        fontSize: "0.65rem",
                        fontWeight: 400,
                        color: "#4a4a4a",
                        letterSpacing: "0.25em",
                        textTransform: "uppercase",
                        margin: 0,
                        fontFamily: "system-ui, -apple-system, sans-serif"
                    }}>
                        A hand of my finest work
                    </p>
                </div>

                {/* Cards Grid */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 180px)",
                    gridTemplateRows: "repeat(2, 260px)",
                    gap: "1.25rem",
                    maxWidth: "1000px"
                }}>
                {currentPageProjects.map((project, index) => {
                    const suit = suits[project.suit];
                    const isRed = project.suit === "diamond" || project.suit === "heart";
                    const isHovered = hoveredId === project.id;
                    const isSelected = selectedId === project.id;
                    const isCardActive = isSelected && isAnimating;
                    const isCardVisible = visibleCards.includes(project.id);

                    return (
                        <div
                            key={project.id}
                            ref={(el) => { cardRefs.current[project.id] = el; }}
                            onClick={() => {
                                if (selectedId === null) {
                                    openModal(project.id);
                                }
                            }}
                            onMouseEnter={() => !isSelected && setHoveredId(project.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            style={{
                                opacity: isCardVisible ? 1 : 0,
                                visibility: isCardActive ? "hidden" : "visible",
                                background: "#EDEDED",
                                borderRadius: "12px",
                                position: "relative",
                                cursor: selectedId === null ? "pointer" : "default",
                                transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s ease",
                                transform: isHovered 
                                    ? `translateY(-8px) rotate(${(index % 2 === 0 ? 2 : -2)}deg)` 
                                    : isCardVisible ? "translateY(0) rotate(0deg)" : "translateY(40px) rotate(0deg)",
                                boxShadow: isHovered 
                                    ? "0 20px 40px rgba(0,0,0,0.3), 0 0 0 2px rgba(0,0,0,0.1)" 
                                    : "0 4px 12px rgba(0,0,0,0.15)",
                                display: "flex",
                                flexDirection: "column",
                                padding: "0.75rem",
                                overflow: "hidden"
                            }}
                        >
                            {/* Top Left Corner */}
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                position: "absolute",
                                top: "0.5rem",
                                left: "0.5rem"
                            }}>
                                <span style={{
                                    fontSize: "1.1rem",
                                    fontWeight: 700,
                                    color: isRed ? suit.color : "#1a1a1a",
                                    lineHeight: 1
                                }}>
                                    {project.value}
                                </span>
                                <Image
                                    src={suit.icon}
                                    alt={project.suit}
                                    width={16}
                                    height={16}
                                    style={{ marginTop: "2px" }}
                                />
                            </div>

                            {/* Center Content */}
                            <div style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "1.5rem 0.5rem"
                            }}>
                                <Image
                                    src={project.customIcon || suit.icon}
                                    alt={project.name}
                                    width={48}
                                    height={48}
                                    style={{
                                        transition: "transform 0.3s",
                                        transform: isHovered ? "scale(1.15)" : "scale(1)"
                                    }}
                                />
                                <h3 style={{
                                    fontSize: "0.9rem",
                                    fontWeight: 600,
                                    color: "#1a1a1a",
                                    margin: "0.75rem 0 0.25rem 0",
                                    textAlign: "center"
                                }}>
                                    {project.name}
                                </h3>
                                <p style={{
                                    fontSize: "0.65rem",
                                    color: "#666",
                                    margin: 0,
                                    textAlign: "center",
                                    lineHeight: 1.4
                                }}>
                                    {project.description}
                                </p>
                            </div>

                            {/* Bottom Right Corner (upside down) */}
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                position: "absolute",
                                bottom: "0.5rem",
                                right: "0.5rem",
                                transform: "rotate(180deg)"
                            }}>
                                <span style={{
                                    fontSize: "1.1rem",
                                    fontWeight: 700,
                                    color: isRed ? suit.color : "#1a1a1a",
                                    lineHeight: 1
                                }}>
                                    {project.value}
                                </span>
                                <Image
                                    src={suit.icon}
                                    alt={project.suit}
                                    width={16}
                                    height={16}
                                    style={{ marginTop: "2px" }}
                                />
                            </div>
                        </div>
                    );
                })}
                </div>

                {/* Pagination Arrows */}
                {totalPages > 1 && (
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "1.5rem",
                        marginTop: "2rem"
                    }}>
                        {/* Left Arrow */}
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            disabled={currentPage === 0}
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "50%",
                                background: currentPage === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: currentPage === 0 ? "#444" : "#fff",
                                fontSize: "1.2rem",
                                cursor: currentPage === 0 ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                                if (currentPage !== 0) {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                                    e.currentTarget.style.transform = "scale(1.05)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = currentPage === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)";
                                e.currentTarget.style.transform = "scale(1)";
                            }}
                        >
                            ←
                        </button>

                        {/* Page Indicator */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem"
                        }}>
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <div
                                    key={i}
                                    onClick={() => setCurrentPage(i)}
                                    style={{
                                        width: i === currentPage ? "24px" : "8px",
                                        height: "8px",
                                        borderRadius: "4px",
                                        background: i === currentPage ? "#dc143c" : "rgba(255,255,255,0.2)",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease"
                                    }}
                                />
                            ))}
                        </div>

                        {/* Right Arrow */}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                            disabled={currentPage === totalPages - 1}
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "50%",
                                background: currentPage === totalPages - 1 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: currentPage === totalPages - 1 ? "#444" : "#fff",
                                fontSize: "1.2rem",
                                cursor: currentPage === totalPages - 1 ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                                if (currentPage !== totalPages - 1) {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                                    e.currentTarget.style.transform = "scale(1.05)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = currentPage === totalPages - 1 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)";
                                e.currentTarget.style.transform = "scale(1)";
                            }}
                        >
                            →
                        </button>
                    </div>
                )}
            </div>

            {/* Animated Card Modal */}
            {selectedId !== null && cardRect && (() => {
                const project = projects.find(p => p.id === selectedId)!;
                const suit = suits[project.suit];
                const isRed = project.suit === "diamond" || project.suit === "heart";
                
                return (
                <>
                    <div
                        style={{
                            position: "fixed",
                            left: showBackdrop ? centerX : cardRect.x,
                            top: showBackdrop ? centerY : cardRect.y,
                            width: showBackdrop ? 450 : 180,
                            height: showBackdrop ? 650 : 260,
                            zIndex: 1000,
                            perspective: "1500px",
                            transition: "left 0.4s cubic-bezier(0.4, 0, 0.2, 1), top 0.4s cubic-bezier(0.4, 0, 0.2, 1), width 0.4s cubic-bezier(0.4, 0, 0.2, 1), height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            pointerEvents: isFlipped ? "auto" : "none"
                        }}
                    >
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                position: "relative",
                                transformStyle: "preserve-3d",
                                transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
                            }}
                        >
                            {/* Front of Card */}
                            <div
                                style={{
                                    position: "absolute",
                                    width: "100%",
                                    height: "100%",
                                    backfaceVisibility: "hidden",
                                    WebkitBackfaceVisibility: "hidden",
                                    background: "#EDEDED",
                                    borderRadius: "12px",
                                    boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
                                    display: "flex",
                                    flexDirection: "column",
                                    padding: "0.75rem",
                                    overflow: "hidden"
                                }}
                            >
                                {/* Top Left Corner */}
                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    position: "absolute",
                                    top: "0.5rem",
                                    left: "0.5rem"
                                }}>
                                    <span style={{
                                        fontSize: "1.1rem",
                                        fontWeight: 700,
                                        color: isRed ? suit.color : "#1a1a1a",
                                        lineHeight: 1
                                    }}>
                                        {project.value}
                                    </span>
                                    <Image
                                        src={suit.icon}
                                        alt={project.suit}
                                        width={16}
                                        height={16}
                                        style={{ marginTop: "2px" }}
                                    />
                                </div>

                                {/* Center Content */}
                                <div style={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "1.5rem 0.5rem"
                                }}>
                                    <Image
                                        src={project.customIcon || suit.icon}
                                        alt={project.name}
                                        width={48}
                                        height={48}
                                    />
                                    <h3 style={{
                                        fontSize: "0.9rem",
                                        fontWeight: 600,
                                        color: "#1a1a1a",
                                        margin: "0.75rem 0 0.25rem 0",
                                        textAlign: "center"
                                    }}>
                                        {project.name}
                                    </h3>
                                    <p style={{
                                        fontSize: "0.65rem",
                                        color: "#666",
                                        margin: 0,
                                        textAlign: "center",
                                        lineHeight: 1.4
                                    }}>
                                        {project.description}
                                    </p>
                                </div>

                                {/* Bottom Right Corner (upside down) */}
                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    position: "absolute",
                                    bottom: "0.5rem",
                                    right: "0.5rem",
                                    transform: "rotate(180deg)"
                                }}>
                                    <span style={{
                                        fontSize: "1.1rem",
                                        fontWeight: 700,
                                        color: isRed ? suit.color : "#1a1a1a",
                                        lineHeight: 1
                                    }}>
                                        {project.value}
                                    </span>
                                    <Image
                                        src={suit.icon}
                                        alt={project.suit}
                                        width={16}
                                        height={16}
                                        style={{ marginTop: "2px" }}
                                    />
                                </div>
                            </div>

                            {/* Back of Card (Project Info) */}
                            <div
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    position: "absolute",
                                    width: "100%",
                                    height: "100%",
                                    backfaceVisibility: "hidden",
                                    WebkitBackfaceVisibility: "hidden",
                                    background: "#EDEDED",
                                    borderRadius: "16px",
                                    boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
                                    transform: "rotateY(180deg)",
                                    overflow: "hidden",
                                    display: "flex",
                                    flexDirection: "column"
                                }}
                            >
                                {/* Header */}
                                <div style={{
                                    padding: "1.5rem",
                                    borderBottom: "1px solid rgba(0,0,0,0.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1rem",
                                    flexShrink: 0
                                }}>
                                    <Image
                                        src={project.customIcon || suit.icon}
                                        alt={project.name}
                                        width={40}
                                        height={40}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <h2 style={{
                                            fontSize: "1.4rem",
                                            fontWeight: 600,
                                            color: "#1a1a1a",
                                            margin: 0
                                        }}>
                                            {project.name}
                                        </h2>
                                        <p style={{
                                            fontSize: "0.8rem",
                                            color: "#666",
                                            margin: "0.25rem 0 0 0"
                                        }}>
                                            {project.description}
                                        </p>
                                    </div>
                                    <button
                                        onClick={closeModal}
                                        style={{
                                            width: "36px",
                                            height: "36px",
                                            borderRadius: "50%",
                                            background: "rgba(0,0,0,0.1)",
                                            border: "none",
                                            color: "#1a1a1a",
                                            fontSize: "1.2rem",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            transition: "background 0.2s"
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.2)"}
                                        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.1)"}
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Scrollable Content */}
                                <div style={{
                                    flex: 1,
                                    overflowY: "auto",
                                    padding: "1.5rem",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "1.25rem"
                                }}>
                                    {/* Description */}
                                    <div>
                                        <h3 style={{
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            color: "#999",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                            margin: "0 0 0.5rem 0"
                                        }}>
                                            About
                                        </h3>
                                        <p style={{
                                            fontSize: "0.9rem",
                                            color: "#333",
                                            margin: 0,
                                            lineHeight: 1.6
                                        }}>
                                            {project.fullDescription}
                                        </p>
                                    </div>

                                    {/* Technologies */}
                                    <div>
                                        <h3 style={{
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            color: "#999",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                            margin: "0 0 0.5rem 0"
                                        }}>
                                            Technologies
                                        </h3>
                                        <div style={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: "0.5rem"
                                        }}>
                                            {project.technologies.map((tech, i) => (
                                                <span
                                                    key={i}
                                                    style={{
                                                        padding: "0.4rem 0.75rem",
                                                        background: isRed ? `${suit.color}15` : "rgba(26,26,26,0.08)",
                                                        borderRadius: "6px",
                                                        fontSize: "0.8rem",
                                                        color: isRed ? suit.color : "#1a1a1a",
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div style={{
                                    padding: "1rem 1.5rem",
                                    borderTop: "1px solid rgba(0,0,0,0.1)",
                                    flexShrink: 0
                                }}>
                                    <button 
                                        onClick={() => project.link && window.open(project.link, "_blank")}
                                        style={{
                                        width: "100%",
                                        padding: "0.9rem",
                                        background: isRed ? suit.color : "#1a1a1a",
                                        border: "none",
                                        borderRadius: "10px",
                                        color: "#fff",
                                        fontSize: "0.9rem",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        transition: "transform 0.2s, box-shadow 0.2s"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                    >
                                        View Project →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Image Panel - appears on the right after flip */}
                    <div
                        style={{
                            position: "fixed",
                            left: centerX + 450 + 30,
                            top: centerY,
                            width: 700,
                            height: 650,
                            zIndex: 999,
                            opacity: isFlipped ? 1 : 0,
                            transform: isFlipped ? "translateX(0)" : "translateX(-20px)",
                            transition: "opacity 0.4s ease 0.2s, transform 0.4s ease 0.2s",
                            pointerEvents: isFlipped ? "auto" : "none",
                            borderRadius: "16px",
                            overflow: "hidden",
                            boxShadow: "0 30px 80px rgba(0,0,0,0.4)"
                        }}
                    >
                        <Image
                            src={project.image}
                            alt={project.name}
                            width={700}
                            height={650}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition: "center center"
                            }}
                        />
                    </div>
                </>
                );
            })()}
        </div>
    );
}
