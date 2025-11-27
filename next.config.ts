import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  images: {
    domains: ['images.microcms-assets.io'], // 画像のホスト名を追加
  },
  sassOptions: {
    prependData: `@use "@/app/_styles/variables" as *;`, // _variables.scss の読み込み
  },
};

export default nextConfig;
