import { type WorksDef, type WorksList, type WorksListResponse } from '../_types';
import { client } from './microcms';

// 記事詳細を取得
export async function getPostById(id: string): Promise<WorksDef> {
  const data = await client.get<WorksDef>({
    endpoint: `works/${id}`,
  });
  return data;
}

// 記事一覧を取得
export async function getPosts(): Promise<WorksList[]> {
  const data = await client.get<WorksListResponse>({
    endpoint: 'works',
    queries: {
      fields: 'id,category,part,thumbnail,text,siteType,title,updatedAt',
    },
  });
  return data.contents;
}
