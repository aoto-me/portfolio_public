'use client';

import { useEffect, useRef } from 'react';
import './styles.scss';

interface MouseStalkerProps {
  ready: boolean;
}

const MouseStalker = ({ ready }: MouseStalkerProps) => {
  const stalkerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!stalkerRef.current) return;
    if (!ready) return;

    const stalker = stalkerRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      stalker.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };

    const handleMouseOver = () => {
      stalker.classList.add('is_active');
    };

    const handleMouseOut = () => {
      stalker.classList.remove('is_active');
    };

    document.addEventListener('mousemove', handleMouseMove);

    const linkElems = document.querySelectorAll<HTMLAnchorElement>('.swiper-slide a');

    for (const link of linkElems) {
      link.addEventListener('mouseover', handleMouseOver);
      link.addEventListener('mouseout', handleMouseOut);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      for (const link of linkElems) {
        link.removeEventListener('mouseover', handleMouseOver);
        link.removeEventListener('mouseout', handleMouseOut);
      }
    };
  }, [ready]);

  return (
    <div className="mouseStalker" ref={stalkerRef}>
      <span aria-hidden="true"></span>
    </div>
  );
};

export default MouseStalker;
