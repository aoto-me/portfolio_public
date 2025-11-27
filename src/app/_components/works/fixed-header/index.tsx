'use client';

import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './fixed-header.module.scss';

export const FixedHeader = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY > window.innerHeight + 200) {
        setShow(true);
      } else {
        setShow(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    handleScroll(); // 初期化

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return;

  return createPortal(
    <div aria-hidden={true} className={clsx(styles.fixedHeader, show && styles.is_show)}>
      <Link aria-label="Portfolio - ×××××× のトップページへ" href="/">
        <Image alt="××××××" height={22} src="/img/logo_black.svg" width={195} />
      </Link>
    </div>,
    document.body // body の直下にレンダリング
  );
};
