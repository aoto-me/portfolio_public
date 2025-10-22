'use client';

import { useEffect } from 'react';

export const SaveIndex = ({ index }: { index: number }) => {
  useEffect(() => {
    sessionStorage.setItem('slideIndex', String(index));
  }, [index]);

  return <></>;
};
