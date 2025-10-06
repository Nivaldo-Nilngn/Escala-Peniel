// types/music.ts
export interface MusicReference {
  letra?: string;
  cifra?: string;
  audio?: string;
  video?: string;
}

export interface Music {
  id: string;
  titulo: string;
  artista: string;
  album?: string;
  tom?: string;
  duracao?: string;
  bpm?: number;
  categoria: 'Louvor' | 'Adoração' | 'Congregacional' | 'Especial' | 'Instrumental';
  coverImage?: string;
  referencias: MusicReference;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  departmentId?: string;
  tags?: string[];
  letra?: string; // Letra completa da música
  observacoes?: string;
}
