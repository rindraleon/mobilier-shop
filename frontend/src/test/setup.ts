import "@testing-library/jest-dom/vitest";

/**
 * jsdom n'implémente pas encore ces API de navigateur utilisées par
 * `Reveal` (IntersectionObserver) et `ScrollToTop` (window.scrollTo).
 * On fournit des substituts neutres pour pouvoir monter l'application.
 */
class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: readonly number[] = [];
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

globalThis.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver;

if (typeof window !== "undefined") {
  window.scrollTo = (() => undefined) as unknown as typeof window.scrollTo;
  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
  }
}
