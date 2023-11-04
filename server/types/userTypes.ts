export interface UserData {
  name: string;
  email: string;
  profilePictureUrl: string;
}

export interface User {
  name: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  createdAt: Date;
  updatedAt: Date;
  profilePictureUrl?: string;
}