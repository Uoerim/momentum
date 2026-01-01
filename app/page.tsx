"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

const sections = [
  { id: "home", name: "Home", path: "/" },
  { id: "projects", name: "Projects", path: "/projects" },
  { id: "blog", name: "Blog", path: "/blog" },
  { id: "contact", name: "Contact", path: "/contact" },
];

export default function HomePage() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [allGlow, setAllGlow] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const canNavigate = useRef(true);
  const lastScrollTime = useRef(0);
  const scrollCooldown = 1200; // ms to ignore scroll inertia

  // Get section index from pathname
  const getIndexFromPath = useCallback((path: string) => {
    const index = sections.findIndex((s) => s.path === path);
    return index >= 0 ? index : 0;
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

    // After all icons are lit (2.6s), start fade out
    const fadeTimer = setTimeout(() => {
      setAllGlow(true); // This now triggers fade-out class
    }, 2600);

    // Hide loading screen after fade out (3.1s)
    const hideTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3100);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [pathname, getIndexFromPath]);

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

  // Wheel and keyboard navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const now = Date.now();
      if (now - lastScrollTime.current < scrollCooldown) return;

      if (e.deltaY > 10) {
        navigateToIndex(currentIndex + 1);
      } else if (e.deltaY < -10) {
        navigateToIndex(currentIndex - 1);
      }
    };

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

    let touchStartX = 0;
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastScrollTime.current < scrollCooldown) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 50) navigateToIndex(currentIndex + 1);
        else if (diffX < -50) navigateToIndex(currentIndex - 1);
      } else {
        if (diffY > 50) navigateToIndex(currentIndex + 1);
        else if (diffY < -50) navigateToIndex(currentIndex - 1);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
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
            className={`section ${index === currentIndex ? "active" : ""}`}
          >
            <h1>{section.name}</h1>
          </section>
        ))}
      </div>
    </>
  );
}
