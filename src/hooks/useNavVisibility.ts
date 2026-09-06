import { useState, useEffect, useCallback, useRef } from 'react';

interface UseNavVisibilityOptions {
  threshold?: number;
  topTolerance?: number;
  autoHideDelay?: number;
}

export function useNavVisibility(options: UseNavVisibilityOptions = {}) {
  const {
    threshold = 12, // Scroll distance before triggering hide/show
    topTolerance = 30, // Distance from top where nav is always visible
    autoHideDelay = 6000, // Auto hide after 6s of idle when scrolled down
  } = options;

  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isManualHidden, setIsManualHidden] = useState(false);
  const lastScrollY = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (window.scrollY > 150 && !isManualHidden) {
      idleTimer.current = setTimeout(() => {
        setIsNavVisible(false);
      }, autoHideDelay);
    }
  }, [autoHideDelay, isManualHidden]);

  const showNav = useCallback(() => {
    setIsNavVisible(true);
    setIsManualHidden(false);
    resetIdleTimer();
  }, [resetIdleTimer]);

  const hideNav = useCallback(() => {
    setIsNavVisible(false);
    setIsManualHidden(true);
    if (idleTimer.current) clearTimeout(idleTimer.current);
  }, []);

  const toggleNav = useCallback(() => {
    if (isNavVisible) {
      hideNav();
    } else {
      showNav();
    }
  }, [isNavVisible, hideNav, showNav]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollY.current;

      // Always show when close to the top
      if (currentScrollY <= topTolerance) {
        setIsNavVisible(true);
        setIsManualHidden(false);
        lastScrollY.current = currentScrollY;
        return;
      }

      // If manual hidden was activated, only scroll UP will unhide
      if (isManualHidden) {
        if (diff < -threshold * 2) {
          setIsManualHidden(false);
          setIsNavVisible(true);
        }
        lastScrollY.current = currentScrollY;
        return;
      }

      // Scrolling DOWN -> Hide menus
      if (diff > threshold) {
        setIsNavVisible(false);
      }
      // Scrolling UP -> Reveal menus
      else if (diff < -threshold) {
        setIsNavVisible(true);
        resetIdleTimer();
      }

      lastScrollY.current = currentScrollY;
    };

    // Desktop: Edge hover reveal (if user moves mouse to top or bottom edge)
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY < 45 || e.clientY > window.innerHeight - 55) {
        setIsNavVisible(true);
        resetIdleTimer();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [threshold, topTolerance, isManualHidden, resetIdleTimer]);

  return {
    isNavVisible,
    isManualHidden,
    showNav,
    hideNav,
    toggleNav,
  };
}
