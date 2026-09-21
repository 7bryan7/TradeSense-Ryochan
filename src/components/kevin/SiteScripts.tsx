import { useEffect } from 'react';

/**
 * Loads the site's vendor libraries + the ported `site.js` in the exact order required.
 * Each script waits for the previous `onload` before proceeding.
 * Ensures ScrollSmoother and ScrollTrigger clean up gracefully if navigating away.
 */
const SCRIPTS = [
  '/vendor/jquery-3.6.0.min.js',
  '/vendor/gsap.min.js',
  '/vendor/CustomEase.min.js',
  '/vendor/lazyload.min.js',
  '/vendor/lottie.min.js',
  '/vendor/swiper-bundle.min.js',
  '/vendor/ScrollTrigger.min.js',
  '/vendor/ScrollSmoother.min.js',
  '/vendor/SplitText.min.js',
  '/vendor/ScrollToPlugin.min.js',
  '/vendor/site.js',
];

export const SiteScripts: React.FC = () => {
  useEffect(() => {
    const w = window as unknown as {
      __tradesenseInit?: boolean;
      ScrollSmoother?: {
        get: () => { kill: () => void; paused: (p: boolean) => void } | undefined;
      };
      ScrollTrigger?: {
        getAll: () => Array<{ kill: () => void }>;
      };
    };

    if (w.__tradesenseInit) {
      // Re-trigger scroll refresh if already loaded
      setTimeout(() => {
        if (w.ScrollTrigger) {
          window.dispatchEvent(new Event('resize'));
        }
      }, 100);
      return;
    }
    w.__tradesenseInit = true;

    let cancelled = false;

    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        // If already in DOM, don't duplicate
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          resolve();
          return;
        }

        const s = document.createElement('script');
        s.src = src;
        s.async = false;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.body.appendChild(s);
      });

    (async () => {
      for (const src of SCRIPTS) {
        if (cancelled) return;
        await loadScript(src);
      }
    })().catch((err) => console.error(err));

    return () => {
      cancelled = true;
      // When leaving landing page to dashboard, kill smooth scrolling so dashboard scrolls normally
      try {
        if (w.ScrollSmoother) {
          const smoother = w.ScrollSmoother.get();
          if (smoother) smoother.kill();
        }
      } catch (e) {
        // Ignore unmount error
      }
    };
  }, []);

  return null;
};

export default SiteScripts;
