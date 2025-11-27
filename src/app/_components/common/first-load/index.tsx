'use client';

import { useEffect } from 'react';

export const FirstLoad = () => {
  useEffect(() => {
    sessionStorage.removeItem('slideIndex');
  }, []);

  useEffect(() => {
    const links = [
      { href: 'https://fonts.googleapis.com', rel: 'preconnect' },
      { crossOrigin: '', href: 'https://fonts.gstatic.com', rel: 'preconnect' },
      {
        href: 'https://fonts.googleapis.com/css2?family=Bona+Nova+SC&family=Zen+Old+Mincho:wght@400;500;700&display=swap',
        rel: 'stylesheet',
      },
    ];

    const setLink = () => {
      for (const attrs of links) {
        const link = document.createElement('link');
        for (const [key, value] of Object.entries(attrs)) {
          if (value !== undefined) link.setAttribute(key, value as string);
        }
        document.head.append(link);
      }
    };

    if ('requestIdleCallback' in globalThis) {
      globalThis.requestIdleCallback(() => setLink());
    } else {
      // fallback
      setTimeout(() => setLink(), 1000);
    }
  }, []);

  return <></>;
};
