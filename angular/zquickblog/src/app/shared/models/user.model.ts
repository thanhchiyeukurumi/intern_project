export interface User {
  id: number;          // Dựa trên JSON mẫu là number
  username: string;
  fullname: string;
  email: string;
  avatar: string | null; 
  description: string | null; 
  role_id: number;     
  role?: {             
    id: number;
    name: string;
  };
  data: any;
}
