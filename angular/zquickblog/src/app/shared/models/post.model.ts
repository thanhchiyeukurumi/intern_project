export interface PostDto {
  title: string;
  content: any;
  slug?: string;
  excerpt?: string;
  categories: (string | number)[];
  language_id?: number;
  status?: string;
  views: number;
  original_post_id: number | null;
  expand: boolean;
  translations?: Post[]; 
  originalPost?: Post; 
  description?: string; 
  user_id: number; // Include user_id
}

export interface Post {
  id: number;
  title: string;
  content: any;
  slug: string;
  excerpt?: string;
  user_id: number;
  language_id: number;
  status: string;
  views: number;
  original_post_id: number | null;
  expand: boolean ;
  translations?: Post[]; 
  originalPost?: Post; 
  description?: string; 
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

// Interface mới cho trạng thái hiển thị, kế thừa từ Post model của bạn
export interface PostForDisplay extends Post {
  loadingTranslations: boolean; // Chỉ thêm cờ này
}