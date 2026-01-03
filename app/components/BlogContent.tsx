"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Highlight, themes } from "prism-react-renderer";
import blogsData from "@/data/json/blogs.json";

interface ContentBlock {
    type: "paragraph" | "heading" | "image" | "code" | "link";
    text?: string;
    level?: number;
    src?: string;
    alt?: string;
    caption?: string;
    language?: string;
    code?: string;
    url?: string;
    layout?: "full" | "left" | "right";
}

interface Blog {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    author: string;
    date: string;
    readTime: string;
    tags: string[];
    content: ContentBlock[];
}

interface BlogContentProps {
    isLoading?: boolean;
    isActive?: boolean;
    initialSlug?: string;
}

export default function BlogContent({ isLoading = false, isActive = false, initialSlug }: BlogContentProps) {
    const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [showList, setShowList] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileLoadedCount, setMobileLoadedCount] = useState(5);
    const [scrollVisible, setScrollVisible] = useState<Set<string>>(new Set());
    const [initialBlogOpened, setInitialBlogOpened] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const articleRefs = useRef<{ [key: string]: HTMLElement | null }>({});

    const blogs = blogsData.blogs as Blog[];
    
    // For mobile, limit displayed blogs with "load more" pattern
    const displayedBlogs = isMobile ? blogs.slice(0, mobileLoadedCount) : blogs;
    const hasMoreBlogs = isMobile && mobileLoadedCount < blogs.length;
    
    const loadMoreBlogs = () => {
        setMobileLoadedCount(prev => Math.min(prev + 5, blogs.length));
    };

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Open blog from initialSlug prop or sessionStorage (for mobile redirect)
    useEffect(() => {
        if (initialBlogOpened || !isActive) return;
        
        const slugToOpen = initialSlug || (typeof window !== 'undefined' ? sessionStorage.getItem("openBlogSlug") : null);
        
        if (slugToOpen) {
            const blog = blogs.find(b => b.slug === slugToOpen);
            if (blog) {
                setInitialBlogOpened(true);
                // Clear from sessionStorage
                if (typeof window !== 'undefined') {
                    sessionStorage.removeItem("openBlogSlug");
                }
                // Open blog directly
                setSelectedBlog(blog);
                setShowContent(true);
                setIsTransitioning(true);
            }
        }
    }, [initialSlug, blogs, initialBlogOpened, isActive]);

    // Scroll animation observer for mobile - only for article list, not when reading
    useEffect(() => {
        if (!isMobile || selectedBlog) return;

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
            { threshold: 0.15, rootMargin: "-30px" }
        );

        Object.values(articleRefs.current).forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [isMobile, displayedBlogs, selectedBlog]);

    const isScrollVisible = (id: string) => scrollVisible.has(id);

    // Handle animation based on active state
    useEffect(() => {
        if (!isActive) {
            // Reset animation state when leaving this section
            setShowList(false);
            setShowContent(false);
            setSelectedBlog(null);
            setIsTransitioning(false);
            return;
        }
        
        // When active and not loading, trigger animation and reset scroll
        if (isActive && !isLoading && !selectedBlog) {
            // Reset scroll position to top
            if (contentRef.current) {
                contentRef.current.scrollTop = 0;
            }
            // Small delay to ensure state is reset first
            const timer = setTimeout(() => {
                setShowList(true);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isActive, isLoading, selectedBlog]);

    const openBlog = (blog: Blog) => {
        setIsTransitioning(true);
        setShowList(false);
        setTimeout(() => {
            setSelectedBlog(blog);
            // Update URL to blog slug (desktop only)
            if (!isMobile) {
                window.history.pushState(null, "", `/blog/${blog.slug}`);
            }
            setTimeout(() => {
                setShowContent(true);
                // Scroll to top when blog opens
                if (contentRef.current) {
                    contentRef.current.scrollTop = 0;
                }
            }, 50);
        }, 300);
    };

    const closeBlog = () => {
        setShowContent(false);
        // Update URL back to /blog (desktop only)
        if (!isMobile) {
            window.history.pushState(null, "", "/blog");
        }
        setTimeout(() => {
            setSelectedBlog(null);
            setIsTransitioning(false);
            // Re-trigger list animation
            setTimeout(() => setShowList(true), 50);
        }, 300);
    };

    // Scroll to top when blog changes
    useEffect(() => {
        if (selectedBlog && contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [selectedBlog]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    const renderContent = (content: ContentBlock[]) => {
        const elements: React.ReactNode[] = [];
        const skipIndices = new Set<number>();

        for (let index = 0; index < content.length; index++) {
            if (skipIndices.has(index)) continue;
            
            const block = content[index];

            switch (block.type) {
                case "paragraph":
                    elements.push(
                        <p 
                            key={index} 
                            style={{
                                fontSize: "1.1rem",
                                lineHeight: 1.8,
                                color: "#ccc",
                                margin: "1.25rem 0",
                                textAlign: "left",
                                width: "100%"
                            }}
                            dangerouslySetInnerHTML={{ __html: block.text || "" }}
                        />
                    );
                    break;
                case "heading":
                    const headingStyle = {
                        fontSize: block.level === 2 ? "1.75rem" : "1.35rem",
                        fontWeight: 600,
                        color: "#fff",
                        margin: block.level === 2 ? "2.5rem 0 1rem 0" : "2rem 0 0.75rem 0",
                        letterSpacing: "-0.02em",
                        textAlign: "left" as const,
                        width: "100%" as const
                    };
                    if (block.level === 2) {
                        elements.push(<h2 key={index} style={headingStyle}>{block.text}</h2>);
                    } else if (block.level === 3) {
                        elements.push(<h3 key={index} style={headingStyle}>{block.text}</h3>);
                    } else if (block.level === 4) {
                        elements.push(<h4 key={index} style={headingStyle}>{block.text}</h4>);
                    } else {
                        elements.push(<h5 key={index} style={headingStyle}>{block.text}</h5>);
                    }
                    break;
                case "image":
                    // Handle side-by-side layouts - pair with next paragraph (stack on mobile)
                    if ((block.layout === "left" || block.layout === "right") && !isMobile) {
                        // Find the next paragraph to pair with
                        const nextBlock = content[index + 1];
                        const hasNextParagraph = nextBlock && nextBlock.type === "paragraph";
                        
                        if (hasNextParagraph) {
                            skipIndices.add(index + 1); // Skip the next paragraph since we're rendering it here
                        }

                        elements.push(
                            <div 
                                key={index} 
                                style={{
                                    display: "flex",
                                    flexDirection: block.layout === "left" ? "row" : "row-reverse",
                                    gap: "2rem",
                                    margin: "2rem 0",
                                    alignItems: "flex-start",
                                    width: "100%"
                                }}
                            >
                                <figure style={{
                                    margin: 0,
                                    flex: "0 0 40%",
                                    maxWidth: "40%"
                                }}>
                                    <div style={{
                                        borderRadius: "12px",
                                        overflow: "hidden",
                                        boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
                                    }}>
                                        <Image
                                            src={block.src || "/dummy.jpg"}
                                            alt={block.alt || ""}
                                            width={400}
                                            height={300}
                                            style={{
                                                width: "100%",
                                                height: "auto",
                                                objectFit: "cover"
                                            }}
                                        />
                                    </div>
                                    {block.caption && (
                                        <figcaption style={{
                                            fontSize: "0.85rem",
                                            color: "#888",
                                            marginTop: "0.75rem",
                                            fontStyle: "italic",
                                            textAlign: "center"
                                        }}>
                                            {block.caption}
                                        </figcaption>
                                    )}
                                </figure>
                                {hasNextParagraph && (
                                    <div style={{ 
                                        flex: 1,
                                        fontSize: "1.1rem",
                                        lineHeight: 1.8,
                                        color: "#ccc",
                                        textAlign: "left"
                                    }}
                                        dangerouslySetInnerHTML={{ __html: nextBlock.text || "" }}
                                    />
                                )}
                            </div>
                        );
                        break;
                    }
                    // Full width image
                    elements.push(
                        <figure key={index} style={{
                            margin: "2rem 0",
                            textAlign: "center",
                            width: "100%"
                        }}>
                            <div style={{
                                borderRadius: "12px",
                                overflow: "hidden",
                                boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
                            }}>
                                <Image
                                    src={block.src || "/dummy.jpg"}
                                    alt={block.alt || ""}
                                    width={800}
                                    height={450}
                                    style={{
                                        width: "100%",
                                        height: "auto",
                                        objectFit: "cover"
                                    }}
                                />
                            </div>
                            {block.caption && (
                                <figcaption style={{
                                    fontSize: "0.85rem",
                                    color: "#888",
                                    marginTop: "0.75rem",
                                    fontStyle: "italic"
                                }}>
                                    {block.caption}
                                </figcaption>
                            )}
                        </figure>
                    );
                    break;
                case "code":
                    elements.push(
                        <div key={index} style={{
                            margin: "1.5rem 0",
                            borderRadius: "10px",
                            overflow: "hidden",
                            border: "1px solid rgba(255,255,255,0.1)",
                            textAlign: "left"
                        }}>
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "0.75rem 1.25rem",
                                background: "#151515",
                                borderBottom: "1px solid rgba(255,255,255,0.1)"
                            }}>
                                <span style={{
                                    fontSize: "0.75rem",
                                    color: "#dc143c",
                                    textTransform: "uppercase",
                                    fontWeight: 600,
                                    letterSpacing: "0.05em"
                                }}>
                                    {block.language || "code"}
                                </span>
                            </div>
                            <Highlight
                                theme={themes.nightOwl}
                                code={block.code || ""}
                                language={block.language || "javascript"}
                            >
                                {({ style, tokens, getLineProps, getTokenProps }) => (
                                    <pre style={{
                                        ...style,
                                        background: "#0d0d0d",
                                        padding: "1.25rem",
                                        margin: 0,
                                        overflow: "auto",
                                        textAlign: "left"
                                    }}>
                                        {tokens.map((line, i) => (
                                            <div key={i} {...getLineProps({ line })} style={{ textAlign: "left" }}>
                                                <span style={{
                                                    display: "inline-block",
                                                    width: "2em",
                                                    color: "#444",
                                                    userSelect: "none",
                                                    textAlign: "right",
                                                    marginRight: "1em"
                                                }}>
                                                    {i + 1}
                                                </span>
                                                {line.map((token, key) => (
                                                    <span key={key} {...getTokenProps({ token })} />
                                                ))}
                                            </div>
                                        ))}
                                    </pre>
                                )}
                            </Highlight>
                        </div>
                    );
                    break;
                case "link":
                    elements.push(
                        <a
                            key={index}
                            href={block.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: "#dc143c",
                                textDecoration: "none",
                                borderBottom: "1px solid transparent",
                                transition: "border-color 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderBottomColor = "#dc143c"}
                            onMouseLeave={(e) => e.currentTarget.style.borderBottomColor = "transparent"}
                        >
                            {block.text}
                        </a>
                    );
                    break;
                default:
                    break;
            }
        }
        return elements;
    };

    return (
        <div
            ref={contentRef}
            className={`page-content ${!isLoading ? "animate-blogs" : ""}`}
            style={{
                width: "100%",
                height: isMobile ? "auto" : "100%",
                minHeight: isMobile ? "100vh" : undefined,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                background: isMobile ? "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url('/back.gif')" : "var(--background)",
                backgroundColor: isMobile ? "#000" : "var(--background)",
                backgroundSize: isMobile ? "150%" : undefined,
                backgroundPosition: isMobile ? "center" : undefined,
                backgroundRepeat: isMobile ? "no-repeat" : undefined,
                padding: isMobile ? "0 1.5rem" : "0 4rem",
                boxSizing: "border-box",
                overflowY: "auto",
                position: "relative"
            }}
        >
            {/* Blog List View */}
            <div
                style={{
                    opacity: showList && !isTransitioning ? 1 : 0,
                    transform: showList && !isTransitioning ? "translateY(0)" : "translateY(20px)",
                    transition: "opacity 0.4s ease, transform 0.4s ease",
                    display: selectedBlog ? "none" : "flex",
                    flexDirection: "column",
                    alignItems: isMobile ? "center" : "flex-start",
                    width: "100%",
                    maxWidth: "600px",
                    paddingTop: isMobile ? "1.5rem" : "12vh",
                    paddingBottom: isMobile ? "2rem" : "4rem"
                }}
            >
                {/* Header */}
                <p style={{
                    fontSize: "0.65rem",
                    fontWeight: 400,
                    color: "#4a4a4a",
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    marginBottom: isMobile ? "1rem" : "2.5rem",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    opacity: showList ? 1 : 0,
                    transform: showList ? "translateY(0)" : "translateY(10px)",
                    transition: "opacity 0.4s ease, transform 0.4s ease",
                    textAlign: isMobile ? "center" : "left",
                    width: "100%"
                }}>
                    Articles
                </p>

                {displayedBlogs.map((blog, index) => {
                    const articleScrollId = `article-${blog.id}`;
                    const articleIsVisible = isMobile ? isScrollVisible(articleScrollId) : showList;
                    
                    return (
                    <article
                        key={blog.id}
                        ref={(el) => { articleRefs.current[articleScrollId] = el; }}
                        data-scroll-id={articleScrollId}
                        onClick={() => openBlog(blog)}
                        style={{
                            cursor: "pointer",
                            opacity: articleIsVisible ? 1 : 0,
                            transform: articleIsVisible ? "translateY(0)" : "translateY(20px)",
                            transition: isMobile 
                                ? "opacity 0.5s ease-out, transform 0.5s ease-out"
                                : `opacity 0.4s ease ${index * 60}ms, transform 0.4s ease ${index * 60}ms`,
                            padding: isMobile ? "1rem 0" : "1.5rem 0",
                            borderBottom: "1px solid rgba(255,255,255,0.1)",
                            width: "100%"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = "0.7";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = articleIsVisible ? "1" : "0";
                        }}
                    >
                        {/* Title */}
                        <h2 style={{
                            fontSize: "1.4rem",
                            fontWeight: 700,
                            color: "var(--foreground)",
                            margin: "0 0 0.3rem 0",
                            lineHeight: 1.2,
                            letterSpacing: "-0.01em",
                            textTransform: "uppercase",
                            textAlign: "left"
                        }}>
                            {blog.title}
                        </h2>

                        {/* Excerpt / Subtitle */}
                        <p style={{
                            fontSize: "0.85rem",
                            color: "#888",
                            margin: "0 0 0.2rem 0",
                            lineHeight: 1.4,
                            textAlign: "left"
                        }}>
                            {blog.excerpt}
                        </p>

                        {/* Meta - Date and Arrow */}
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <p style={{
                                fontSize: "0.8rem",
                                color: "#666",
                                margin: 0,
                                textAlign: "left"
                            }}>
                                {formatDate(blog.date)}
                            </p>
                            {isMobile && (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                            )}
                        </div>
                    </article>
                    );
                })}

                {/* Load More Button - Mobile only */}
                {hasMoreBlogs && (
                    <button
                        onClick={loadMoreBlogs}
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
                            letterSpacing: "0.05em",
                            opacity: showList ? 1 : 0,
                            transform: showList ? "translateY(0)" : "translateY(10px)"
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
                        Load More Articles
                    </button>
                )}
            </div>

            {/* Blog Content View */}
            {selectedBlog && (
                <div
                    style={{
                        position: isMobile ? "fixed" : "relative",
                        top: isMobile ? 0 : "auto",
                        left: isMobile ? 0 : "auto",
                        right: isMobile ? 0 : "auto",
                        bottom: isMobile ? 0 : "auto",
                        zIndex: isMobile ? 1000 : "auto",
                        opacity: showContent ? 1 : 0,
                        transform: showContent ? "translateY(0)" : "translateY(20px)",
                        transition: "opacity 0.3s ease, transform 0.3s ease",
                        display: "flex",
                        flexDirection: "column",
                        width: isMobile ? "100%" : "100%",
                        maxWidth: isMobile ? "none" : "1000px",
                        paddingTop: isMobile ? "0" : "8vh",
                        paddingBottom: isMobile ? "0" : "4rem",
                        gap: isMobile ? "0" : "3rem",
                        background: isMobile ? "linear-gradient(rgba(0,0,0,0.88), rgba(0,0,0,0.88)), url('/back.gif')" : "transparent",
                        backgroundSize: isMobile ? "cover" : undefined,
                        backgroundPosition: isMobile ? "center" : undefined,
                        backgroundRepeat: isMobile ? "no-repeat" : undefined,
                        overflowY: isMobile ? "auto" : "visible"
                    }}
                >
                    {/* Mobile Article Content Container */}
                    <div style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row",
                        width: "100%",
                        maxWidth: isMobile ? "none" : "1000px",
                        padding: isMobile ? "2rem 1.5rem 5rem 1.5rem" : "0",
                        gap: isMobile ? "1.5rem" : "3rem",
                        overflowY: isMobile ? "auto" : "visible"
                    }}>
                        {/* Back Button - Desktop only (moved to floating for mobile) */}
                        {!isMobile && (
                        <div style={{
                            position: "sticky",
                            top: "8vh",
                            height: "fit-content",
                            flexShrink: 0
                        }}>
                            <button
                                onClick={closeBlog}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    background: "none",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    color: "#666",
                                    fontSize: "0.8rem",
                                    cursor: "pointer",
                                    padding: "0.6rem 1rem",
                                    borderRadius: "6px",
                                    transition: "all 0.2s",
                                    whiteSpace: "nowrap"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "#fff";
                                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "#666";
                                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                                }}
                            >
                                ← Back
                            </button>
                        </div>
                        )}

                        {/* Main Content */}
                        <div style={{ flex: 1, maxWidth: "800px", width: "100%" }}>
                        {/* Tags */}
                        <div style={{
                            display: "flex",
                            gap: "0.5rem",
                            flexWrap: "wrap",
                            marginBottom: "1rem"
                        }}>
                            {selectedBlog.tags.map((tag, i) => (
                                <span key={i} style={{
                                    fontSize: "0.7rem",
                                    color: "#dc143c",
                                    padding: "0.3rem 0.8rem",
                                    background: "rgba(220,20,60,0.1)",
                                    borderRadius: "20px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em"
                                }}>
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Title */}
                        <h1 style={{
                            fontSize: isMobile ? "1.75rem" : "2.5rem",
                            fontWeight: 600,
                            color: "#fff",
                            margin: "0 0 1.5rem 0",
                            lineHeight: 1.2,
                            letterSpacing: "-0.02em",
                            textAlign: "left"
                        }}>
                            {selectedBlog.title}
                        </h1>

                        {/* Meta */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: isMobile ? "0.5rem 1rem" : "1.5rem",
                            fontSize: isMobile ? "0.75rem" : "0.85rem",
                            color: "#666",
                            marginBottom: isMobile ? "2rem" : "3rem",
                            paddingBottom: "2rem",
                            borderBottom: "1px solid rgba(255,255,255,0.08)"
                        }}>
                            <span style={{ color: "#888" }}>{selectedBlog.author}</span>
                            <span style={{ color: "#333" }}>•</span>
                            <span>{formatDate(selectedBlog.date)}</span>
                            <span style={{ color: "#333" }}>•</span>
                            <span>{selectedBlog.readTime}</span>
                        </div>

                        {/* Content */}
                        <div className="blog-content" style={{ marginBottom: "4rem", width: "100%" }}>
                            {renderContent(selectedBlog.content)}
                        </div>
                    </div>
                    </div>

                    {/* Floating Back Button - Mobile only */}
                    {isMobile && (
                        <button
                            onClick={closeBlog}
                            style={{
                                position: "fixed",
                                bottom: "1.5rem",
                                left: "1.5rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem",
                                background: "rgba(0,0,0,0.8)",
                                backdropFilter: "blur(10px)",
                                WebkitBackdropFilter: "blur(10px)",
                                border: "1px solid rgba(255,255,255,0.2)",
                                color: "#fff",
                                fontSize: "0.85rem",
                                fontWeight: 500,
                                cursor: "pointer",
                                padding: "0.75rem 1.25rem",
                                borderRadius: "50px",
                                zIndex: 1001,
                                boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7"/>
                            </svg>
                            Back
                        </button>
                    )}

                    {/* Blog content styles */}
                    <style jsx global>{`
                        .blog-content strong,
                        .blog-content b {
                            font-weight: 700;
                            color: #fff;
                        }
                        .blog-content em,
                        .blog-content i {
                            font-style: italic;
                        }
                        .blog-content u {
                            text-decoration: underline;
                        }
                        .blog-content a {
                            color: #dc143c;
                            text-decoration: none;
                            border-bottom: 1px solid transparent;
                            transition: border-color 0.2s;
                        }
                        .blog-content a:hover {
                            border-bottom-color: #dc143c;
                        }
                        .blog-content p {
                            max-width: 100%;
                        }
                        .blog-content ul,
                        .blog-content ol {
                            margin: 1.25rem 0;
                            padding-left: 1.5rem;
                            color: #ccc;
                        }
                        .blog-content li {
                            font-size: 1.1rem;
                            line-height: 1.8;
                            margin: 0.5rem 0;
                            color: #ccc;
                        }
                        .blog-content li::marker {
                            color: #dc143c;
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
}
