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
}

export default function BlogContent({ isLoading = false, isActive = false }: BlogContentProps) {
    const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [showList, setShowList] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const blogs = blogsData.blogs as Blog[];

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
                    // Handle side-by-side layouts - pair with next paragraph
                    if (block.layout === "left" || block.layout === "right") {
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
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                background: "var(--background)",
                padding: "0 4rem",
                boxSizing: "border-box",
                overflowY: "auto"
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
                    alignItems: "flex-start",
                    width: "100%",
                    maxWidth: "600px",
                    paddingTop: "12vh",
                    paddingBottom: "4rem"
                }}
            >
                {/* Header */}
                <p style={{
                    fontSize: "0.65rem",
                    fontWeight: 400,
                    color: "#4a4a4a",
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    marginBottom: "2.5rem",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    opacity: showList ? 1 : 0,
                    transform: showList ? "translateY(0)" : "translateY(10px)",
                    transition: "opacity 0.4s ease, transform 0.4s ease"
                }}>
                    Articles
                </p>

                {blogs.map((blog, index) => (
                    <article
                        key={blog.id}
                        onClick={() => openBlog(blog)}
                        style={{
                            cursor: "pointer",
                            opacity: showList ? 1 : 0,
                            transform: showList ? "translateY(0)" : "translateY(15px)",
                            transition: `opacity 0.4s ease ${index * 60}ms, transform 0.4s ease ${index * 60}ms`,
                            padding: "1.5rem 0",
                            borderBottom: "1px solid rgba(255,255,255,0.1)",
                            width: "100%"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = "0.7";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = showList ? "1" : "0";
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

                        {/* Meta - Date */}
                        <p style={{
                            fontSize: "0.8rem",
                            color: "#666",
                            margin: 0,
                            textAlign: "left"
                        }}>
                            {formatDate(blog.date)}
                        </p>
                    </article>
                ))}
            </div>

            {/* Blog Content View */}
            {selectedBlog && (
                <div
                    style={{
                        opacity: showContent ? 1 : 0,
                        transform: showContent ? "translateY(0)" : "translateY(20px)",
                        transition: "opacity 0.3s ease, transform 0.3s ease",
                        display: "flex",
                        width: "100%",
                        maxWidth: "1000px",
                        paddingTop: "8vh",
                        paddingBottom: "4rem",
                        gap: "3rem"
                    }}
                >
                    {/* Back Button - Left Side */}
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
                            fontSize: "2.5rem",
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
                            gap: "1.5rem",
                            fontSize: "0.85rem",
                            color: "#666",
                            marginBottom: "3rem",
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
                    `}</style>
                </div>
            )}
        </div>
    );
}
