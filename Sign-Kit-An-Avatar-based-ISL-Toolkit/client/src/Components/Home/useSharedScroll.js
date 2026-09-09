// src/Components/Home/useSharedScroll.js
import { useRef } from 'react';
import { useScroll } from 'framer-motion';

/**
 * Hook that provides a ref to attach to a container element and a shared
 * scrollYProgress motion value that maps from 0 to 1 across the container's
 * height.
 *
 * @param {Array} offset - Framer Motion offset array, default maps the whole
 *   container height.
 * @returns {{ ref: React.RefObject, scrollYProgress: import('framer-motion').MotionValue }}
 */
export function useSharedScroll(offset = ['start start', 'end end']) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset });
  return { ref, scrollYProgress };
}
