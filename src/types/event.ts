// types/event.ts
export interface Event {
  id: string;
  title: string;
  type: EventType;
  date: Date;
  time: string;
  description?: string;
  month: number; // 1-12
  year: number;
  color?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export type EventType = 
  | 'culto_celebracao'
  | 'santa_ceia'
  | 'culto_jp'
  | 'conferencia'
  | 'esquenta'
  | 'ensaio'
  | 'reuniao'
  | 'outro';

export interface EventTypeInfo {
  label: string;
  color: string;
  icon?: string;
}

export const EVENT_TYPES: Record<EventType, EventTypeInfo> = {
  culto_celebracao: {
    label: 'Culto de Celebração',
    color: '#1976d2',
  },
  santa_ceia: {
    label: 'Santa Ceia',
    color: '#7b1fa2',
  },
  culto_jp: {
    label: 'Culto de Celebração JP',
    color: '#0288d1',
  },
  conferencia: {
    label: 'Conferência',
    color: '#d32f2f',
  },
  esquenta: {
    label: 'Esquenta',
    color: '#f57c00',
  },
  ensaio: {
    label: 'Ensaio',
    color: '#388e3c',
  },
  reuniao: {
    label: 'Reunião',
    color: '#455a64',
  },
  outro: {
    label: 'Outro',
    color: '#616161',
  },
};
