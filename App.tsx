import React, { useState, useEffect } from 'react';
import { Project, ProjectType, ProjectStatus, Client, CalendarEvent, UserProfile } from './types';
import { api } from './services/api';
import Dashboard from './components/Dashboard';
import BriefingWizard from './components/BriefingWizard';
import ProjectDetails from './components/ProjectDetails';
import ProjectsList from './components/ProjectsList';
import ClientsList from './components/ClientsList';
import ClientHistory from './components/ClientHistory';
import MeiFormalization from './components/MeiFormalization';
import Agenda from './components/Agenda';
import Marketing from './components/Marketing';
import Profile from './components/Profile';
import Login from './components/Login';
import { generateProductionPlan } from './services/geminiService';
import { supabase, isConfigured } from './services/supabaseClient';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const [view, setView] = useState<'dashboard' | 'create' | 'briefing' | 'details' | 'projects-list' | 'clients-list' | 'client-history' | 'mei-formalization' | 'agenda' | 'marketing' | 'profile'>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedClientName, setSelectedClientName] = useState<string | null>(null);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [newProjectBase, setNewProjectBase] = useState<{ name: string, client: string, type: ProjectType, date: string, value: string, notes: string } | null>(null);

  // Auth & Session Check
  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
      })
      .catch((err) => {
        console.error('Supabase Auth-check error:', err);
      })
      .finally(() => {
        setLoadingSession(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoadingSession(false); // Ensure loading stops on change event too
    });

    return () => subscription.unsubscribe();
  }, []);

  // Data Persistence - Load from Supabase on session start
  useEffect(() => {
    if (session) {
      setIsLoading(true);

      // Load Projects
      api.getProjects()
        .then(setProjects)
        .catch(console.error);

      // Load Clients
      api.getClients()
        .then(setClients)
        .catch(console.error);

      // Load Events
      api.getEvents()
        .then(setEvents)
        .catch(console.error)
        .finally(() => setIsLoading(false));

      // Load Profile
      loadUserProfile(session.user.id);
    }
  }, [session]);

  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await api.getProfile(userId);
      setUserProfile(profile);
    } catch (error) {
      console.error("Failed to load profile", error);
    }
  };

  const navigate = (newView: typeof view) => {
    setView(newView);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleCreateBase = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setNewProjectBase({
      name: formData.get('name') as string,
      client: formData.get('client') as string,
      type: formData.get('type') as ProjectType,
      date: formData.get('date') as string,
      value: formData.get('value') as string,
      notes: formData.get('notes') as string,
    });
    navigate('briefing');
  };

  const handleBriefingComplete = async (answers: Record<string, string>) => {
    if (!newProjectBase) return;
    setIsLoading(true);
    // 1. AI Generation
    let plan;
    try {
      plan = await generateProductionPlan(newProjectBase.type, newProjectBase.client, newProjectBase.date, answers);
    } catch (error) {
      console.error("AI Error:", error);
      console.error("AI Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      alert(`Erro na Inteligência Artificial: ${errorMessage}`);
      setIsLoading(false);
      return;
    }

    // 2. Database Saving
    try {
      const newProject: Project = {
        id: crypto.randomUUID(),
        name: newProjectBase.name,
        client: newProjectBase.client,
        type: newProjectBase.type,
        deliveryDate: newProjectBase.date,
        value: parseFloat(newProjectBase.value) || 0,
        notes: newProjectBase.notes,
        status: ProjectStatus.PLANEJAMENTO,
        steps: plan.steps.map((s: any) => ({ ...s, completed: false })),
        checklist: plan.checklist.map((c: any) => ({ ...c, completed: false })),
        alerts: plan.alerts,
        createdAt: new Date().toISOString(),
      };

      await api.createProject(newProject);

      setProjects([...projects, newProject]);
      setSelectedProjectId(newProject.id);
      navigate('details');
    } catch (error) {
      console.error("Database Error:", error);
      console.error("Database Error:", error);
      const dbErrorMessage = JSON.stringify(error, null, 2);
      alert(`Erro no Banco de Dados: ${dbErrorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProject = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleAddClient = async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    try {
      const newClient = await api.createClient(clientData);
      setClients([...clients, newClient]);
    } catch (error) {
      console.error(error);
      alert("Erro ao criar cliente.");
    }
  };

  const handleAddEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    try {
      const newEvent = await api.createEvent(eventData);
      setEvents([...events, newEvent]);
    } catch (error) {
      console.error(error);
      alert("Erro ao criar evento.");
    }
  };

  const handleUpdateEvent = async (updatedEvent: CalendarEvent) => {
    try {
      await api.updateEvent(updatedEvent);
      setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar evento.");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await api.deleteEvent(id);
      setEvents(events.filter(e => e.id !== id));
    } catch (error) {
      console.error(error);
      alert("Erro ao remover evento.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleUpdateClient = async (updatedClient: Client) => {
    try {
      await api.updateClient(updatedClient);
      setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar cliente.");
    }
  };

  const navLinks = [
    { label: 'Dashboard', view: 'dashboard' as const, icon: 'fa-chart-line' },
    { label: 'Agenda', view: 'agenda' as const, icon: 'fa-calendar-days' },
    { label: 'Projetos', view: 'projects-list' as const, icon: 'fa-clapperboard' },
    { label: 'Clientes', view: 'clients-list' as const, icon: 'fa-users' },
    { label: 'MEI', view: 'mei-formalization' as const, icon: 'fa-id-card' },
    { label: 'Marketing', view: 'marketing' as const, icon: 'fa-bullhorn' },
  ];

  // 1. Check Configuration
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white p-8">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-black text-red-500 tracking-tight">Erro de Configuração</h1>
          <p className="text-slate-400">As variáveis de ambiente do Supabase não foram carregadas.</p>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left font-mono text-sm text-slate-400 shadow-xl">
            <p className="mb-2 font-bold text-white">Solução:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Verifique se o arquivo <span className="text-indigo-400">.env.local</span> existe na raiz.</li>
              <li>Reinicie o servidor de desenvolvimento:</li>
            </ol>
            <div className="mt-4 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
              <code className="text-emerald-400">CTRL + C</code><br />
              <code className="text-indigo-400">npm run dev</code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Loading Session
  if (loadingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 3. Not Logged In
  if (!session) {
    return <Login onLoginSuccess={() => { }} />;
  }

  // 4. Main App
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('dashboard')}>
              <img src="/foldr-logo.png" alt="Foldr" className="h-8 object-contain" />
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.view}
                  onClick={() => navigate(link.view)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view.startsWith(link.view.split('-')[0]) || (link.view === 'dashboard' && view === 'dashboard')
                    ? 'text-indigo-400 bg-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Removed "Sair" button from here */}

            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <i className="fa-solid fa-bars text-xl"></i>
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-800 cursor-pointer" onClick={() => navigate('profile')}>
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all">
                {userProfile?.avatarUrl ? (
                  <img src={userProfile.avatarUrl} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <i className="fa-solid fa-user"></i>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar (Slidebar) */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
              onClick={() => setIsMenuOpen(false)}
            ></div>

            {/* Sidebar Drawer */}
            <div className="relative w-64 bg-slate-950 border-l border-slate-800 h-full shadow-2xl p-6 overflow-y-auto animate-slideInRight">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-white tracking-tight">Menu</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white bg-slate-800/50 rounded-lg transition-colors"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="space-y-2">
                {navLinks.map((link) => (
                  <button
                    key={link.view}
                    onClick={() => navigate(link.view)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold transition-all ${view.startsWith(link.view.split('-')[0])
                      ? 'text-indigo-400 bg-indigo-500/10'
                      : 'text-slate-400 hover:bg-slate-900 active:bg-slate-800'
                      }`}
                  >
                    <i className={`fa-solid ${link.icon} w-5`}></i>
                    {link.label}
                  </button>
                ))}

                <div className="pt-6 mt-6 border-t border-slate-800">
                  <div
                    onClick={() => navigate('profile')}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-slate-900 transition-all mb-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs overflow-hidden">
                      {userProfile?.avatarUrl ? (
                        <img src={userProfile.avatarUrl} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <i className="fa-solid fa-user"></i>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-white truncate">{userProfile?.fullName || 'Meu Perfil'}</p>
                      <p className="text-xs text-slate-500 truncate">Editar informações</p>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <i className="fa-solid fa-right-from-bracket w-5"></i>
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav >

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[200] flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-slate-800 rounded-full"></div>
              <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-xl font-bold text-white tracking-tight">IA gerando plano de produção...</p>
              <p className="text-slate-500 text-sm">Organizando roteiro, equipamentos e prazos.</p>
            </div>
          </div>
        )}

        {view === 'dashboard' && (
          <Dashboard
            projects={projects}
            clients={clients}
            onSelectProject={(id) => { setSelectedProjectId(id); navigate('details'); }}
            onCreateProject={() => navigate('create')}
            onNavigateToProjects={() => navigate('projects-list')}
            onNavigateToClients={() => navigate('clients-list')}
          />
        )}

        {view === 'agenda' && (
          <Agenda
            events={events}
            projects={projects}
            onAddEvent={handleAddEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
            onBack={() => navigate('dashboard')}
          />
        )}

        {view === 'projects-list' && (
          <ProjectsList
            projects={projects}
            onSelectProject={(id) => { setSelectedProjectId(id); navigate('details'); }}
            onBack={() => navigate('dashboard')}
          />
        )}

        {view === 'clients-list' && (
          <ClientsList
            projects={projects}
            clients={clients}
            onBack={() => navigate('dashboard')}
            onSelectClient={(name) => { setSelectedClientName(name); navigate('client-history'); }}
            onAddClient={handleAddClient}
          />
        )}

        {view === 'client-history' && selectedClientName && (
          <ClientHistory
            clientName={selectedClientName}
            clients={clients}
            projects={projects}
            onBack={() => navigate('clients-list')}
            onSelectProject={(id) => { setSelectedProjectId(id); navigate('details'); }}
            onUpdateClient={handleUpdateClient}
          />
        )}

        {view === 'mei-formalization' && (
          <MeiFormalization onBack={() => navigate('dashboard')} />
        )}

        {view === 'marketing' && (
          <Marketing onBack={() => navigate('dashboard')} />
        )}

        {view === 'profile' && session && (
          <Profile
            session={session}
            onBack={() => navigate('dashboard')}
            onProfileUpdate={() => loadUserProfile(session.user.id)}
            onLogout={handleLogout}
          />
        )}

        {view === 'create' && (
          <div className="max-w-xl mx-auto animate-fadeIn">
            <div className="mb-8">
              <button onClick={() => navigate('dashboard')} className="text-slate-400 hover:text-white mb-4 flex items-center gap-2 font-medium">
                <i className="fa-solid fa-arrow-left text-xs"></i> Voltar ao Dashboard
              </button>
              <h1 className="text-4xl font-black text-white tracking-tight">Novo Projeto</h1>
              <p className="text-slate-400 text-lg">Inicie sua produção em segundos.</p>
            </div>
            <form onSubmit={handleCreateBase} className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50 space-y-6 shadow-2xl backdrop-blur-sm">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Nome do Projeto</label>
                <input required name="name" type="text" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700 text-white" placeholder="Ex: Clipe Musical - Artista X" />
              </div>
              <div className="space-y-2 relative">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest flex justify-between items-center">
                  Cliente
                  <button
                    type="button"
                    onClick={() => navigate('clients-list')}
                    className="text-indigo-400 text-xs hover:text-indigo-300 transition-colors"
                  >
                    + Novo Cliente
                  </button>
                </label>
                <div className="relative">
                  <input
                    required
                    name="client"
                    type="text"
                    autoComplete="off"
                    value={clientSearchTerm}
                    onChange={(e) => {
                      setClientSearchTerm(e.target.value);
                      setShowClientSuggestions(true);
                    }}
                    onFocus={() => setShowClientSuggestions(true)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700 text-white"
                    placeholder="Busque ou digite o nome do cliente"
                  />
                  {showClientSuggestions && clientSearchTerm && (
                    <div className="absolute z-10 left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                      {clients.filter(c => c.name.toLowerCase().includes(clientSearchTerm.toLowerCase())).length > 0 ? (
                        clients.filter(c => c.name.toLowerCase().includes(clientSearchTerm.toLowerCase())).map(client => (
                          <button
                            key={client.id}
                            type="button"
                            onClick={() => {
                              setClientSearchTerm(client.name);
                              setShowClientSuggestions(false);
                            }}
                            className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 transition-colors flex items-center justify-between group"
                          >
                            <span>{client.name}</span>
                            <i className="fa-solid fa-check text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-slate-500 text-sm italic">
                          Nenhum cliente encontrado
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Tipo</label>
                  <select name="type" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 focus:border-indigo-500 outline-none transition-all text-white">
                    <option value={ProjectType.VIDEO}>Vídeo</option>
                    <option value={ProjectType.FOTO}>Foto</option>
                    <option value={ProjectType.EVENTO}>Evento</option>
                    <option value={ProjectType.CONTEUDO}>Conteúdo Social</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Data de Entrega</label>
                  <input required name="date" type="date" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 focus:border-indigo-500 outline-none transition-all text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Valor (R$)</label>
                <input name="value" type="number" step="0.01" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700 text-white" placeholder="0,00" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Observações</label>
                <textarea name="notes" rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700 text-white" placeholder="Detalhes adicionais sobre o projeto..."></textarea>
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98]">
                PRÓXIMO: BRIEFING INTELIGENTE
              </button>
            </form>
          </div>
        )}

        {view === 'briefing' && newProjectBase && (
          <BriefingWizard projectType={newProjectBase.type} onCancel={() => navigate('create')} onComplete={handleBriefingComplete} />
        )}

        {view === 'details' && selectedProject && (
          <ProjectDetails project={selectedProject} onUpdateProject={updateProject} onClose={() => navigate('dashboard')} />
        )}
      </main>

      <footer className="mt-20 py-12 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 grayscale opacity-50">
            <div className="w-6 h-6 bg-slate-700 rounded flex items-center justify-center font-bold text-sm">F</div>
            <span className="text-sm font-bold tracking-tighter text-slate-400">FOLDR 2024</span>
          </div>
          <p className="text-slate-600 text-xs">Gestão Inteligente para Criativos do Audiovisual.</p>
        </div>
      </footer>
    </div >
  );
};
export default App;
