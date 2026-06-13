import { useState, useEffect, useRef } from 'react';
export function useCountUp(end: number, duration = 2000, start = 0) {
  const [count, setCount] = useState(start);

  const countRef = useRef(start);

  const startTimeRef = useRef<number | null>(null);
  useEffect(() => {
    startTimeRef.current = null;
    countRef.current = start;
    const step = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min(
        (timestamp - startTimeRef.current) / duration,
        1,
      );

      const eased = 1 - Math.pow(1 - progress, 3);

      const current = Math.floor(start + (end - start) * eased);
      if (current !== countRef.current) {
        countRef.current = current;
        setCount(current);
      }
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

export function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);

  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
      },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return {
    ref,
    inView,
  };
}
