"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Highlight, themes } from "prism-react-renderer";

// Available images organized by folder
const PUBLIC_IMAGES: Record<string, { name: string; path: string }[]> = {
    "Root": [
        { name: "dummy.jpg", path: "/dummy.jpg" },
        { name: "black_club.svg", path: "/black_club.svg" },
        { name: "black_spade.svg", path: "/black_spade.svg" },
        { name: "red_diamond.svg", path: "/red_diamond.svg" },
        { name: "red_heart.svg", path: "/red_heart.svg" },
        { name: "white_club.svg", path: "/white_club.svg" },
        { name: "white_spade.svg", path: "/white_spade.svg" },
    ],
    "posts/firstpost": [
        { name: "knight_black.jpg", path: "/posts/firstpost/knight_black.jpg" },
    ],
    "projects/lofi": [
        { name: "logo.svg", path: "/projects/lofi/logo.svg" },
        { name: "poster.png", path: "/projects/lofi/poster.png" },
        { name: "poster2.png", path: "/projects/lofi/poster2.png" },
    ],
    "projects/keysystem": [
        { name: "logo.svg", path: "/projects/keysystem/logo.svg" },
        { name: "poster.png", path: "/projects/keysystem/poster.png" },
    ],
};

// Supported programming languages
const LANGUAGES = [
    { id: "javascript", name: "JavaScript" },
    { id: "typescript", name: "TypeScript" },
    { id: "python", name: "Python" },
    { id: "jsx", name: "JSX" },
    { id: "tsx", name: "TSX" },
    { id: "css", name: "CSS" },
    { id: "html", name: "HTML" },
    { id: "json", name: "JSON" },
    { id: "bash", name: "Bash" },
    { id: "sql", name: "SQL" },
    { id: "rust", name: "Rust" },
    { id: "go", name: "Go" },
    { id: "java", name: "Java" },
    { id: "csharp", name: "C#" },
    { id: "cpp", name: "C++" },
    { id: "php", name: "PHP" },
    { id: "ruby", name: "Ruby" },
    { id: "yaml", name: "YAML" },
    { id: "markdown", name: "Markdown" },
];

interface BlogMeta {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    author: string;
    date: string;
    readTime: string;
    tags: string[];
}

interface CodeBlock {
    id: string;
    language: string;
    code: string;
}

export default function BlogWriterPage() {
    const editorRef = useRef<HTMLDivElement>(null);
    const [blogMeta, setBlogMeta] = useState<BlogMeta>({
        id: 1,
        title: "",
        slug: "",
        excerpt: "",
        author: "Yosuf",
        date: new Date().toISOString().split("T")[0],
        readTime: "5 min read",
        tags: [],
    });
    const [tagInput, setTagInput] = useState("");
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [showImageLayoutPicker, setShowImageLayoutPicker] = useState(false);
    const [selectedImageFolder, setSelectedImageFolder] = useState<string>("Root");
    const [showCodePicker, setShowCodePicker] = useState(false);
    const [showJsonPanel, setShowJsonPanel] = useState(false);
    const [copiedNotification, setCopiedNotification] = useState(false);
    const [activeFormat, setActiveFormat] = useState<string[]>([]);
    const [selectedImageElement, setSelectedImageElement] = useState<HTMLElement | null>(null);
    const [codeBlocks, setCodeBlocks] = useState<CodeBlock[]>([]);
    const [selectedCodeBlock, setSelectedCodeBlock] = useState<string | null>(null);

    // Track active formatting
    useEffect(() => {
        const checkFormat = () => {
            const formats: string[] = [];
            if (document.queryCommandState("bold")) formats.push("bold");
            if (document.queryCommandState("italic")) formats.push("italic");
            if (document.queryCommandState("underline")) formats.push("underline");
            if (document.queryCommandState("strikeThrough")) formats.push("strikeThrough");
            setActiveFormat(formats);
        };

        document.addEventListener("selectionchange", checkFormat);
        return () => document.removeEventListener("selectionchange", checkFormat);
    }, []);

    // Handle clicks on images and code blocks in the editor
    useEffect(() => {
        const handleEditorClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === "IMG") {
                const figure = target.closest("figure");
                if (figure) {
                    setSelectedImageElement(figure as HTMLElement);
                } else {
                    setSelectedImageElement(target);
                }
                setSelectedCodeBlock(null);
            } else if (target.closest(".code-block-wrapper")) {
                const wrapper = target.closest(".code-block-wrapper") as HTMLElement;
                setSelectedCodeBlock(wrapper.dataset.codeId || null);
                setSelectedImageElement(null);
            } else if (!target.closest(".image-toolbar") && !target.closest(".code-toolbar")) {
                setSelectedImageElement(null);
                setSelectedCodeBlock(null);
            }
        };

        const editor = editorRef.current;
        if (editor) {
            editor.addEventListener("click", handleEditorClick);
            return () => editor.removeEventListener("click", handleEditorClick);
        }
    }, []);

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    };

    const handleTitleChange = (title: string) => {
        setBlogMeta(prev => ({
            ...prev,
            title,
            slug: generateSlug(title),
        }));
    };

    const addTag = () => {
        if (tagInput.trim() && !blogMeta.tags.includes(tagInput.trim())) {
            setBlogMeta(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()],
            }));
            setTagInput("");
        }
    };

    const removeTag = (index: number) => {
        setBlogMeta(prev => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== index),
        }));
    };

    // Rich text editor commands
    const execCommand = useCallback((command: string, value?: string) => {
        editorRef.current?.focus();
        document.execCommand(command, false, value);
    }, []);

    // Insert image with layout option
    const insertImage = useCallback((imagePath: string, layout: "full" | "left" | "right" = "full") => {
        const editor = editorRef.current;
        if (!editor) return;

        editor.focus();

        const imageId = `img-${Date.now()}`;
        let html = "";

        if (layout === "full") {
            html = `<figure contenteditable="false" data-image-id="${imageId}" data-layout="full" class="editor-figure">
                <img src="${imagePath}" alt="" class="editor-image" />
                <figcaption contenteditable="true" class="editor-caption" placeholder="Add caption..."></figcaption>
            </figure><p><br></p>`;
        } else if (layout === "left") {
            html = `<div contenteditable="false" data-image-id="${imageId}" data-layout="left" class="editor-image-text-wrapper editor-image-left">
                <figure class="editor-figure-side">
                    <img src="${imagePath}" alt="" class="editor-image-side" />
                    <figcaption contenteditable="true" class="editor-caption-side" placeholder="Caption..."></figcaption>
                </figure>
                <div contenteditable="true" class="editor-text-side" placeholder="Type here..."></div>
            </div><p><br></p>`;
        } else {
            html = `<div contenteditable="false" data-image-id="${imageId}" data-layout="right" class="editor-image-text-wrapper editor-image-right">
                <div contenteditable="true" class="editor-text-side" placeholder="Type here..."></div>
                <figure class="editor-figure-side">
                    <img src="${imagePath}" alt="" class="editor-image-side" />
                    <figcaption contenteditable="true" class="editor-caption-side" placeholder="Caption..."></figcaption>
                </figure>
            </div><p><br></p>`;
        }

        document.execCommand("insertHTML", false, html);
        setShowImagePicker(false);
        setShowImageLayoutPicker(false);

        setTimeout(() => {
            const lastP = editor.querySelector(`[data-image-id="${imageId}"]`)?.nextElementSibling;
            if (lastP) {
                const range = document.createRange();
                const sel = window.getSelection();
                range.setStart(lastP, 0);
                range.collapse(true);
                sel?.removeAllRanges();
                sel?.addRange(range);
            }
        }, 10);
    }, []);

    // Delete selected image
    const deleteSelectedImage = useCallback(() => {
        if (selectedImageElement) {
            selectedImageElement.remove();
            setSelectedImageElement(null);
            editorRef.current?.focus();
        }
    }, [selectedImageElement]);

    // Insert code block with language
    const insertCodeBlock = useCallback((language: string) => {
        const editor = editorRef.current;
        if (!editor) return;

        const codeId = `code-${Date.now()}`;
        const newCodeBlock: CodeBlock = {
            id: codeId,
            language,
            code: "// Your code here"
        };

        setCodeBlocks(prev => [...prev, newCodeBlock]);

        const html = `<div contenteditable="false" data-code-id="${codeId}" data-language="${language}" class="code-block-wrapper">
            <div class="code-block-header">
                <span class="code-block-lang">${language}</span>
            </div>
            <pre class="editor-code" contenteditable="true"><code>// Your code here</code></pre>
        </div><p><br></p>`;

        editor.focus();
        document.execCommand("insertHTML", false, html);
        setShowCodePicker(false);

        setTimeout(() => {
            const codeElement = editor.querySelector(`[data-code-id="${codeId}"] pre`);
            if (codeElement) {
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(codeElement);
                sel?.removeAllRanges();
                sel?.addRange(range);
            }
        }, 10);
    }, []);

    // Update code block language
    const updateCodeBlockLanguage = useCallback((codeId: string, newLang: string) => {
        const editor = editorRef.current;
        if (!editor) return;

        const wrapper = editor.querySelector(`[data-code-id="${codeId}"]`);
        if (wrapper) {
            wrapper.setAttribute("data-language", newLang);
            const langSpan = wrapper.querySelector(".code-block-lang");
            if (langSpan) {
                langSpan.textContent = newLang;
            }
        }

        setCodeBlocks(prev => prev.map(cb => 
            cb.id === codeId ? { ...cb, language: newLang } : cb
        ));
    }, []);

    // Delete selected code block
    const deleteSelectedCodeBlock = useCallback(() => {
        if (selectedCodeBlock) {
            const editor = editorRef.current;
            if (!editor) return;

            const wrapper = editor.querySelector(`[data-code-id="${selectedCodeBlock}"]`);
            if (wrapper) {
                wrapper.remove();
            }

            setCodeBlocks(prev => prev.filter(cb => cb.id !== selectedCodeBlock));
            setSelectedCodeBlock(null);
            editor.focus();
        }
    }, [selectedCodeBlock]);

    // Insert blockquote
    const insertBlockquote = useCallback(() => {
        const html = `<blockquote class="editor-quote">Your quote here</blockquote><p><br></p>`;
        document.execCommand("insertHTML", false, html);
        editorRef.current?.focus();
    }, []);

    // Insert horizontal rule
    const insertDivider = useCallback(() => {
        document.execCommand("insertHTML", false, `<hr class="editor-divider" /><p><br></p>`);
        editorRef.current?.focus();
    }, []);

    // Insert link
    const insertLink = useCallback(() => {
        const url = prompt("Enter URL:");
        if (url) {
            execCommand("createLink", url);
        }
    }, [execCommand]);

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case "b":
                    e.preventDefault();
                    execCommand("bold");
                    break;
                case "i":
                    e.preventDefault();
                    execCommand("italic");
                    break;
                case "u":
                    e.preventDefault();
                    execCommand("underline");
                    break;
                case "k":
                    e.preventDefault();
                    insertLink();
                    break;
            }
        }

        if (e.key === "Enter") {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const node = selection.anchorNode;
                const parent = node?.parentElement;
                if (parent?.closest("figcaption") || parent?.closest(".editor-caption-side")) {
                    e.preventDefault();
                    const figure = parent.closest("figure") || parent.closest(".editor-image-text-wrapper");
                    if (figure) {
                        const p = document.createElement("p");
                        p.innerHTML = "<br>";
                        figure.after(p);
                        const range = document.createRange();
                        range.setStart(p, 0);
                        range.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }
            }
        }
    }, [execCommand, insertLink]);

    // Helper function to clean HTML - keep only formatting tags, strip unwanted attributes
    const cleanHtml = (html: string): string => {
        // Create a temporary element to parse the HTML
        const temp = document.createElement("div");
        temp.innerHTML = html;
        
        // Get all elements and remove data-* attributes
        temp.querySelectorAll("*").forEach(el => {
            // Remove all data-* attributes
            Array.from(el.attributes).forEach(attr => {
                if (attr.name.startsWith("data-")) {
                    el.removeAttribute(attr.name);
                }
            });
        });
        
        // Replace p tags with their content + line breaks, keep only text and formatting
        let result = temp.innerHTML;
        // Remove p tags but keep content
        result = result.replace(/<p[^>]*>/gi, "");
        result = result.replace(/<\/p>/gi, "\n");
        // Remove div tags but keep content
        result = result.replace(/<div[^>]*>/gi, "");
        result = result.replace(/<\/div>/gi, "\n");
        // Clean up multiple line breaks
        result = result.replace(/\n{3,}/g, "\n\n");
        // Remove br followed by newlines
        result = result.replace(/<br\s*\/?>\s*\n/gi, "\n");
        result = result.replace(/<br\s*\/?>/gi, "\n");
        // Trim
        result = result.trim();
        
        return result;
    };

    // Parse editor content to JSON structure
    const parseContentToJson = () => {
        if (!editorRef.current) return [];

        const content: Array<{
            type: string;
            text?: string;
            level?: number;
            src?: string;
            alt?: string;
            caption?: string;
            language?: string;
            code?: string;
            url?: string;
            layout?: string;
        }> = [];

        const processNode = (node: ChildNode) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;
                const tagName = element.tagName.toLowerCase();

                if (element.classList.contains("code-block-wrapper")) {
                    const lang = element.dataset.language || "javascript";
                    const pre = element.querySelector("pre");
                    content.push({
                        type: "code",
                        language: lang,
                        code: pre?.textContent || "",
                    });
                    return;
                }

                if (element.classList.contains("editor-image-text-wrapper")) {
                    const layout = element.dataset.layout || "full";
                    const img = element.querySelector("img");
                    const caption = element.querySelector(".editor-caption-side");
                    const textSide = element.querySelector(".editor-text-side");
                    if (img) {
                        content.push({
                            type: "image",
                            src: img.getAttribute("src") || "",
                            alt: img.getAttribute("alt") || "",
                            caption: caption?.textContent?.trim() || "",
                            layout: layout,
                        });
                    }
                    // Export the side text as the next paragraph (will be paired with image in renderer)
                    if (textSide && textSide.textContent?.trim()) {
                        content.push({
                            type: "paragraph",
                            text: cleanHtml(textSide.innerHTML),
                        });
                    }
                    return;
                }

                switch (tagName) {
                    case "h1":
                    case "h2":
                    case "h3":
                    case "h4":
                        if (element.textContent?.trim()) {
                            content.push({
                                type: "heading",
                                level: parseInt(tagName[1]),
                                text: element.textContent.trim(),
                            });
                        }
                        break;
                    case "figure":
                        const figImg = element.querySelector("img");
                        const figCaption = element.querySelector("figcaption");
                        if (figImg) {
                            content.push({
                                type: "image",
                                src: figImg.getAttribute("src") || "",
                                alt: figImg.getAttribute("alt") || "",
                                caption: figCaption?.textContent?.trim() || "",
                                layout: element.dataset.layout || "full",
                            });
                        }
                        break;
                    case "img":
                        content.push({
                            type: "image",
                            src: element.getAttribute("src") || "",
                            alt: element.getAttribute("alt") || "",
                            caption: "",
                            layout: "full",
                        });
                        break;
                    case "p":
                    case "div":
                        // Check if this div contains an image first
                        const divImg = element.querySelector("img");
                        if (divImg && !element.classList.contains("code-block-header") && !element.classList.contains("editor-text-side")) {
                            content.push({
                                type: "image",
                                src: divImg.getAttribute("src") || "",
                                alt: divImg.getAttribute("alt") || "",
                                caption: element.querySelector("figcaption, .editor-caption-side")?.textContent?.trim() || "",
                                layout: element.dataset.layout || "full",
                            });
                        } else if (element.textContent?.trim() && !element.classList.contains("code-block-header")) {
                            // Use cleanHtml to preserve formatting (bold, italic, underline) but strip unwanted attributes
                            content.push({
                                type: "paragraph",
                                text: cleanHtml(element.innerHTML),
                            });
                        }
                        break;
                    case "pre":
                        if (!element.closest(".code-block-wrapper")) {
                            content.push({
                                type: "code",
                                language: "javascript",
                                code: element.textContent || "",
                            });
                        }
                        break;
                    case "blockquote":
                        if (element.textContent?.trim()) {
                            content.push({
                                type: "paragraph",
                                text: cleanHtml(element.innerHTML),
                            });
                        }
                        break;
                    case "ul":
                    case "ol":
                        element.querySelectorAll("li").forEach(li => {
                            if (li.textContent?.trim()) {
                                content.push({
                                    type: "paragraph",
                                    text: `• ${cleanHtml(li.innerHTML)}`,
                                });
                            }
                        });
                        break;
                    case "a":
                        content.push({
                            type: "link",
                            url: element.getAttribute("href") || "",
                            text: element.textContent || "",
                        });
                        break;
                }
            }
        };

        editorRef.current.childNodes.forEach(processNode);
        return content;
    };

    const generateJson = () => {
        const content = parseContentToJson();
        return JSON.stringify({ ...blogMeta, content }, null, 4);
    };

    const copyToClipboard = async () => {
        const json = generateJson();
        await navigator.clipboard.writeText(json);
        setCopiedNotification(true);
        setTimeout(() => setCopiedNotification(false), 2000);
    };

    const btnStyle = (active = false): React.CSSProperties => ({
        background: active ? "#dc143c" : "transparent",
        border: "1px solid " + (active ? "#dc143c" : "#2a2a2a"),
        color: active ? "#fff" : "#888",
        padding: "6px 10px",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: 500,
        transition: "all 0.15s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "32px",
        height: "32px",
    });

    const selectedCodeBlockLang = selectedCodeBlock 
        ? codeBlocks.find(cb => cb.id === selectedCodeBlock)?.language || "javascript"
        : null;

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "#0a0a0a",
            color: "#fff",
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            zIndex: 9999,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
        }}>
            {/* Header */}
            <header style={{
                padding: "0 1.5rem",
                height: "52px",
                borderBottom: "1px solid #1a1a1a",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#0a0a0a",
                flexShrink: 0,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <a href="/" style={{
                        color: "#555",
                        textDecoration: "none",
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                    }}>
                        ← Back
                    </a>
                    <div style={{ width: "1px", height: "16px", background: "#222" }} />
                    <span style={{
                        fontSize: "12px",
                        fontWeight: 500,
                        color: "#666",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                    }}>
                        Blog Editor
                    </span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                    <button
                        onClick={() => setShowJsonPanel(!showJsonPanel)}
                        style={{
                            ...btnStyle(showJsonPanel),
                            padding: "6px 12px",
                            minWidth: "auto",
                        }}
                    >
                        {showJsonPanel ? "Hide JSON" : "JSON"}
                    </button>
                    <button
                        onClick={copyToClipboard}
                        style={{
                            ...btnStyle(),
                            padding: "6px 12px",
                            minWidth: "auto",
                            background: "#dc143c",
                            color: "#fff",
                            border: "none",
                        }}
                    >
                        Export
                    </button>
                </div>
            </header>

            {/* Notification */}
            {copiedNotification && (
                <div style={{
                    position: "fixed",
                    top: "64px",
                    right: "1.5rem",
                    background: "#111",
                    color: "#22c55e",
                    padding: "10px 16px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    zIndex: 1000,
                    border: "1px solid #22c55e",
                }}>
                    Copied to clipboard
                </div>
            )}

            {/* Main Content */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                <main style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}>
                    {/* Post Settings */}
                    <details style={{
                        background: "#0d0d0d",
                        borderBottom: "1px solid #1a1a1a",
                        flexShrink: 0,
                    }}>
                        <summary style={{
                            padding: "0.75rem 1.5rem",
                            cursor: "pointer",
                            fontSize: "11px",
                            fontWeight: 500,
                            color: "#555",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            listStyle: "none",
                        }}>
                            Post Settings
                        </summary>
                        <div style={{ padding: "0 1.5rem 1rem", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                            <div style={{ gridColumn: "1 / -1" }}>
                                <label style={{ display: "block", fontSize: "10px", color: "#444", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Title</label>
                                <input
                                    type="text"
                                    value={blogMeta.title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    placeholder="Blog title..."
                                    style={{
                                        width: "100%",
                                        padding: "8px 10px",
                                        background: "#111",
                                        border: "1px solid #222",
                                        borderRadius: "4px",
                                        color: "#fff",
                                        fontSize: "13px",
                                        outline: "none",
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "10px", color: "#444", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Slug</label>
                                <input type="text" value={blogMeta.slug} readOnly style={{ width: "100%", padding: "8px 10px", background: "#080808", border: "1px solid #1a1a1a", borderRadius: "4px", color: "#444", fontSize: "12px" }} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "10px", color: "#444", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Author</label>
                                <input type="text" value={blogMeta.author} onChange={(e) => setBlogMeta(prev => ({ ...prev, author: e.target.value }))} style={{ width: "100%", padding: "8px 10px", background: "#111", border: "1px solid #222", borderRadius: "4px", color: "#fff", fontSize: "12px", outline: "none" }} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "10px", color: "#444", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Date</label>
                                <input type="date" value={blogMeta.date} onChange={(e) => setBlogMeta(prev => ({ ...prev, date: e.target.value }))} style={{ width: "100%", padding: "8px 10px", background: "#111", border: "1px solid #222", borderRadius: "4px", color: "#fff", fontSize: "12px", outline: "none" }} />
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                                <label style={{ display: "block", fontSize: "10px", color: "#444", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Excerpt</label>
                                <textarea value={blogMeta.excerpt} onChange={(e) => setBlogMeta(prev => ({ ...prev, excerpt: e.target.value }))} placeholder="Brief description..." rows={2} style={{ width: "100%", padding: "8px 10px", background: "#111", border: "1px solid #222", borderRadius: "4px", color: "#fff", fontSize: "12px", resize: "none", outline: "none" }} />
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                                <label style={{ display: "block", fontSize: "10px", color: "#444", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tags</label>
                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
                                    {blogMeta.tags.map((tag, i) => (
                                        <span key={i} style={{ background: "#1a1a1a", color: "#888", padding: "3px 8px", borderRadius: "3px", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                                            {tag}
                                            <button onClick={() => removeTag(i)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", padding: 0, fontSize: "12px" }}>×</button>
                                        </span>
                                    ))}
                                </div>
                                <div style={{ display: "flex", gap: "6px" }}>
                                    <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTag()} placeholder="Add tag..." style={{ flex: 1, padding: "6px 10px", background: "#111", border: "1px solid #222", borderRadius: "4px", color: "#fff", fontSize: "12px", outline: "none" }} />
                                    <button onClick={addTag} style={btnStyle()}>+</button>
                                </div>
                            </div>
                        </div>
                    </details>

                    {/* Toolbar */}
                    <div style={{
                        padding: "8px 1.5rem",
                        borderBottom: "1px solid #1a1a1a",
                        display: "flex",
                        gap: "4px",
                        flexWrap: "wrap",
                        alignItems: "center",
                        background: "#0a0a0a",
                        flexShrink: 0,
                    }}>
                        <button onClick={() => execCommand("formatBlock", "h2")} style={btnStyle()} title="Heading 2">H2</button>
                        <button onClick={() => execCommand("formatBlock", "h3")} style={btnStyle()} title="Heading 3">H3</button>
                        <button onClick={() => execCommand("formatBlock", "p")} style={btnStyle()} title="Paragraph">P</button>

                        <div style={{ width: "1px", height: "20px", background: "#222", margin: "0 6px" }} />

                        <button onClick={() => execCommand("bold")} style={btnStyle(activeFormat.includes("bold"))} title="Bold (Ctrl+B)"><strong>B</strong></button>
                        <button onClick={() => execCommand("italic")} style={btnStyle(activeFormat.includes("italic"))} title="Italic (Ctrl+I)"><em>I</em></button>
                        <button onClick={() => execCommand("underline")} style={btnStyle(activeFormat.includes("underline"))} title="Underline (Ctrl+U)"><u>U</u></button>
                        <button onClick={() => execCommand("strikeThrough")} style={btnStyle(activeFormat.includes("strikeThrough"))} title="Strikethrough"><s>S</s></button>

                        <div style={{ width: "1px", height: "20px", background: "#222", margin: "0 6px" }} />

                        <button onClick={() => execCommand("insertUnorderedList")} style={btnStyle()} title="Bullet List">•</button>
                        <button onClick={() => execCommand("insertOrderedList")} style={btnStyle()} title="Numbered List">1.</button>

                        <div style={{ width: "1px", height: "20px", background: "#222", margin: "0 6px" }} />

                        {/* Image Picker with Layout Options */}
                        <div style={{ position: "relative" }}>
                            <button onClick={() => { setShowImagePicker(!showImagePicker); setShowCodePicker(false); }} style={btnStyle(showImagePicker)} title="Insert Image">IMG</button>
                            {showImagePicker && (
                                <div style={{
                                    position: "absolute",
                                    top: "100%",
                                    left: 0,
                                    background: "#111",
                                    border: "1px solid #222",
                                    borderRadius: "6px",
                                    marginTop: "4px",
                                    zIndex: 100,
                                    minWidth: "320px",
                                    boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
                                }}>
                                    <div style={{ padding: "8px 12px", borderBottom: "1px solid #1a1a1a", fontSize: "10px", color: "#555", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        Select Image & Layout
                                    </div>
                                    {/* Folder Selector */}
                                    <div style={{ padding: "8px", borderBottom: "1px solid #1a1a1a" }}>
                                        <select
                                            value={selectedImageFolder}
                                            onChange={(e) => setSelectedImageFolder(e.target.value)}
                                            style={{
                                                width: "100%",
                                                padding: "6px 10px",
                                                background: "#0a0a0a",
                                                border: "1px solid #2a2a2a",
                                                borderRadius: "4px",
                                                color: "#ccc",
                                                fontSize: "12px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            {Object.keys(PUBLIC_IMAGES).map((folder) => (
                                                <option key={folder} value={folder}>
                                                    📁 {folder}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                                        {PUBLIC_IMAGES[selectedImageFolder]?.map((img) => (
                                            <div key={img.path} style={{ borderBottom: "1px solid #1a1a1a" }}>
                                                <div style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <Image src={img.path} alt={img.name} width={32} height={32} style={{ borderRadius: "3px", objectFit: "cover" }} />
                                                    <span style={{ flex: 1, fontSize: "12px", color: "#aaa" }}>{img.name}</span>
                                                </div>
                                                <div style={{ padding: "4px 12px 8px", display: "flex", gap: "4px" }}>
                                                    <button
                                                        onClick={() => insertImage(img.path, "full")}
                                                        style={{ ...btnStyle(), flex: 1, fontSize: "10px", padding: "4px" }}
                                                    >
                                                        Full
                                                    </button>
                                                    <button
                                                        onClick={() => insertImage(img.path, "left")}
                                                        style={{ ...btnStyle(), flex: 1, fontSize: "10px", padding: "4px" }}
                                                    >
                                                        Left
                                                    </button>
                                                    <button
                                                        onClick={() => insertImage(img.path, "right")}
                                                        style={{ ...btnStyle(), flex: 1, fontSize: "10px", padding: "4px" }}
                                                    >
                                                        Right
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {(!PUBLIC_IMAGES[selectedImageFolder] || PUBLIC_IMAGES[selectedImageFolder].length === 0) && (
                                            <div style={{ padding: "20px", textAlign: "center", color: "#555", fontSize: "12px" }}>
                                                No images in this folder
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Code Block with Language Selection */}
                        <div style={{ position: "relative" }}>
                            <button onClick={() => { setShowCodePicker(!showCodePicker); setShowImagePicker(false); }} style={btnStyle(showCodePicker)} title="Code Block">&lt;/&gt;</button>
                            {showCodePicker && (
                                <div style={{
                                    position: "absolute",
                                    top: "100%",
                                    left: 0,
                                    background: "#111",
                                    border: "1px solid #222",
                                    borderRadius: "6px",
                                    marginTop: "4px",
                                    zIndex: 100,
                                    minWidth: "160px",
                                    boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
                                }}>
                                    <div style={{ padding: "8px 12px", borderBottom: "1px solid #1a1a1a", fontSize: "10px", color: "#555", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        Select Language
                                    </div>
                                    <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                                        {LANGUAGES.map((lang) => (
                                            <button
                                                key={lang.id}
                                                onClick={() => insertCodeBlock(lang.id)}
                                                style={{
                                                    width: "100%",
                                                    padding: "8px 12px",
                                                    background: "transparent",
                                                    border: "none",
                                                    color: "#aaa",
                                                    cursor: "pointer",
                                                    textAlign: "left",
                                                    fontSize: "12px",
                                                    borderBottom: "1px solid #1a1a1a",
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = "#1a1a1a"}
                                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                            >
                                                {lang.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button onClick={insertBlockquote} style={btnStyle()} title="Quote">&ldquo;</button>
                        <button onClick={insertDivider} style={btnStyle()} title="Divider">—</button>
                        <button onClick={insertLink} style={btnStyle()} title="Link (Ctrl+K)">Link</button>

                        {/* Selected Image Actions */}
                        {selectedImageElement && (
                            <>
                                <div style={{ width: "1px", height: "20px", background: "#222", margin: "0 6px" }} />
                                <button onClick={deleteSelectedImage} style={{ ...btnStyle(), background: "#dc143c", color: "#fff", border: "none" }} title="Delete Image">Delete Image</button>
                            </>
                        )}

                        {/* Selected Code Block Actions */}
                        {selectedCodeBlock && (
                            <>
                                <div style={{ width: "1px", height: "20px", background: "#222", margin: "0 6px" }} />
                                <select
                                    value={selectedCodeBlockLang || "javascript"}
                                    onChange={(e) => updateCodeBlockLanguage(selectedCodeBlock, e.target.value)}
                                    style={{
                                        background: "#111",
                                        border: "1px solid #2a2a2a",
                                        color: "#888",
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        fontSize: "12px",
                                        cursor: "pointer",
                                    }}
                                >
                                    {LANGUAGES.map(lang => (
                                        <option key={lang.id} value={lang.id}>{lang.name}</option>
                                    ))}
                                </select>
                                <button onClick={deleteSelectedCodeBlock} style={{ ...btnStyle(), background: "#dc143c", color: "#fff", border: "none" }} title="Delete Code Block">Delete Code</button>
                            </>
                        )}
                    </div>

                    {/* Editor */}
                    <div style={{ flex: 1, overflow: "auto", padding: "2rem" }}>
                        <div
                            ref={editorRef}
                            contentEditable
                            suppressContentEditableWarning
                            onKeyDown={handleKeyDown}
                            style={{
                                maxWidth: "700px",
                                margin: "0 auto",
                                minHeight: "100%",
                                color: "#ccc",
                                fontSize: "15px",
                                lineHeight: 1.8,
                                outline: "none",
                            }}
                            data-placeholder="Start writing..."
                        />
                    </div>
                </main>

                {/* JSON Panel */}
                {showJsonPanel && (
                    <aside style={{
                        width: "380px",
                        borderLeft: "1px solid #1a1a1a",
                        background: "#0d0d0d",
                        padding: "1rem",
                        overflowY: "auto",
                        flexShrink: 0,
                    }}>
                        <h3 style={{ fontSize: "10px", fontWeight: 500, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>JSON Output</h3>
                        <pre style={{
                            background: "#0a0a0a",
                            padding: "1rem",
                            borderRadius: "4px",
                            fontSize: "10px",
                            color: "#666",
                            overflow: "auto",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            border: "1px solid #1a1a1a",
                            lineHeight: 1.5,
                            fontFamily: "'SF Mono', 'Fira Code', monospace",
                        }}>
                            {generateJson()}
                        </pre>
                    </aside>
                )}
            </div>

            <style jsx global>{`
                * { box-sizing: border-box; }
                details summary::-webkit-details-marker { display: none; }
                
                [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #333;
                    pointer-events: none;
                }
                
                [contenteditable] h2 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #fff;
                    margin: 1.5rem 0 0.75rem 0;
                    letter-spacing: -0.02em;
                }
                
                [contenteditable] h3 {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #fff;
                    margin: 1.25rem 0 0.5rem 0;
                }
                
                [contenteditable] p {
                    margin: 0.5rem 0;
                }
                
                [contenteditable] a {
                    color: #dc143c;
                    text-decoration: underline;
                }
                
                [contenteditable] ul, [contenteditable] ol {
                    margin: 0.75rem 0;
                    padding-left: 1.5rem;
                }
                
                [contenteditable] li {
                    margin: 0.25rem 0;
                }
                
                .editor-figure {
                    margin: 1.5rem 0;
                    text-align: center;
                    position: relative;
                    border-radius: 6px;
                    padding: 0.5rem;
                    transition: background 0.2s;
                }
                
                .editor-figure:hover,
                .editor-figure:focus-within {
                    background: rgba(255,255,255,0.02);
                }
                
                .editor-image {
                    max-width: 100%;
                    height: auto;
                    border-radius: 6px;
                    cursor: pointer;
                }
                
                .editor-caption {
                    font-size: 0.8rem;
                    color: #666;
                    margin-top: 0.5rem;
                    font-style: italic;
                    outline: none;
                    text-align: center;
                }
                
                .editor-caption:empty:before {
                    content: "Add caption...";
                    color: #444;
                }

                /* Side-by-side image layouts */
                .editor-image-text-wrapper {
                    display: flex;
                    gap: 1.5rem;
                    margin: 1.5rem 0;
                    padding: 0.75rem;
                    border-radius: 8px;
                    transition: background 0.2s;
                }
                
                .editor-image-text-wrapper:hover {
                    background: rgba(255,255,255,0.02);
                }
                
                .editor-figure-side {
                    flex: 0 0 45%;
                    text-align: center;
                }
                
                .editor-image-side {
                    max-width: 100%;
                    height: auto;
                    border-radius: 6px;
                    cursor: pointer;
                }
                
                .editor-caption-side {
                    font-size: 0.75rem;
                    color: #555;
                    margin-top: 0.5rem;
                    font-style: italic;
                    outline: none;
                    text-align: center;
                }
                
                .editor-caption-side:empty:before {
                    content: "Caption...";
                    color: #333;
                }
                
                .editor-text-side {
                    flex: 1;
                    padding: 0.5rem;
                    color: #ccc;
                    outline: none;
                    font-size: 15px;
                    line-height: 1.8;
                }
                
                .editor-text-side:empty:before {
                    content: attr(placeholder);
                    color: #444;
                }

                /* Code blocks */
                .code-block-wrapper {
                    margin: 1.5rem 0;
                    border-radius: 8px;
                    overflow: hidden;
                    border: 1px solid #1a1a1a;
                    transition: border-color 0.2s;
                }
                
                .code-block-wrapper:hover,
                .code-block-wrapper:focus-within {
                    border-color: #2a2a2a;
                }
                
                .code-block-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.5rem 1rem;
                    background: #151515;
                    border-bottom: 1px solid #1a1a1a;
                }
                
                .code-block-lang {
                    font-size: 0.7rem;
                    color: #dc143c;
                    text-transform: uppercase;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                }
                
                .editor-code {
                    background: #0d0d0d;
                    padding: 1rem;
                    overflow-x: auto;
                    font-family: 'SF Mono', 'Fira Code', 'Monaco', monospace;
                    font-size: 13px;
                    margin: 0;
                    color: #aaa;
                    outline: none;
                    white-space: pre-wrap;
                    line-height: 1.6;
                }
                
                .editor-quote {
                    border-left: 3px solid #dc143c;
                    padding-left: 1rem;
                    margin: 1rem 0;
                    font-style: italic;
                    color: #888;
                }
                
                .editor-divider {
                    border: none;
                    border-top: 1px solid #222;
                    margin: 1.5rem 0;
                }
                
                input:focus, textarea:focus {
                    border-color: #333 !important;
                }
            `}</style>
        </div>
    );
}
