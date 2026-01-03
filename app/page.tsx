"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import HomeContent from "./components/HomeContent";
import ProjectsContent from "./components/ProjectsContent";
import BlogContent from "./components/BlogContent";
import ContactContent from "./components/ContactContent";

const sections = [
  { id: "home", name: "Home", path: "/", component: HomeContent },
  { id: "projects", name: "Projects", path: "/projects", component: ProjectsContent },
  { id: "blog", name: "Blog", path: "/blog", component: BlogContent },
  { id: "contact", name: "Contact", path: "/contact", component: ContactContent },
];

export default function MainPage() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [allGlow, setAllGlow] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const canNavigate = useRef(true);
  const lastScrollTime = useRef(0);
  const scrollCooldown = 1200; // ms to ignore scroll inertia

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Get section index from pathname
  const getIndexFromPath = useCallback((path: string) => {
    // First try exact match
    const exactIndex = sections.findIndex((s) => s.path === path);
    if (exactIndex >= 0) return exactIndex;

    // Then try prefix match (e.g., /blog/some-slug should match /blog)
    const prefixIndex = sections.findIndex((s) => s.path !== "/" && path.startsWith(s.path));
    if (prefixIndex >= 0) return prefixIndex;

    return 0;
  }, []);

  // Navigate to section
  const navigateToIndex = useCallback((newIndex: number, updateUrl: boolean = true) => {
    if (newIndex < 0 || newIndex >= sections.length) return;

    const now = Date.now();
    if (now - lastScrollTime.current < scrollCooldown) return;
    if (newIndex === currentIndex) return;

    lastScrollTime.current = now;
    canNavigate.current = false;
    setCurrentIndex(newIndex);

    if (updateUrl) {
      window.history.pushState(null, "", sections[newIndex].path);
    }

    // Dispatch event for navigation component
    window.dispatchEvent(new CustomEvent("activeSectionChange", { detail: sections[newIndex].id }));

    // Re-enable navigation after cooldown
    setTimeout(() => {
      canNavigate.current = true;
    }, scrollCooldown);
  }, [currentIndex]);

  // Initial load based on URL
  useEffect(() => {
    const index = getIndexFromPath(pathname);
    setCurrentIndex(index);
    window.dispatchEvent(new CustomEvent("activeSectionChange", { detail: sections[index].id }));
  }, [pathname, getIndexFromPath]);

  // Loading animation - runs once on mount
  useEffect(() => {
    // After all icons are lit (2.6s), start fade out
    const fadeTimer = setTimeout(() => {
      setAllGlow(true);
    }, 2600);

    // Hide loading screen after fade out (3.1s)
    const hideTimer = setTimeout(() => {
      setIsLoading(false);

      // Mobile auto-scroll to section after loading
      const index = getIndexFromPath(window.location.pathname);
      if (window.innerWidth <= 768 && index > 0) {
        setTimeout(() => {
          const sectionEl = document.getElementById(sections[index].id);
          if (sectionEl) {
            sectionEl.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    }, 3100);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const index = getIndexFromPath(window.location.pathname);
      setCurrentIndex(index);
      window.dispatchEvent(new CustomEvent("activeSectionChange", { detail: sections[index].id }));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [getIndexFromPath]);

  // Keyboard navigation only (scroll and touch disabled)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      if (now - lastScrollTime.current < scrollCooldown) return;

      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        navigateToIndex(currentIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        navigateToIndex(currentIndex - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, navigateToIndex]);

  // Expose scrollToSection globally for nav buttons
  useEffect(() => {
    (window as unknown as { scrollToSection: (id: string) => void }).scrollToSection = (id: string) => {
      const index = sections.findIndex((s) => s.id === id);
      if (index !== -1 && index !== currentIndex) {
        setCurrentIndex(index);
        window.history.pushState(null, "", sections[index].path);
        window.dispatchEvent(new CustomEvent("activeSectionChange", { detail: id }));
      }
    };
  }, [currentIndex]);

  return (
    <>
      {/* Loading overlay - always rendered but hidden when done */}
      <div className="loading-screen" style={{ display: isLoading ? "flex" : "none" }}>
        <div className={`loading-icons ${allGlow ? "fade-out" : ""}`}>
          <Image
            src="/red_diamond.svg"
            alt="Diamond"
            width={60}
            height={90}
            className="loading-icon"
            style={{ width: "auto", height: "70px" }}
            priority
          />
          <Image
            src="/white_spade.svg"
            alt="Spade"
            width={60}
            height={60}
            className="loading-icon"
            style={{ width: "auto", height: "55px" }}
            priority
          />
          <Image
            src="/red_heart.svg"
            alt="Heart"
            width={60}
            height={60}
            className="loading-icon"
            style={{ width: "auto", height: "55px" }}
            priority
          />
          <Image
            src="/white_club.svg"
            alt="Club"
            width={60}
            height={60}
            className="loading-icon"
            style={{ width: "auto", height: "50px" }}
            priority
          />
        </div>
      </div>

      {/* Content - always rendered underneath loading */}
      <div className="content">
        {sections.map((section, index) => (
          <section
            key={section.id}
            id={section.id}
            className={`section ${isMobile || index === currentIndex ? "active" : ""}`}
          >
            <section.component isLoading={isLoading} isActive={isMobile || index === currentIndex} />
          </section>
        ))}
      </div>
    </>
  );
}
