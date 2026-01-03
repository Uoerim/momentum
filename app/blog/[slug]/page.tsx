"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BlogContent from "../../components/BlogContent";
import Navigation from "../../Navigation";

export default function BlogSlugPage() {
    const params = useParams();
    const router = useRouter();
    const [isMobile, setIsMobile] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const slug = params.slug as string;

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        setIsReady(true);
        // Mark loading as seen so main page won't show loading screen on navigation
        sessionStorage.setItem("hasSeenLoading", "true");
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Set blog as active section for navigation
    useEffect(() => {
        if (isReady && !isMobile) {
            window.dispatchEvent(new CustomEvent("activeSectionChange", { detail: "blog" }));
        }
    }, [isReady, isMobile]);

    // Set up scrollToSection for navigation - redirect to main page sections
    useEffect(() => {
        const sectionPaths: Record<string, string> = {
            home: "/",
            projects: "/projects",
            blog: "/blog",
            contact: "/contact"
        };
        
        (window as unknown as { scrollToSection: (id: string) => void }).scrollToSection = (id: string) => {
            const path = sectionPaths[id];
            if (path) {
                router.push(path);
            }
        };
    }, [router]);

    // On mobile, redirect to main page with slug parameter
    useEffect(() => {
        if (isReady && isMobile && slug) {
            // Store the slug in sessionStorage and redirect to main page
            sessionStorage.setItem("openBlogSlug", slug);
            router.replace("/blog");
        }
    }, [isMobile, isReady, slug, router]);

    // Wait for client-side check
    if (!isReady) {
        return null;
    }

    // Desktop: render BlogContent directly with the slug
    if (isMobile) {
        return null; // Will redirect
    }

    return (
        <div style={{
            width: "100vw",
            height: "100vh",
            background: "var(--background)",
            overflow: "hidden"
        }}>
            <Navigation />
            <BlogContent isLoading={false} isActive={true} initialSlug={slug} />
        </div>
    );
}
