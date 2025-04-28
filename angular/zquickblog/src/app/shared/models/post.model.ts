export interface PostDto {
  title: string;
  content: string;
  slug?: string;
  excerpt?: string;
  categories: (string | number)[];
  language_id?: number;
  status?: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  slug: string;
  excerpt?: string;
  user_id: number;
  language_id: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  Categories?: {
    id: number;
    name: string;
  }[];
  User?: {
    id: number;
    username: string;
    email: string;
    avatar?: string;
  };
  Language?: {
    id: number;
    name: string;
    locale: string;
  };
}
