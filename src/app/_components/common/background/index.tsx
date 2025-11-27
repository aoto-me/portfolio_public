'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import styles from './background.module.scss';

const WebGl = dynamic(() => import('./web-gl'), { ssr: false });

export const Background = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if ('requestIdleCallback' in globalThis) {
      globalThis.requestIdleCallback(() => {
        setTimeout(() => setShow(true), 4000);
      });
    } else {
      // fallback
      setTimeout(() => setShow(true), 5000);
    }
  }, []);

  return (
    <div className={styles.bg}>
      {show && <WebGl />}
      <div className={styles.bg__noise}></div>
      <div className={styles.bg__shadow}></div>
    </div>
  );
};
