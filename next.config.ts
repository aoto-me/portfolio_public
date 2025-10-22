import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV !== 'production',
  },
  experimental: {
    viewTransition: true,
  },
  images: {
    domains: ['images.microcms-assets.io'], // 画像のホスト名を追加
  },
  sassOptions: {
    includePaths: ['./src/app/_styles'], // _variables.scss がある場所
    prependData: `@use "variables" as *;`, // 毎回自動で読み込む（オプション）
  },
};

export default nextConfig;
