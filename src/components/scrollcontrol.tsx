import { useEffect, type RefObject } from 'react';

interface ScrollControlProps {
  containerRef: RefObject<HTMLDivElement | null>;
  contentKey: number;
}

export default function ScrollControl({ containerRef, contentKey }: ScrollControlProps) {
  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [containerRef, contentKey]);

  return null;
}
