import { useEffect, useState } from 'react';

/**
 * Returns true if the user's OS/browser has requested reduced motion.
 * Every animated piece of the landing page (3D bot, floating cards,
 * scroll reveals, parallax) checks this before animating.
 */
export const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setReduced(e.matches);
    if (mql.addEventListener) {
      mql.addEventListener('change', handler);
    } else {
      mql.addListener(handler);
    }
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handler);
      } else {
        mql.removeListener(handler);
      }
    };
  }, []);

  return reduced;
};

export default usePrefersReducedMotion;
