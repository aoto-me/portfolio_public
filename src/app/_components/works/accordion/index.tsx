'use client';

import { useRef } from 'react';
import styles from './accordion.module.scss';

interface AccordionProps {
  children: React.ReactNode;
  title: string;
}

export const Accordion = ({ children, title }: AccordionProps) => {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef(false);

  const animationTiming = { duration: 400, easing: 'ease-out' } as const;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const details = detailsRef.current;
    const content = contentRef.current;
    const icon = iconRef.current;
    if (!details || !content || !icon) return;
    if (animationRef.current) return;

    const isOpen = detailsRef.current?.open;

    if (isOpen) {
      // 閉じる
      animationRef.current = true;
      const closing = content.animate(
        [
          { height: `${content.offsetHeight}px`, opacity: 1 },
          { height: 0, opacity: 0 },
        ],
        animationTiming
      );
      icon.animate(
        [
          { marginTop: '3px', transform: 'rotate(225deg)' },
          { marginTop: '-3px', transform: 'rotate(45deg)' },
        ],
        {
          ...animationTiming,
          fill: 'forwards',
        }
      );
      closing.onfinish = () => {
        details.removeAttribute('open');
        animationRef.current = false;
      };
    } else {
      // 開く
      animationRef.current = true;
      details.setAttribute('open', '');
      const opening = content.animate(
        [
          { height: 0, opacity: 0 },
          { height: `${content.scrollHeight}px`, opacity: 1 },
        ],
        animationTiming
      );
      icon.animate(
        [
          { marginTop: '-3px', transform: 'rotate(45deg)' },
          { marginTop: '3px', transform: 'rotate(225deg)' },
        ],
        {
          ...animationTiming,
          fill: 'forwards',
        }
      );
      opening.onfinish = () => {
        content.style.height = 'auto';
        animationRef.current = false;
      };
    }
  };

  return (
    <details className={styles.details} ref={detailsRef}>
      <summary className={styles.details__summary} onClick={handleClick}>
        {title}
        <span aria-hidden="true" ref={iconRef}></span>
      </summary>
      <div className={styles.details__content} ref={contentRef}>
        <div>{children}</div>
      </div>
    </details>
  );
};
