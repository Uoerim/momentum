"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProjectsContent from "../../components/ProjectsContent";
import Navigation from "../../Navigation";

export default function ProjectNamePage() {
    const params = useParams();
    const router = useRouter();
    const [isMobile, setIsMobile] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const name = params.name as string;

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

    // Set projects as active section for navigation
    useEffect(() => {
        if (isReady && !isMobile) {
            window.dispatchEvent(new CustomEvent("activeSectionChange", { detail: "projects" }));
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

    // On mobile, redirect to main page with name parameter
    useEffect(() => {
        if (isReady && isMobile && name) {
            // Store the project name in sessionStorage and redirect to main page
            sessionStorage.setItem("openProjectName", name);
            router.replace("/projects");
        }
    }, [isMobile, isReady, name, router]);

    // Wait for client-side check
    if (!isReady) {
        return null;
    }

    // Desktop: render ProjectsContent directly with the project name
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
            <ProjectsContent isLoading={false} isActive={true} initialProjectName={name} />
        </div>
    );
}
