// types/message.ts
export interface PastorMessage {
  id: string;
  title: string;
  content: string;
  senderId: string; // ID do pastor
  targetType: 'all' | 'department' | 'event' | 'specific';
  targetIds?: string[]; // IDs dos destinatários específicos ou departamentos
  eventId?: string; // se for mensagem relacionada a um evento
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: { [userId: string]: boolean }; // controle de leitura por usuário
  sentAt: Date;
  scheduledFor?: Date; // para mensagens agendadas
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  chatId: string; // ID do chat (departamento ou geral)
  replyTo?: string; // ID da mensagem sendo respondida
  attachments?: MessageAttachment[];
  sentAt: Date;
  editedAt?: Date;
  isDeleted: boolean;
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'audio' | 'video';
  size: number;
}

export interface Chat {
  id: string;
  name: string;
  type: 'department' | 'general';
  departmentId?: string; // se for chat de departamento
  participants: string[]; // IDs dos participantes
  lastMessage?: ChatMessage;
  isActive: boolean;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: { [key: string]: any }; // dados extras para ação
  isRead: boolean;
  sentAt: Date;
  expiresAt?: Date;
}

export type NotificationType = 
  | 'schedule_published' 
  | 'schedule_reminder' 
  | 'substitution_request' 
  | 'substitution_approved' 
  | 'meeting_reminder' 
  | 'pastor_message' 
  | 'system_update';