import Image from 'next/image';
import { type ItemList, type ListItem, type WithContext } from 'schema-dts';
import { Frame, PageTransition } from './_components/common';
import { SwiperWrapper } from './_components/home';
import { getPosts } from './_libs';
export const dynamic = 'force-static';
import styles from './page.module.scss';

export default async function Home() {
  const worksList = await getPosts();
  const url = process.env.NEXT_PUBLIC_URL;

  const itemListElement: ListItem[] = worksList.map((work, index) => ({
    '@type': 'ListItem',
    name: work.title,
    position: index + 1,
    url: `${url}/works/${work.id}`,
  }));

  const jsonLd: WithContext<ItemList> = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    description: '××××××のポートフォリオサイトです。',
    image: `${url}/ogp.jpg`,
    itemListElement,
    name: 'Portfolio - ××××××',
  };

  return (
    <PageTransition name="home-transition">
      <div className={`${styles.page} homeFadeIn page`}>
        <div className={`${styles.page__inner} page__inner`}>
          <header className={styles.header}>
            <h1>
              <Image alt="Portfolio - ××××××" height={54} loading={'eager'} src="/img/logo.svg" width={250} />
            </h1>
          </header>
          <main className={styles.main}>
            <Frame />
            <Image alt="" className={styles.portfolio} height={39} src={'/img/portfolio.svg'} width={230} />
            <SwiperWrapper worksList={worksList} />
          </main>
          <footer className={styles.footer}>
            <small>© 2025 ××××××</small>
          </footer>
        </div>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replaceAll('<', String.raw`\u003c`),
        }}
        type="application/ld+json"
      />
    </PageTransition>
  );
}
