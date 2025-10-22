export interface Detail {
  heading: string;
  images: Image[];
  text: string;
}

export interface Image {
  alt: string;
  height: number;
  url: string;
  width: number;
}

export interface WorksDef {
  category: string[];
  cms: string[];
  db: string[];
  detail: Detail[];
  frontImage: Image;
  github?: string;
  id: string;
  language: string[];
  part: string[];
  problem: string;
  siteImage: Image[];
  siteType: string;
  solution: string;
  sort: number;
  text: string;
  thumbnail: Image;
  title: string;
  tool: string[];
  updatedAt: string;
  url: string;
  year: string;
}

export interface WorksList {
  category: string[];
  id: string;
  part: string[];
  siteType: string;
  text: string;
  thumbnail: Image;
  title: string;
  updatedAt: string;
}

export interface WorksListResponse {
  contents: WorksList[];
  limit: number;
  offset: number;
  totalCount: number;
}
