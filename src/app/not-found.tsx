import { type Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Frame, PageTransition } from './_components/common';
import styles from './not-found.module.scss';

export const metadata: Metadata = {
  description: 'お探しのページは存在しません。トップページへお戻りください。',
  title: 'ページが見つかりません',
};

export default function NotFound() {
  return (
    <PageTransition name="home-transition">
      <div className={`${styles.page} homeFadeIn page`}>
        <div className={`${styles.page__inner} page__inner`}>
          <header className={styles.header}>
            <Link href="/">
              <Image alt="Portfolio - ×××××× のトップページへ" height={54} src="/img/logo.svg" width={250} />
            </Link>
          </header>
          <main className={styles.main}>
            <Frame />
            <div className={styles.content}>
              <h1 className={styles.h1}>お探しのページが見つかりません</h1>
              <Link className={styles.button} href={'/'}>
                <span>TOPページへ</span>
              </Link>
            </div>
          </main>
          <footer className={styles.footer}>
            <small>© 2025 ××××××</small>
          </footer>
        </div>
      </div>
    </PageTransition>
  );
}
