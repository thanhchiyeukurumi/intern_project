export interface User {
  id: string | number;
  username: string;
  email: string;
  roles?: string[];
  firstName?: string;
  lastName?: string;
  avatar?: string;
  description?: string;
  role?: {
    id: number;
    name: string;
  };
} 