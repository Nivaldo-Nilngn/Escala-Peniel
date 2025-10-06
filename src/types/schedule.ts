// types/schedule.ts
export interface MonthlyAgenda {
  id: string;
  month: number; // 1-12
  year: number;
  events: AgendaEvent[];
  isPublished: boolean;
  createdBy: string; // ID do pastor/admin
  createdAt: Date;
  updatedAt: Date;
}

export interface AgendaEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime: string; // "18:00"
  endTime?: string; // "20:00"
  type: ScheduleEventType;
  isRecurring: boolean;
  colorPalette?: ColorPalette;
  location?: string;
}

export type ScheduleEventType = 'culto' | 'conferencia' | 'reuniao_geral' | 'ensaio' | 'evento_especial';

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent?: string;
  description: string; // ex: "Branco e Azul"
}

export interface DepartmentSchedule {
  id: string;
  departmentId: string;
  departmentName?: string; // Nome do departamento para facilitar
  eventId: string; // referência ao evento da agenda
  eventTitle?: string; // Título do evento para facilitar
  eventDate?: Date; // Data do evento
  assignments: Assignment[];
  arrivalTime: string; // "17:40" - horário de chegada obrigatório
  eventStartTime: string; // "18:30" - horário de início do evento
  colorPalette?: ColorPalette;
  notes?: string;
  isPublished: boolean;
  createdBy: string; // ID do líder
  createdAt: Date;
  updatedAt: Date;
}

export interface Assignment {
  id: string;
  userId: string;
  userName?: string; // Nome do usuário para facilitar
  functionId: string; // ID da função no departamento
  functionName: string; // nome da função para facilitar
  isConfirmed: boolean;
  hasRequestedSubstitution: boolean;
  substitutionRequest?: SubstitutionRequest;
  notes?: string;
}

export interface SubstitutionRequest {
  id: string;
  originalUserId: string;
  requestedUserId?: string; // se específico
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string; // ID do líder que resolveu
}