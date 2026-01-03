"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
    initialProjectName?: string;
}

export default function ProjectsContent({ isLoading = false, isActive = false, initialProjectName }: ProjectsContentProps) {
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showBackdrop, setShowBackdrop] = useState(false);
    const [cardRect, setCardRect] = useState<CardPosition | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [visibleCards, setVisibleCards] = useState<number[]>([]);
    const [cardsAnimated, setCardsAnimated] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [scrollVisible, setScrollVisible] = useState<Set<string>>(new Set());
    const [initialProjectOpened, setInitialProjectOpened] = useState(false);
    const prevIsActive = useRef(false);
    const cardRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
    const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

    useEffect(() => {
        const checkScreen = () => {
            setIsMobile(window.innerWidth <= 480);
            setIsTablet(window.innerWidth <= 768 && window.innerWidth > 480);
        };
        checkScreen();
        window.addEventListener("resize", checkScreen);
        return () => window.removeEventListener("resize", checkScreen);
    }, []);

    // Helper function to convert project name to slug
    const nameToSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');
    
    // State to track if we opened directly via URL (skip animation)
    const [openedViaUrl, setOpenedViaUrl] = useState(false);
    
    // Open project from initialProjectName prop or sessionStorage (for mobile redirect)
    useEffect(() => {
        if (initialProjectOpened || !isActive) return;
        
        const nameToOpen = initialProjectName || (typeof window !== 'undefined' ? sessionStorage.getItem("openProjectName") : null);
        
        if (nameToOpen) {
            const project = projects.find(p => nameToSlug(p.name) === nameToOpen);
            if (project) {
                setInitialProjectOpened(true);
                setOpenedViaUrl(true);
                // Clear from sessionStorage
                if (typeof window !== 'undefined') {
                    sessionStorage.removeItem("openProjectName");
                }
                // Open project directly - skip animation, go straight to flipped state
                // Use center position directly - matching getModalDimensions
                const dims = isMobile 
                    ? { cardWidth: Math.min(320, window.innerWidth - 40), cardHeight: Math.min(500, window.innerHeight - 100), totalWidth: Math.min(320, window.innerWidth - 40) }
                    : isTablet 
                        ? { cardWidth: 320, cardHeight: 480, totalWidth: 700 }
                        : { cardWidth: 420, cardHeight: 580, totalWidth: 970 };
                const modalStartX = (window.innerWidth - dims.totalWidth) / 2;
                const cx = modalStartX;
                const cy = (window.innerHeight - dims.cardHeight) / 2;
                
                setCardRect({ x: cx, y: cy, width: dims.cardWidth, height: dims.cardHeight });
                setSelectedId(project.id);
                setShowBackdrop(true);
                setIsFlipped(true);
                setIsAnimating(false);
            }
        }
    }, [initialProjectName, initialProjectOpened, isActive, isMobile, isTablet]);

    // Scroll animation observer for mobile
    useEffect(() => {
        if (!isMobile && !isTablet) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const id = entry.target.getAttribute("data-scroll-id");
                    if (!id) return;
                    
                    setScrollVisible((prev) => {
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
            { threshold: 0.1, rootMargin: "-30px" }
        );

        Object.values(sectionRefs.current).forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [isMobile, isTablet]);

    const setRef = useCallback((id: string) => (el: HTMLElement | null) => {
        sectionRefs.current[id] = el;
    }, []);

    const isScrollVisible = (id: string) => scrollVisible.has(id);

    // Mobile uses "load more" pattern, desktop uses pagination
    const initialMobileCards = 4;
    const [mobileLoadedCount, setMobileLoadedCount] = useState(initialMobileCards);
    const cardsPerPage = isMobile ? projects.length : isTablet ? 6 : 8;
    const totalPages = Math.ceil(projects.length / cardsPerPage);
    
    // For mobile, show loaded count; for desktop, use pagination
    const currentPageProjects = isMobile 
        ? projects.slice(0, mobileLoadedCount)
        : projects.slice(currentPage * cardsPerPage, (currentPage + 1) * cardsPerPage);
    
    const hasMoreToLoad = isMobile && mobileLoadedCount < projects.length;
    
    const loadMoreProjects = () => {
        const newCount = Math.min(mobileLoadedCount + 4, projects.length);
        const newProjects = projects.slice(mobileLoadedCount, newCount);
        // Animate new projects
        newProjects.forEach((project, index) => {
            setTimeout(() => {
                setVisibleCards(prev => [...prev, project.id]);
            }, 50 + index * 80);
        });
        setMobileLoadedCount(newCount);
    };

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
        
        // Update URL to project name (desktop only)
        if (!isMobile && !isTablet) {
            const project = projects.find(p => p.id === projectId);
            if (project) {
                window.history.pushState(null, "", `/projects/${nameToSlug(project.name)}`);
            }
        }
        
        // Start the animation to center after capturing position
        requestAnimationFrame(() => {
            setShowBackdrop(true);
            setTimeout(() => {
                setIsFlipped(true);
            }, 400);
        });
    };

    const closeModal = () => {
        // Update URL back to /projects (desktop only)
        if (!isMobile && !isTablet) {
            window.history.pushState(null, "", "/projects");
        }
        
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

    // Calculate center position for modal - responsive
    const getModalDimensions = () => {
        if (typeof window === 'undefined') return { cardWidth: 420, cardHeight: 580, imageWidth: 600, totalWidth: 1050, gap: 30 };
        if (isMobile) return { cardWidth: Math.min(320, window.innerWidth - 40), cardHeight: Math.min(500, window.innerHeight - 100), imageWidth: 0, totalWidth: Math.min(320, window.innerWidth - 40), gap: 0 };
        if (isTablet) return { cardWidth: 320, cardHeight: 480, imageWidth: 360, totalWidth: 700, gap: 20 };
        return { cardWidth: 420, cardHeight: 580, imageWidth: 600, totalWidth: 1050, gap: 30 };
    };
    const modalDims = getModalDimensions();
    // Center the entire modal (card + gap + image) horizontally
    const modalStartX = typeof window !== 'undefined' ? (window.innerWidth - modalDims.totalWidth) / 2 : 0;
    const centerX = modalStartX;
    const centerY = typeof window !== 'undefined' ? (window.innerHeight - modalDims.cardHeight) / 2 : 0;

    return (
        <div
            className={`page-content ${!isLoading ? "animate-projects" : ""}`}
            style={{
                width: "100%",
                height: isMobile ? "auto" : "100%",
                minHeight: isMobile ? "100vh" : undefined,
                display: "flex",
                flexDirection: "column",
                background: "var(--background)",
                padding: isMobile ? "2rem 1.5rem" : "2rem",
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
                    background: showBackdrop ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0)",
                    zIndex: selectedId !== null ? 998 : -1,
                    transition: "background 0.4s ease",
                    cursor: isFlipped ? "pointer" : "default",
                    pointerEvents: selectedId !== null && showBackdrop ? "auto" : "none"
                }}
            >
                {/* Mobile/Tablet background image */}
                {(isMobile || isTablet) && selectedId !== null && showBackdrop && (() => {
                    const project = projects.find(p => p.id === selectedId);
                    return project ? (
                        <div style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            opacity: isFlipped ? 0.2 : 0,
                            transition: "opacity 0.5s ease 0.2s"
                        }}>
                            <Image
                                src={project.image}
                                alt={project.name}
                                fill
                                style={{
                                    objectFit: "cover",
                                    objectPosition: "center"
                                }}
                            />
                        </div>
                    ) : null;
                })()}
            </div>

            {/* Cards Container */}
            <div 
                className="animate-fade-in-up delay-200"
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: isMobile ? "0 0.5rem" : isTablet ? "0 1rem" : "0 4rem",
                    minHeight: 0
                }}
            >
                {/* Header */}
                <div style={{
                    width: "100%",
                    maxWidth: isMobile ? "100%" : "800px",
                    marginBottom: "1.5rem",
                    textAlign: isMobile ? "center" : "left"
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
                    gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(3, 140px)" : "repeat(4, 180px)",
                    gridTemplateRows: isMobile ? "auto" : isTablet ? "repeat(2, 220px)" : "repeat(2, 260px)",
                    gap: isMobile ? "1rem" : isTablet ? "1rem" : "1.25rem",
                    maxWidth: isMobile ? "100%" : "1000px",
                    width: isMobile ? "100%" : "auto"
                }}>
                {currentPageProjects.map((project, index) => {
                    const suit = suits[project.suit];
                    const isRed = project.suit === "diamond" || project.suit === "heart";
                    const isHovered = hoveredId === project.id;
                    const isSelected = selectedId === project.id;
                    const isCardActive = isSelected && isAnimating;
                    const isCardVisible = visibleCards.includes(project.id);
                    const cardScrollId = `card-${project.id}`;
                    const cardIsScrollVisible = isScrollVisible(cardScrollId);

                    return (
                        <div
                            key={project.id}
                            ref={(el) => { 
                                cardRefs.current[project.id] = el;
                                if (isMobile || isTablet) {
                                    sectionRefs.current[cardScrollId] = el;
                                }
                            }}
                            data-scroll-id={cardScrollId}
                            onClick={() => {
                                if (selectedId === null) {
                                    openModal(project.id);
                                }
                            }}
                            onMouseEnter={() => !isSelected && setHoveredId(project.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            style={{
                                opacity: (isMobile || isTablet) ? (cardIsScrollVisible ? 1 : 0) : (isCardVisible ? 1 : 0),
                                visibility: isCardActive ? "hidden" : "visible",
                                background: "#EDEDED",
                                borderRadius: "12px",
                                position: "relative",
                                cursor: selectedId === null ? "pointer" : "default",
                                transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s ease",
                                transitionDelay: (isMobile || isTablet) ? `${index * 0.05}s` : "0s",
                                transform: (isMobile || isTablet)
                                    ? (cardIsScrollVisible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.95)")
                                    : (isHovered 
                                        ? `translateY(-8px) rotate(${(index % 2 === 0 ? 2 : -2)}deg)` 
                                        : isCardVisible ? "translateY(0) rotate(0deg)" : "translateY(40px) rotate(0deg)"),
                                boxShadow: isHovered 
                                    ? "0 20px 40px rgba(0,0,0,0.3), 0 0 0 2px rgba(0,0,0,0.1)" 
                                    : "0 4px 12px rgba(0,0,0,0.15)",
                                display: "flex",
                                flexDirection: "column",
                                padding: "0.75rem",
                                overflow: "hidden",
                                aspectRatio: "2.5/3.5",
                                width: isMobile ? "200px" : "auto",
                                margin: isMobile ? "0 auto" : "0"
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

                {/* Pagination Arrows - Desktop only */}
                {!isMobile && totalPages > 1 && (
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

                {/* Load More Button - Mobile only */}
                {isMobile && hasMoreToLoad && (
                    <button
                        onClick={loadMoreProjects}
                        style={{
                            marginTop: "1.5rem",
                            padding: "0.75rem 2rem",
                            background: "transparent",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: "8px",
                            color: "#fff",
                            fontSize: "0.85rem",
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            letterSpacing: "0.05em"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                        }}
                    >
                        Load More Projects
                    </button>
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
                            width: showBackdrop ? modalDims.cardWidth : (isMobile ? 200 : isTablet ? 140 : 180),
                            height: showBackdrop ? modalDims.cardHeight : (isMobile ? 280 : isTablet ? 220 : 260),
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
                    
                    {/* Image Panel - appears on the right after flip (hidden on mobile/tablet) */}
                    {!isMobile && !isTablet && (
                    <div
                        style={{
                            position: "fixed",
                            left: centerX + modalDims.cardWidth + modalDims.gap,
                            top: centerY,
                            width: modalDims.imageWidth,
                            height: modalDims.cardHeight,
                            zIndex: 999,
                            opacity: isFlipped ? 1 : 0,
                            transform: isFlipped ? "translateX(0)" : "translateX(-30px)",
                            transition: "opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s",
                            pointerEvents: isFlipped ? "auto" : "none",
                            borderRadius: "16px",
                            overflow: "hidden",
                            boxShadow: "0 25px 60px rgba(0,0,0,0.5)"
                        }}
                    >
                        <Image
                            src={project.image}
                            alt={project.name}
                            fill
                            style={{
                                objectFit: "cover",
                                objectPosition: "left center"
                            }}
                        />
                    </div>
                    )}
                </>
                );
            })()}
        </div>
    );
}
