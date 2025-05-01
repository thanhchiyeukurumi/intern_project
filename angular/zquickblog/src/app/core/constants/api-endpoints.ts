/**
 * Constants cho các đường dẫn API của ứng dụng
 * Dựa trên các routes được định nghĩa trong backend/routes/api.js
 */

const API_BASE = 'http://localhost:3000';

// Đường dẫn API cho xác thực
export const AUTH_API = {
  BASE: `${API_BASE}/auth`,
  REGISTER: `${API_BASE}/auth/register`,
  LOGIN: `${API_BASE}/auth/login`,
  REFRESH_TOKEN: `${API_BASE}/auth/refresh-token`,
  LOGOUT: `${API_BASE}/auth/logout`,
  ME: `${API_BASE}/auth/me`,
  VERIFY_TOKEN: `${API_BASE}/auth/verify-token`,
  GOOGLE: `${API_BASE}/auth/google`,
  GOOGLE_CALLBACK: `${API_BASE}/auth/google/callback`,
};

// Đường dẫn API cho ngôn ngữ
export const LANGUAGE_API = {
  BASE: `${API_BASE}/languages`,
  GET_BY_ID: (id: string | number) => `${API_BASE}/languages/${id}`,
};

// Đường dẫn API cho danh mục
export const CATEGORY_API = {
  BASE: `${API_BASE}/categories`,
  GET_BY_ID: (id: string | number) => `${API_BASE}/categories/${id}`,
};

// Đường dẫn API cho người dùng
export const USER_API = {
  BASE: `${API_BASE}/user`,
  GET_BY_ID: (id: string | number) => `${API_BASE}/user/${id}`,
  GET_COMMENTS_BY_USER: (userId: string | number) => `${API_BASE}/user/${userId}/comments`,
};

// Đường dẫn API cho bài viết
export const POST_API = {
  BASE: `${API_BASE}/posts`,
  SEARCH: `${API_BASE}/posts/search`,
  GET_BY_CATEGORY: (categoryId: string | number) => `${API_BASE}/posts/category/${categoryId}`,
  GET_BY_USER: (userId: string | number) => `${API_BASE}/posts/user/${userId}`,
  GET_BY_ID: (id: string | number) => `${API_BASE}/posts/${id}`,
  GET_ME: `${API_BASE}/posts/me`,
  GET_COMMENTS: (postId: string | number) => `${API_BASE}/posts/${postId}/comments`,
  ADD_COMMENT: (postId: string | number) => `${API_BASE}/posts/${postId}/comments`,
  GET_FROM_ORIGINAL: (originalPostId: number | string) => `${API_BASE}/posts/original/${originalPostId}`,
};

// Đường dẫn API cho bình luận
export const COMMENT_API = {
  BASE: `${API_BASE}/comments`,
  GET_BY_ID: (id: string | number) => `${API_BASE}/comments/${id}`,
  UPDATE: (id: string | number) => `${API_BASE}/comments/${id}`,
  DELETE: (id: string | number) => `${API_BASE}/comments/${id}`,
  GET_ME: `${API_BASE}/comments/me`,
};

// Đường dẫn API cho tải lên tệp
export const UPLOAD_API = {
  BASE: `${API_BASE}/uploads`,
  UPLOAD_IMAGE: `${API_BASE}/uploads/image`,
  UPLOAD_IMAGES: `${API_BASE}/uploads/images`,
  UPLOAD_EDITOR: `${API_BASE}/uploads/editor`,
  DELETE_FILE: (publicId: string) => `${API_BASE}/uploads/${publicId}`,
};

// Nhóm tất cả các API vào một đối tượng
export const API_ENDPOINTS = {
  AUTH: AUTH_API,
  LANGUAGE: LANGUAGE_API,
  CATEGORY: CATEGORY_API,
  USER: USER_API,
  POST: POST_API,
  COMMENT: COMMENT_API,
  UPLOAD: UPLOAD_API,
  BASE: API_BASE,
};

// Interface cho các tham số khi gọi API
export interface AuthRegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface AuthLoginDto {
  email: string;
  password: string;
}

export interface CreateCommentDto {
  content: string;
  parentId?: string | number;
}

export interface UpdateCommentDto {
  content: string;
}

export interface CreatePostDto {
  title: string;
  content: string;
  slug?: string;
  excerpt?: string;
  categoryId: string | number;
  tags?: string[];
  status?: string;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  slug?: string;
  excerpt?: string;
  categoryId?: string | number;
  tags?: string[];
  status?: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  slug?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  slug?: string;
}

export interface PostSearchParams {
  query?: string;
  category?: string | number;
  tags?: string[];
  author?: string | number;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
