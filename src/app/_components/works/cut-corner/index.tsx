'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './cut-corner.module.scss';

interface CutCornerProps {
  children: React.ReactNode;
}

export const CutCorner = ({ children }: CutCornerProps) => {
  const [cutCornerSize, setCutCornerSize] = useState({
    height: 0,
    width: 0,
  });
  const cutCornerRef = useRef<HTMLDivElement | null>(null);

  const updateSize = useCallback(() => {
    if (!cutCornerRef.current) return;
    const { height, width } = cutCornerRef.current.getBoundingClientRect();
    setCutCornerSize({
      height: Math.ceil(height),
      width: Math.ceil(width),
    });
  }, []);

  useEffect(() => {
    if (!cutCornerRef.current) return;
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(cutCornerRef.current);
    return () => observer.disconnect();
  }, [updateSize]);

  const d = useMemo(() => {
    const cut = 26;
    const cutInner = 22;
    const offset = 6;

    return {
      fill: `
      M ${cutInner + offset},${0 + offset}
      H ${cutCornerSize.width - cutInner - offset}
      L ${cutCornerSize.width - offset},${cutInner + offset}
      V ${cutCornerSize.height - cutInner - offset}
      L ${cutCornerSize.width - cutInner - offset},${cutCornerSize.height - offset}
      H ${cutInner + offset}
      L ${0 + offset},${cutCornerSize.height - cutInner - offset}
      V ${cutInner + offset}
      Z
    `,
      stroke: `
      M ${cut},0
      H ${cutCornerSize.width - cut}
      L ${cutCornerSize.width},${cut}
      V ${cutCornerSize.height - cut}
      L ${cutCornerSize.width - cut},${cutCornerSize.height}
      H ${cut}
      L 0,${cutCornerSize.height - cut}
      V ${cut}
      Z
    `,
    };
  }, [cutCornerSize]);

  return (
    <div className={styles.cutCorner} ref={cutCornerRef}>
      <div className={styles.cutCorner__content}>{children}</div>
      <svg
        height={cutCornerSize.height}
        viewBox={`0 0 ${cutCornerSize.width} ${cutCornerSize.height}`}
        width={cutCornerSize.width}
      >
        <g>
          <path d={d.stroke} fill="none" stroke="#333" strokeWidth="1" />
          <path d={d.fill} fill="#fff" stroke="#333" strokeWidth="0.5" />
        </g>
      </svg>
    </div>
  );
};
