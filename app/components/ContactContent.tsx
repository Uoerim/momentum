"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import contactData from "@/data/json/contact.json";

interface ContactContentProps {
    isLoading?: boolean;
    isActive?: boolean;
}

// Status color configuration
const statusColors: Record<string, { color: string; bg: string; label: string }> = {
    available: { color: "#22c55e", bg: "rgba(34, 197, 94, 0.1)", label: "Available" },
    busy: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)", label: "Busy" },
    vacation: { color: "#eab308", bg: "rgba(234, 179, 8, 0.1)", label: "On Vacation" },
};

export default function ContactContent({ isLoading = false, isActive = false }: ContactContentProps) {
    const [showContent, setShowContent] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState<string>("");
    const [isMobile, setIsMobile] = useState(false);
    const [scrollVisible, setScrollVisible] = useState<Set<string>>(new Set());
    const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

    const contact = contactData.contact;
    const status = statusColors[contact.availability.status] || statusColors.available;

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Scroll animation observer for mobile
    useEffect(() => {
        if (!isMobile) return;

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
            { threshold: 0.2, rootMargin: "-30px" }
        );

        Object.values(sectionRefs.current).forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [isMobile]);

    const setRef = useCallback((id: string) => (el: HTMLElement | null) => {
        sectionRefs.current[id] = el;
    }, []);

    const isScrollVisible = (id: string) => scrollVisible.has(id);

    // Update Cairo time every second
    useEffect(() => {
        const updateTime = () => {
            const cairoTime = new Date().toLocaleTimeString("en-US", {
                timeZone: contact.location.timezone,
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
            setCurrentTime(cairoTime);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [contact.location.timezone]);

    // Handle animation based on active state
    useEffect(() => {
        if (!isActive) {
            // Reset animation state when leaving this section
            setShowContent(false);
            return;
        }
        
        // When active and not loading, trigger animation
        if (isActive && !isLoading) {
            // Small delay to ensure state is reset first
            const timer = setTimeout(() => {
                setShowContent(true);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isActive, isLoading]);

    const copyToClipboard = async (text: string, field: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    // Format WhatsApp number for URL (remove spaces, parentheses, dashes)
    const formatWhatsAppNumber = (num: string) => {
        return num.replace(/[\s\(\)\-]/g, "");
    };

    const contactMethods = [
        {
            id: "email",
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 7l-10 7L2 7" />
                </svg>
            ),
            label: contact.email.label,
            value: contact.email.address,
            action: () => copyToClipboard(contact.email.address, "email"),
            href: `mailto:${contact.email.address}`,
        },
        {
            id: "whatsapp",
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                </svg>
            ),
            label: contact.whatsapp.label,
            value: contact.whatsapp.number,
            action: () => window.open(`https://wa.me/${formatWhatsAppNumber(contact.whatsapp.number)}`, "_blank"),
            href: `https://wa.me/${formatWhatsAppNumber(contact.whatsapp.number)}`,
            external: true,
        },
        {
            id: "instagram",
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none" />
                </svg>
            ),
            label: contact.instagram.label,
            value: contact.instagram.handle,
            action: () => window.open(contact.instagram.url, "_blank"),
            href: contact.instagram.url,
            external: true,
        },
    ];

    return (
        <div
            className="page-content"
            style={{
                width: "100%",
                height: isMobile ? "auto" : "100%",
                minHeight: isMobile ? "100vh" : undefined,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--background)",
                padding: isMobile ? "3rem 1.5rem" : "0 4rem",
                boxSizing: "border-box",
                overflowY: "auto",
            }}
        >
            <div
                ref={setRef("contact-main")}
                data-scroll-id="contact-main"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    maxWidth: "600px",
                    width: "100%",
                    opacity: isMobile ? (isScrollVisible("contact-main") ? 1 : 0) : 1,
                    transform: isMobile ? (isScrollVisible("contact-main") ? "translateY(0)" : "translateY(30px)") : "none",
                    transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
                }}
            >
                {/* Availability Badge */}
                <div
                    style={{
                        opacity: showContent ? 1 : 0,
                        transform: showContent ? "translateY(0)" : "translateY(20px)",
                        transition: "opacity 0.5s ease, transform 0.5s ease",
                        marginBottom: "2rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                    }}
                >
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            fontSize: "0.7rem",
                            color: status.color,
                            padding: "0.4rem 1rem",
                            background: status.bg,
                            borderRadius: "20px",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            fontWeight: 500,
                        }}
                    >
                        <span
                            style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: status.color,
                                animation: "pulse 2s infinite",
                            }}
                        />
                        {status.label}
                    </span>
                </div>

                {/* Main Heading */}
                <h1
                    style={{
                        fontSize: "clamp(2rem, 5vw, 3.5rem)",
                        fontWeight: 600,
                        color: "#fff",
                        textAlign: "center",
                        margin: "0 0 1rem 0",
                        lineHeight: 1.1,
                        letterSpacing: "-0.03em",
                        opacity: showContent ? 1 : 0,
                        transform: showContent ? "translateY(0)" : "translateY(20px)",
                        transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s",
                    }}
                >
                    Get in Touch
                </h1>

                {/* Tagline */}
                <p
                    style={{
                        fontSize: "1.1rem",
                        color: "#666",
                        textAlign: "center",
                        margin: "0 0 3rem 0",
                        maxWidth: "400px",
                        lineHeight: 1.6,
                        opacity: showContent ? 1 : 0,
                        transform: showContent ? "translateY(0)" : "translateY(20px)",
                        transition: "opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s",
                    }}
                >
                    {contact.tagline}
                </p>

                {/* Contact Cards */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                        width: "100%",
                        maxWidth: "450px",
                    }}
                >
                    {contactMethods.map((method, index) => (
                        <div
                            key={method.id}
                            onClick={method.action}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1.25rem",
                                padding: "1.25rem 1.5rem",
                                background: "rgba(255,255,255,0.02)",
                                border: "1px solid rgba(255,255,255,0.06)",
                                borderRadius: "12px",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                opacity: showContent ? 1 : 0,
                                transform: showContent ? "translateY(0)" : "translateY(20px)",
                                transitionDelay: `${0.3 + index * 0.1}s`,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                                e.currentTarget.style.borderColor = "rgba(220,20,60,0.3)";
                                e.currentTarget.style.transform = "translateX(8px)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                                e.currentTarget.style.transform = "translateY(0)";
                            }}
                        >
                            {/* Icon */}
                            <div
                                style={{
                                    color: "#dc143c",
                                    opacity: 0.8,
                                    flexShrink: 0,
                                }}
                            >
                                {method.icon}
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1 }}>
                                <p
                                    style={{
                                        fontSize: "0.7rem",
                                        color: "#555",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.1em",
                                        margin: "0 0 0.25rem 0",
                                    }}
                                >
                                    {method.label}
                                </p>
                                <p
                                    style={{
                                        fontSize: "1rem",
                                        color: "#ccc",
                                        margin: 0,
                                        fontWeight: 500,
                                    }}
                                >
                                    {method.value}
                                </p>
                            </div>

                            {/* Action Indicator */}
                            <div
                                style={{
                                    color: copiedField === method.id ? "#22c55e" : "#444",
                                    fontSize: "0.75rem",
                                    transition: "color 0.2s",
                                }}
                            >
                                {copiedField === method.id ? (
                                    <span style={{ color: "#22c55e" }}>Copied!</span>
                                ) : method.external ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                                        <polyline points="15,3 21,3 21,9" />
                                        <line x1="10" y1="14" x2="21" y2="3" />
                                    </svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="9" y="9" width="13" height="13" rx="2" />
                                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Response Time Note */}
                <p
                    style={{
                        fontSize: "0.8rem",
                        color: "#444",
                        textAlign: "center",
                        marginTop: "2.5rem",
                        opacity: showContent ? 1 : 0,
                        transform: showContent ? "translateY(0)" : "translateY(10px)",
                        transition: "opacity 0.5s ease 0.6s, transform 0.5s ease 0.6s",
                    }}
                >
                    {contact.availability.response}
                </p>

                {/* Decorative Divider */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        marginTop: "2rem",
                        opacity: showContent ? 1 : 0,
                        transition: "opacity 0.5s ease 0.7s",
                    }}
                >
                    <div style={{ width: "40px", height: "1px", background: "rgba(255,255,255,0.1)" }} />
                    <span style={{ color: "#dc143c", fontSize: "1.2rem" }}>♠</span>
                    <div style={{ width: "40px", height: "1px", background: "rgba(255,255,255,0.1)" }} />
                </div>

                {/* Location & Time */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginTop: "1.5rem",
                        opacity: showContent ? 1 : 0,
                        transition: "opacity 0.5s ease 0.8s",
                    }}
                >
                    <p
                        style={{
                            fontSize: "0.75rem",
                            color: "#444",
                            textAlign: "center",
                            textTransform: "uppercase",
                            letterSpacing: "0.15em",
                            margin: 0,
                        }}
                    >
                        {contact.location.city}
                    </p>
                    <p
                        style={{
                            fontSize: "1.1rem",
                            color: "#dc143c",
                            textAlign: "center",
                            fontWeight: 500,
                            margin: 0,
                            fontVariantNumeric: "tabular-nums",
                        }}
                    >
                        {currentTime}
                    </p>
                </div>
            </div>

            <style jsx global>{`
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
                    }
                }
            `}</style>
        </div>
    );
}
