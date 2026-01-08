export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            clients: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    phone: string | null
                    email: string | null
                    birth_date: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string
                    name: string
                    phone?: string | null
                    email?: string | null
                    birth_date?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    phone?: string | null
                    email?: string | null
                    birth_date?: string | null
                    created_at?: string
                }
            }
            projects: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    client: string | null
                    type: 'Evento' | 'Vídeo' | 'Foto' | 'Conteúdo Social' | null
                    delivery_date: string | null
                    status: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string
                    name: string
                    client?: string | null
                    type?: 'Evento' | 'Vídeo' | 'Foto' | 'Conteúdo Social' | null
                    delivery_date?: string | null
                    status?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    client?: string | null
                    type?: 'Evento' | 'Vídeo' | 'Foto' | 'Conteúdo Social' | null
                    delivery_date?: string | null
                    status?: string | null
                    created_at?: string
                }
            }
            production_steps: {
                Row: {
                    id: string
                    project_id: string
                    title: string
                    phase: 'Pré' | 'Produção' | 'Pós' | null
                    due_date: string | null
                    completed: boolean | null
                }
                Insert: {
                    id?: string
                    project_id: string
                    title: string
                    phase?: 'Pré' | 'Produção' | 'Pós' | null
                    due_date?: string | null
                    completed?: boolean | null
                }
                Update: {
                    id?: string
                    project_id?: string
                    title?: string
                    phase?: 'Pré' | 'Produção' | 'Pós' | null
                    due_date?: string | null
                    completed?: boolean | null
                }
            }
            project_tasks: {
                Row: {
                    id: string
                    project_id: string
                    title: string
                    category: string | null
                    completed: boolean | null
                }
                Insert: {
                    id?: string
                    project_id: string
                    title: string
                    category?: string | null
                    completed?: boolean | null
                }
                Update: {
                    id?: string
                    project_id?: string
                    title?: string
                    category?: string | null
                    completed?: boolean | null
                }
            }
            project_alerts: {
                Row: {
                    id: string
                    project_id: string
                    message: string
                    type: 'warning' | 'info' | 'critical' | null
                }
                Insert: {
                    id?: string
                    project_id: string
                    message: string
                    type?: 'warning' | 'info' | 'critical' | null
                }
                Update: {
                    id?: string
                    project_id?: string
                    message?: string
                    type?: 'warning' | 'info' | 'critical' | null
                }
            }
            calendar_events: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    date: string
                    time: string | null
                    description: string | null
                    project_id: string | null
                    type: string | null
                }
                Insert: {
                    id?: string
                    user_id?: string
                    title: string
                    date: string
                    time?: string | null
                    description?: string | null
                    project_id?: string | null
                    type?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    date?: string
                    time?: string | null
                    description?: string | null
                    project_id?: string | null
                    type?: string | null
                }
            }
        }
    }
}
