import Image from 'next/image';
import Link from 'next/link';
import styles from './header.module.scss';

export const Header = () => {
  return (
    <header className={styles.header}>
      <Link aria-label="Portfolio - ×××××× のトップページへ" href="/">
        <Image alt="××××××" height={22} src="/img/logo_black.svg" width={195} />
      </Link>
    </header>
  );
};
