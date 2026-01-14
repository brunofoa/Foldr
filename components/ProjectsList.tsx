
import React, { useState } from 'react';
import { Project, ProjectStatus } from '../types';

interface ProjectsListProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
  onBack: () => void;
}

const ProjectsList: React.FC<ProjectsListProps> = ({ projects, onSelectProject, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | ProjectStatus>('all');

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || project.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Todos os Projetos</h1>
          <p className="text-slate-400">Gerencie seu histórico e produções atuais.</p>
        </div>
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors self-start md:self-center"
        >
          <i className="fa-solid fa-house"></i>
          Voltar ao Dashboard
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
          <input
            type="text"
            placeholder="Buscar por projeto ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 w-full md:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter(ProjectStatus.EM_ANDAMENTO)}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${filter === ProjectStatus.EM_ANDAMENTO ? 'bg-amber-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Ativos
          </button>
          <button
            onClick={() => setFilter(ProjectStatus.CONCLUIDO)}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${filter === ProjectStatus.CONCLUIDO ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Concluídos
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Projeto</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden md:table-cell">Cliente</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden lg:table-cell text-right">Valor</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:table-cell">Entrega</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {filteredProjects.map(project => (
              <tr
                key={project.id}
                className="hover:bg-slate-700/30 transition-colors group cursor-pointer"
                onClick={() => onSelectProject(project.id)}
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-white font-semibold group-hover:text-indigo-400 transition-colors">{project.name}</span>
                    <span className="text-xs text-slate-500 md:hidden">{project.client}</span>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="text-slate-400">{project.client}</span>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell text-right">
                  <span className="text-slate-300 font-mono">
                    {project.value ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.value) : '-'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter ${project.status === ProjectStatus.CONCLUIDO ? 'bg-emerald-500/10 text-emerald-500' :
                    project.status === ProjectStatus.EM_ANDAMENTO ? 'bg-amber-500/10 text-amber-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                    {project.status}
                  </span>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <span className="text-slate-400 text-sm font-mono">{new Date(project.deliveryDate).toLocaleDateString('pt-BR')}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <i className="fa-solid fa-chevron-right text-slate-700 group-hover:text-indigo-500 transition-colors"></i>
                </td>
              </tr>
            ))}
            {filteredProjects.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                  Nenhum projeto encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectsList;
