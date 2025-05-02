export interface CommentDto {
  content: string;
  parentId?: string | number;
}

export interface Comment {
  id: number;
  content: string;
  user_id: number;
  post_id: number;
  parent_id?: number;
  created_at: string;
  updated_at: string;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    email: string;
    avatar?: string;
  };
  post?: {
    id: number;
    title: string;
    slug: string;
  };
}
