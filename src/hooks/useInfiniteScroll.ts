import { useEffect, useRef } from "react";

const useInfiniteScroll = (callback: () => void, canLoad: boolean) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!canLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      { threshold: 1 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [callback, canLoad]);

  return ref;
};

export default useInfiniteScroll;
