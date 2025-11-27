'use client';

import clsx from 'clsx';
import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';
import styles from './loading.module.scss';

interface LoadingProps {
  children: React.ReactNode;
}

/**
 * ブラウザのアスペクト比をもとに正規化（0=スマホ, 1=PC）
 */
const aspectT = (): number => {
  const aspect = window.innerWidth / window.innerHeight;
  const pcAspect = 16 / 9; // 横長
  const spAspect = 9 / 16; // 縦長
  return Math.min(1, Math.max(0, (aspect - spAspect) / (pcAspect - spAspect)));
};

/**
 * 線形補間
 * a = 開始値（t=0 のときの値）
 * b = 終了値（t=1 のときの値）
 * t = 進捗度（0〜1の範囲）
 */
const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t;
};

// PathA
const makePathA = (): string => {
  const t = aspectT();
  const yControl = lerp(15, 12, t); // スマホ15 → PC12
  const xMid = 15;

  return `M 0 0 L 0 18 C 0 18 4 ${yControl} ${xMid} ${yControl} C 26 ${yControl} 30 18 30 18 L 30 0`;
};

// PathB
const makePathB = (): string => {
  const t = aspectT();
  const yL = lerp(14, 12, t); // Lの高さ（スマホ14 → PC12）
  const yCurve = lerp(10, 2, t); // カーブの高さ（スマホ10 → PC2）
  const xMid = 15;

  return `M 0 0 L 0 ${yL} C 0 ${yL} 4 ${yCurve} ${xMid} ${yCurve} C 26 ${yCurve} 30 ${yL} 30 ${yL} L 30 0`;
};

export const Loading = ({ children }: LoadingProps) => {
  const pathRef = useRef<null | SVGPathElement>(null);
  const [show, setShow] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const pathAnime = () => {
      const pathA = makePathA(); // 中間1
      const pathB = makePathB(); // 中間2
      const pathC = 'M 0 0 L 0 0 C 0 0 4 0 15 0 C 26 0 30 0 30 0 L 30 0'; // 終了

      if (pathRef.current) {
        gsap.to(pathRef.current, {
          keyframes: [
            { attr: { d: pathA }, delay: 2.75, duration: 0.5, ease: 'power2.in' },
            { attr: { d: pathB }, duration: 0.2 },
            { attr: { d: pathC }, duration: 0.6, ease: 'power2.out' },
          ],
        });
      }
    };

    if ('requestIdleCallback' in globalThis) {
      globalThis.requestIdleCallback(() => {
        setShow(true);
        pathAnime();
        setTimeout(() => {
          setHidden(true);
        }, 5000);
      });
    } else {
      // fallback
      setTimeout(() => {
        setShow(true);
        pathAnime();
        setTimeout(() => {
          setHidden(true);
        }, 5000);
      }, 1000);
    }
  }, []);

  return (
    <>
      <div className={clsx(styles.loading, hidden && styles.is_hidden)}>
        <span className={clsx(styles.loading__text, show && styles.is_show)}>Thank you for visiting!</span>
      </div>
      <div className={clsx(styles.clipSvg, hidden && styles.is_hidden)}>
        <svg fill="none" height="16" viewBox="0 0 30 16" width="30">
          <clipPath clipPathUnits="objectBoundingBox" id="clipOpening">
            <path
              d="M 0 0 L 0 18 C 0 18 4 18 15 18 C 26 18 30 18 30 18 L 30 0"
              ref={pathRef}
              transform="scale(0.0333,0.0555)"
            />
          </clipPath>
        </svg>
      </div>
      <div className={clsx('pageOuter', show && 'is_show')}>{children}</div>
    </>
  );
};
