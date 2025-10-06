export interface HistoryItem {
  id: string;
  title: string;
  artist?: string;
  duration: string;
  date: string;
  url?: string;
  videoUrl?: string;
  audioUrl?: string;
  type: 'music' | 'video' | 'audio';
  userId: string;
  createdAt: Date;
}

export interface CreateHistoryItem {
  title: string;
  artist?: string;
  duration: string;
  url?: string;
  videoUrl?: string;
  audioUrl?: string;
  type: 'music' | 'video' | 'audio';
  userId: string;
}