import type { Metadata } from 'next';
import Script from 'next/script';
import { Background, FirstLoad, Loading } from './_components/common';
import './globals.scss';

export function generateMetadata(): Metadata {
  const url = process.env.NEXT_PUBLIC_URL;

  return {
    alternates: { canonical: `${url}/` },
    description: '××××××のポートフォリオサイトです。',
    openGraph: {
      description: '××××××のポートフォリオサイトです。',
      images: ['/ogp.jpg'],
      locale: 'ja_JP',
      siteName: 'Portfolio - ××××××',
      title: 'Portfolio - ××××××',
      type: 'website',
      url: `${url}/`,
    },
    robots: {
      follow: false,
      index: false,
    },
    title: {
      default: 'Portfolio - ××××××',
      template: '%s | Portfolio - ××××××',
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html dir="ltr" lang="ja" prefix="og: https://ogp.me/ns#">
      <body>
        <FirstLoad />
        <Background />
        <Loading>{children}</Loading>
      </body>
      {gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="lazyOnload" />
          <Script id="google-analytics" strategy="lazyOnload">
            {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
            `}
          </Script>
        </>
      )}
    </html>
  );
}
