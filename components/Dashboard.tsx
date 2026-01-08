
import React from 'react';
import { Project, ProjectStatus, Client } from '../types';

interface DashboardProps {
  projects: Project[];
  clients: Client[];
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  onNavigateToProjects: () => void;
  onNavigateToClients: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  projects,
  clients,
  onSelectProject,
  onCreateProject,
  onNavigateToProjects,
  onNavigateToClients
}) => {
  const activeProjects = projects.filter(p => p.status !== ProjectStatus.CONCLUIDO);
  const criticalAlerts = projects.flatMap(p => p.alerts).filter(a => a.type === 'critical');
  const clientsCount = clients.length;

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400 text-lg">Bem-vindo ao comando da sua produção.</p>
        </div>
        <button
          onClick={onCreateProject}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2 active:scale-95"
        >
          <i className="fa-solid fa-plus"></i>
          Novo Projeto
        </button>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          onClick={onNavigateToProjects}
          className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-sm cursor-pointer hover:border-indigo-500 transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <i className="fa-solid fa-clapperboard"></i>
            </div>
            <i className="fa-solid fa-arrow-up-right-from-square text-xs text-slate-600 group-hover:text-indigo-400"></i>
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Projetos Ativos</h3>
          <p className="text-4xl font-black text-white">{activeProjects.length}</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4">
            <i className="fa-solid fa-clock"></i>
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Alertas Críticos</h3>
          <p className="text-4xl font-black text-amber-500">{criticalAlerts.length}</p>
        </div>

        <div
          onClick={onNavigateToClients}
          className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-sm cursor-pointer hover:border-emerald-500 transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <i className="fa-solid fa-users"></i>
            </div>
            <i className="fa-solid fa-arrow-up-right-from-square text-xs text-slate-600 group-hover:text-emerald-400"></i>
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Clientes</h3>
          <p className="text-4xl font-black text-white">{clientsCount}</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Concluídos</h3>
          <p className="text-4xl font-black text-slate-300">{projects.filter(p => p.status === ProjectStatus.CONCLUIDO).length}</p>
        </div>
      </section>

      {criticalAlerts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-black flex items-center gap-3 text-white">
            <span className="w-2 h-8 bg-amber-500 rounded-full"></span>
            Atenção Necessária
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {criticalAlerts.slice(0, 4).map(alert => (
              <div key={alert.id} className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl flex items-start gap-4 hover:bg-amber-500/10 transition-colors">
                <i className="fa-solid fa-circle-exclamation text-amber-500 mt-1 text-lg"></i>
                <p className="text-amber-100 text-sm font-semibold leading-relaxed">{alert.message}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-black text-white tracking-tight">Em Produção</h2>
          <button
            onClick={onNavigateToProjects}
            className="text-indigo-400 text-sm font-bold hover:text-indigo-300 transition-colors"
          >
            Ver todos <i className="fa-solid fa-arrow-right ml-1"></i>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeProjects.slice(0, 6).map(project => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className="group bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 hover:border-indigo-500 transition-all cursor-pointer shadow-xl relative overflow-hidden backdrop-blur-sm"
            >
              <div className="absolute top-0 right-0 w-1.5 bg-indigo-600 h-0 group-hover:h-full transition-all duration-300"></div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors line-clamp-1">{project.name}</h3>
                  <p className="text-slate-500 text-sm font-medium">{project.client}</p>
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${project.status === ProjectStatus.PLANEJAMENTO ? 'bg-blue-500/10 text-blue-400' :
                  project.status === ProjectStatus.EM_ANDAMENTO ? 'bg-amber-500/10 text-amber-400' :
                    'bg-slate-700/20 text-slate-500'
                  }`}>
                  {project.status}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-600">
                  <span>Entrega</span>
                  <span className="text-slate-300">{new Date(project.deliveryDate).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div className="text-right">
                      <span className="text-xs font-bold inline-block text-indigo-400">
                        {Math.round((project.steps.filter(s => s.completed).length / (project.steps.length || 1)) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                      style={{ width: `${(project.steps.filter(s => s.completed).length / (project.steps.length || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {activeProjects.length === 0 && (
            <div className="col-span-full py-16 text-center bg-slate-800/20 border-2 border-dashed border-slate-800 rounded-3xl">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 mx-auto mb-4 text-2xl">
                <i className="fa-solid fa-folder-open"></i>
              </div>
              <p className="text-slate-500 font-bold">Nenhum projeto ativo.</p>
              <button
                onClick={onCreateProject}
                className="mt-4 bg-indigo-600/10 text-indigo-400 px-6 py-2 rounded-xl font-bold hover:bg-indigo-600/20 transition-all"
              >
                Começar agora
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
