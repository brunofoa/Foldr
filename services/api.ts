import { supabase } from './supabaseClient';
import { Database } from '../types/database.types';
import { Project, ProjectStatus, Client, CalendarEvent, UserProfile } from '../types';

// Map database row to app Project type
const mapProject = (row: any): Project => ({
    id: row.id,
    name: row.name,
    client: row.client ?? 'Sem Cliente',
    type: row.type as any,
    deliveryDate: row.delivery_date ?? '',
    status: (row.status as ProjectStatus) ?? ProjectStatus.BRIEFING,
    value: row.value ?? 0,
    notes: row.notes ?? '',
    steps: [], // Steps would need a separate fetch or join
    checklist: [],
    alerts: [],
    createdAt: row.created_at,
});

export const api = {
    getProjects: async () => {
        const { data, error } = await supabase
            .from('projects')
            .select(`
        *,
        production_steps (*),
        project_tasks (*),
        project_alerts (*)
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map((row: any) => ({
            ...mapProject(row),
            steps: row.production_steps?.map((s: any) => ({
                id: s.id,
                title: s.title,
                phase: s.phase,
                dueDate: s.due_date,
                completed: s.completed
            })) ?? [],
            checklist: row.project_tasks?.map((t: any) => ({
                id: t.id,
                title: t.title,
                category: t.category,
                completed: t.completed
            })) ?? [],
            alerts: row.project_alerts?.map((a: any) => ({
                id: a.id,
                message: a.message,
                type: a.type
            })) ?? []
        }));
    },

    createProject: async (project: Project) => {
        // 1. Insert Project
        const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .insert({
                id: project.id,
                user_id: (await supabase.auth.getUser()).data.user?.id!,
                name: project.name,
                client: project.client,
                type: project.type,
                delivery_date: project.deliveryDate,
                status: project.status,
                value: project.value,
                notes: project.notes
            })
            .select()
            .single();

        if (projectError) throw projectError;

        // 2. Insert Steps
        if (project.steps.length > 0) {
            const { error: stepsError } = await supabase
                .from('production_steps')
                .insert(project.steps.map(s => ({
                    project_id: project.id,
                    title: s.title,
                    // Normalize phase to allowed values or default to 'Produção'
                    phase: ['Pré', 'Produção', 'Pós'].includes(s.phase) ? s.phase : 'Produção',
                    due_date: s.dueDate,
                    completed: s.completed
                })));
            if (stepsError) throw stepsError;
        }

        // 3. Insert Tasks
        if (project.checklist.length > 0) {
            const { error: tasksError } = await supabase
                .from('project_tasks')
                .insert(project.checklist.map(t => ({
                    project_id: project.id,
                    title: t.title,
                    category: t.category,
                    completed: t.completed
                })));
            if (tasksError) throw tasksError;
        }

        // 4. Insert Alerts
        if (project.alerts.length > 0) {
            const { error: alertsError } = await supabase
                .from('project_alerts')
                .insert(project.alerts.map(a => ({
                    project_id: project.id,
                    message: a.message,
                    type: a.type
                })));
            if (alertsError) throw alertsError;
        }

        return projectData;
    },

    getClients: async () => {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        return data.map((row: any) => ({
            id: row.id,
            name: row.name,
            phone: row.phone ?? '',
            email: row.email ?? '',
            birthDate: row.birth_date ?? '',
            company: row.company ?? '',
            tags: row.tags ?? [],
            createdAt: row.created_at
        }));
    },

    createClient: async (client: Omit<Client, 'id' | 'createdAt'>) => {
        const { data, error } = await supabase
            .from('clients')
            .insert({
                user_id: (await supabase.auth.getUser()).data.user?.id!,
                name: client.name,
                phone: client.phone,
                email: client.email,
                birth_date: client.birthDate,
                company: client.company,
                tags: client.tags
            })
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            name: data.name,
            phone: data.phone ?? '',
            email: data.email ?? '',
            birthDate: data.birth_date ?? '',
            company: data.company ?? '',
            tags: data.tags ?? [],
            createdAt: data.created_at
        };
    },

    updateClient: async (client: Client) => {
        const { error } = await supabase
            .from('clients')
            .update({
                name: client.name,
                phone: client.phone,
                email: client.email,
                birth_date: client.birthDate,
                company: client.company,
                tags: client.tags
            })
            .eq('id', client.id);

        if (error) throw error;
    },

    getEvents: async () => {
        const { data, error } = await supabase
            .from('calendar_events')
            .select('*')
            .order('date', { ascending: true });

        if (error) throw error;

        return data.map((row: any) => ({
            id: row.id,
            title: row.title,
            date: row.date,
            time: row.time ?? '',
            description: row.description ?? '',
            projectId: row.project_id,
            type: row.type as any
        }));
    },

    createEvent: async (event: Omit<CalendarEvent, 'id'>) => {
        const { data, error } = await supabase
            .from('calendar_events')
            .insert({
                user_id: (await supabase.auth.getUser()).data.user?.id!,
                title: event.title,
                date: event.date,
                time: event.time,
                description: event.description,
                project_id: event.projectId || null,
                type: event.type
            })
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            title: data.title,
            date: data.date,
            time: data.time ?? '',
            description: data.description ?? '',
            projectId: data.project_id,
            type: data.type as any
        };
    },

    updateEvent: async (event: CalendarEvent) => {
        const { error } = await supabase
            .from('calendar_events')
            .update({
                title: event.title,
                date: event.date,
                time: event.time,
                description: event.description,
                project_id: event.projectId || null,
                type: event.type
            })
            .eq('id', event.id);

        if (error) throw error;
        return event;
    },

    deleteEvent: async (id: string) => {
        const { error } = await supabase
            .from('calendar_events')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    getDashboardStats: async () => {
        // Parallel fetching for performance
        const [projectsRes, clientsRes, alertsRes] = await Promise.all([
            supabase.from('projects').select('status', { count: 'exact', head: true }),
            supabase.from('clients').select('id', { count: 'exact', head: true }),
            supabase.from('project_alerts').select('id', { count: 'exact', head: true }).eq('type', 'critical')
        ]);

        const activeProjects = await supabase
            .from('projects')
            .select('status', { count: 'exact', head: true })
            .neq('status', ProjectStatus.CONCLUIDO);

        const completedProjects = await supabase
            .from('projects')
            .select('status', { count: 'exact', head: true })
            .eq('status', ProjectStatus.CONCLUIDO);

        return {
            activeProjects: activeProjects.count ?? 0,
            criticalAlerts: alertsRes.count ?? 0,
            totalClients: clientsRes.count ?? 0,
            completedProjects: completedProjects.count ?? 0
        };
    },

    updateProductionStep: async (id: string, completed: boolean) => {
        const { error } = await supabase
            .from('production_steps')
            .update({ completed })
            .eq('id', id);
        if (error) throw error;
    },

    updateProjectTask: async (id: string, completed: boolean) => {
        const { error } = await supabase
            .from('project_tasks')
            .update({ completed })
            .eq('id', id);
        if (error) throw error;
    },

    updateProjectStatus: async (id: string, status: ProjectStatus) => {
        const { error } = await supabase
            .from('projects')
            .update({ status })
            .eq('id', id);
        if (error) throw error;
    },

    getProfile: async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;

        return {
            id: data.id,
            email: data.email,
            fullName: data.full_name,
            avatarUrl: data.avatar_url,
            phone: data.phone,
            birthDate: data.birth_date,
            updatedAt: data.updated_at
        };
    },

    updateProfile: async (userId: string, profile: Partial<UserProfile>) => {
        const updates: any = {
            id: userId,
            updated_at: new Date().toISOString(),
        };
        if (profile.fullName) updates.full_name = profile.fullName;
        if (profile.avatarUrl) updates.avatar_url = profile.avatarUrl;
        if (profile.phone) updates.phone = profile.phone;
        if (profile.birthDate) updates.birth_date = profile.birthDate;

        const { error } = await supabase
            .from('profiles')
            .upsert(updates);

        if (error) throw error;
    }
};

