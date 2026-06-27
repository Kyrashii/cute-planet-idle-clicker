import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

const LOW_MEMORY_KEY = "cute_planet_low_memory";
const FONT_SCALE_KEY = "cute_planet_font_scale";

export const FONT_SCALE_OPTIONS = [90, 95, 100, 110, 120] as const;
export type FontScaleOption = (typeof FONT_SCALE_OPTIONS)[number];

function normalizeFontScale(value: number): FontScaleOption {
  return FONT_SCALE_OPTIONS.includes(value as FontScaleOption) ? (value as FontScaleOption) : 100;
}

export interface DisplayPreferences {
  isLowMemory: boolean;
  setIsLowMemory: Dispatch<SetStateAction<boolean>>;
  fontScale: FontScaleOption;
  setFontScale: Dispatch<SetStateAction<FontScaleOption>>;
  prefersReducedMotion: boolean;
  /** True when GPU-heavy animations should be dropped (low-memory OR reduced-motion). */
  disableAnimations: boolean;
}

/**
 * Display / performance preferences: the user's persisted low-memory toggle and
 * the OS `prefers-reduced-motion` setting, plus the derived `disableAnimations`
 * flag the UI uses to drop GPU-heavy effects.
 */
export function useDisplayPreferences(): DisplayPreferences {
  const [isLowMemory, setIsLowMemory] = useState<boolean>(
    () => localStorage.getItem(LOW_MEMORY_KEY) === "true",
  );
  const [fontScale, setFontScale] = useState<FontScaleOption>(() => {
    const rawValue = Number(localStorage.getItem(FONT_SCALE_KEY) ?? "100");
    return normalizeFontScale(rawValue);
  });

  useEffect(() => {
    localStorage.setItem(LOW_MEMORY_KEY, isLowMemory.toString());
  }, [isLowMemory]);

  useEffect(() => {
    localStorage.setItem(FONT_SCALE_KEY, fontScale.toString());
  }, [fontScale]);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const disableAnimations = isLowMemory || prefersReducedMotion;

  return {
    isLowMemory,
    setIsLowMemory,
    fontScale,
    setFontScale,
    prefersReducedMotion,
    disableAnimations,
  };
}
