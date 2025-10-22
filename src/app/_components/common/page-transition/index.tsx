'use client';

import { unstable_ViewTransition as ViewTransition } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  name: string;
}

export const PageTransition = ({ children, name }: PageTransitionProps) => {
  return (
    <ViewTransition name={name} share="none" update="none">
      {children}
    </ViewTransition>
  );
};
