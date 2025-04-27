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
  categories?: {
    id: number;
    name: string;
  }[];
  user?: {
    id: number;
    username: string;
    email: string;
    avatar?: string;
  };
  language?: {
    id: number;
    name: string;
    locale: string;
  };
}
