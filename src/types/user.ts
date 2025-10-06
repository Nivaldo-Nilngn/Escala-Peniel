// types/user.ts
export type UserRole = 'pastor' | 'lider' | 'membro';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  departmentIds: string[]; // IDs dos departamentos que o usuário participa
  photoURL?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  bio?: string;
  preferences: {
    notifications: boolean;
    emailReminders: boolean;
    smsReminders: boolean;
  };
}