import { type MetadataRoute } from 'next';
import { getPosts } from './_libs';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = process.env.NEXT_PUBLIC_URL;
  const posts = await getPosts();

  const defaultPages: MetadataRoute.Sitemap = [
    {
      lastModified: new Date(),
      url: `${url}/`,
    },
  ];

  const worksPages: MetadataRoute.Sitemap = posts.map(post => ({
    lastModified: post.updatedAt,
    url: `${url}/works/${post.id}`,
  }));

  return [...defaultPages, ...worksPages];
}
