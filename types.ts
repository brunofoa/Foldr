
export enum ProjectType {
  EVENTO = 'Evento',
  VIDEO = 'Vídeo',
  FOTO = 'Foto',
  CONTEUDO = 'Conteúdo Social'
}

export enum ProjectStatus {
  BRIEFING = 'Briefing',
  PLANEJAMENTO = 'Planejamento',
  EM_ANDAMENTO = 'Em Andamento',
  CONCLUIDO = 'Concluído'
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: 'Equipamento' | 'Captação' | 'Backup' | 'Edição' | 'Entrega';
}

export interface ProductionStep {
  id: string;
  title: string;
  phase: 'Pré' | 'Produção' | 'Pós';
  dueDate: string;
  completed: boolean;
}

export interface Alert {
  id: string;
  message: string;
  type: 'warning' | 'info' | 'critical';
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  birthDate: string;
  company?: string;
  tags?: string[];
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO string YYYY-MM-DD
  time: string;
  description: string;
  projectId?: string;
  type: 'shoot' | 'meeting' | 'deadline' | 'other';
}

export interface Project {
  id: string;
  name: string;
  client: string;
  type: ProjectType;
  deliveryDate: string;
  status: ProjectStatus;
  value?: number;
  notes?: string;
  steps: ProductionStep[];
  checklist: Task[];
  alerts: Alert[];
  createdAt: string;
}

export interface BriefingQuestion {
  id: string;
  question: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
}

export interface UserProfile {
  id: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  phone?: string;
  birthDate?: string;
  updatedAt?: string;
}
