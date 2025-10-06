// types/department.ts
export type DepartmentType = 'louvor' | 'diaconato' | 'midia' | 'criancas' | 'limpeza' | 'dizimos' | 'ministracao';

export interface Department {
  id: string;
  name: string;
  type: DepartmentType;
  description?: string;
  leaderId: string; // ID do líder do departamento
  members: string[]; // IDs dos membros
  color: string; // Cor padrão do departamento
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DepartmentFunction {
  id: string;
  departmentId: string;
  name: string; // ex: "Vocalista", "Guitarrista", "Porta", "Computador"
  description?: string;
  maxMembers?: number; // limite de pessoas para esta função
  isRequired: boolean; // se é obrigatório ter alguém nesta função
}

// Funções específicas por departamento
export interface LouvorcDepartment extends Department {
  type: 'louvor';
  songs: Song[];
}

export interface Song {
  id: string;
  title: string;
  artist?: string;
  lyrics?: string;
  chords?: string;
  videoUrl?: string;
  key?: string; // tom da música
  tempo?: string;
}