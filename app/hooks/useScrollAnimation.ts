"use client";

import { useEffect, useRef, useState, RefObject } from "react";

interface ScrollAnimationOptions {
    threshold?: number;
    rootMargin?: string;
    once?: boolean;
}

export function useScrollAnimation<T extends HTMLElement>(
    options: ScrollAnimationOptions = {}
): [RefObject<T | null>, boolean] {
    const { threshold = 0.1, rootMargin = "0px", once = false } = options;
    const ref = useRef<T>(null);
    const [isVisible, setIsVisible] = useState(false);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (once && hasAnimated.current) return;
                
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    hasAnimated.current = true;
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [threshold, rootMargin, once]);

    return [ref, isVisible];
}

// Hook for multiple elements
export function useScrollAnimationMultiple(
    count: number,
    options: ScrollAnimationOptions = {}
): [RefObject<(HTMLElement | null)[]>, boolean[]] {
    const { threshold = 0.1, rootMargin = "0px", once = false } = options;
    const refs = useRef<(HTMLElement | null)[]>(Array(count).fill(null));
    const [visibleStates, setVisibleStates] = useState<boolean[]>(Array(count).fill(false));
    const hasAnimated = useRef<boolean[]>(Array(count).fill(false));

    useEffect(() => {
        const observers: IntersectionObserver[] = [];

        refs.current.forEach((element, index) => {
            if (!element) return;

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (once && hasAnimated.current[index]) return;
                    
                    setVisibleStates(prev => {
                        const newStates = [...prev];
                        if (entry.isIntersecting) {
                            newStates[index] = true;
                            hasAnimated.current[index] = true;
                        } else if (!once) {
                            newStates[index] = false;
                        }
                        return newStates;
                    });
                },
                { threshold, rootMargin }
            );

            observer.observe(element);
            observers.push(observer);
        });

        return () => {
            observers.forEach((observer, index) => {
                if (refs.current[index]) {
                    observer.unobserve(refs.current[index]!);
                }
            });
        };
    }, [count, threshold, rootMargin, once]);

    return [refs, visibleStates];
}
