// src/app/shared/models/user.model.ts (hoặc file tương ứng)

export interface User {
  id: number;          // Dựa trên JSON mẫu là number
  username: string;
  fullname: string;
  email: string;
  avatar: string | null; // Explicitly allow null if API sends null
  description: string | null; // Explicitly allow null if API sends null
  role_id: number;     // Thêm role_id dựa trên JSON mẫu
  role?: {             // `role` object có thể không có nếu API không include
    id: number;
    name: string;
  };
}
