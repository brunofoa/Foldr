
import React, { useState } from 'react';
import { Project, ProjectStatus, Client } from '../types';

interface ClientsListProps {
  projects: Project[];
  clients: Client[];
  onBack: () => void;
  onSelectClient: (clientName: string) => void;
  onAddClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
}

interface ClientSummary {
  name: string;
  totalProjects: number;
  activeProjects: number;
  lastProjectDate: string;
  details?: Client;
}

const ClientsList: React.FC<ClientsListProps> = ({ projects, clients, onBack, onSelectClient, onAddClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', phone: '', email: '', birthDate: '', company: '', tags: '' });

  // Extract unique clients from projects and merge with registered clients
  const clientMap = projects.reduce((acc, project) => {
    const name = project.client;
    if (!acc[name]) {
      acc[name] = {
        name,
        totalProjects: 0,
        activeProjects: 0,
        lastProjectDate: project.createdAt
      };
    }
    acc[name].totalProjects += 1;
    if (project.status !== ProjectStatus.CONCLUIDO) {
      acc[name].activeProjects += 1;
    }
    if (new Date(project.createdAt) > new Date(acc[name].lastProjectDate)) {
      acc[name].lastProjectDate = project.createdAt;
    }
    return acc;
  }, {} as Record<string, ClientSummary>);

  // Add details from clients array
  clients.forEach(c => {
    if (clientMap[c.name]) {
      clientMap[c.name].details = c;
    } else {
      clientMap[c.name] = {
        name: c.name,
        totalProjects: 0,
        activeProjects: 0,
        lastProjectDate: c.createdAt,
        details: c
      };
    }
  });

  const clientList = (Object.values(clientMap) as ClientSummary[]).filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = newClient.tags ? newClient.tags.split(',').map(t => t.trim()).filter(t => t) : [];
    onAddClient({
      name: newClient.name,
      phone: newClient.phone,
      email: newClient.email,
      birthDate: newClient.birthDate,
      company: newClient.company,
      tags: tagsArray
    });
    setIsModalOpen(false);
    setNewClient({ name: '', phone: '', email: '', birthDate: '', company: '', tags: '' });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Clientes</h1>
          <p className="text-slate-400">Base de clientes atendidos e projetos vinculados.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-lg flex items-center gap-2"
          >
            <i className="fa-solid fa-user-plus text-sm"></i>
            Novo Cliente
          </button>
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors self-start md:self-center"
          >
            <i className="fa-solid fa-house"></i>
            Dashboard
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
          <input
            type="text"
            placeholder="Buscar por nome do cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Cliente</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Total Projetos</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Ativos</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:table-cell">Última Atividade</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {clientList.map(client => (
              <tr
                key={client.name}
                className="hover:bg-slate-700/30 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-semibold">{client.name}</span>
                      <div className="flex gap-2 text-[10px] text-slate-500">
                        {client.details?.company && <span>{client.details.company}</span>}
                        {client.details?.email && <span>• {client.details.email}</span>}
                      </div>
                      {client.details?.tags && client.details.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {client.details.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 text-[9px]">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-slate-300 font-medium">{client.totalProjects}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter ${client.activeProjects > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-700 text-slate-500'
                    }`}>
                    {client.activeProjects} Ativos
                  </span>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <span className="text-slate-400 text-sm font-mono">{new Date(client.lastProjectDate).toLocaleDateString('pt-BR')}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onSelectClient(client.name)}
                    className="text-xs text-indigo-400 font-bold hover:underline bg-indigo-500/10 px-3 py-1.5 rounded-lg hover:bg-indigo-500/20 transition-all"
                  >
                    Ver Histórico
                  </button>
                </td>
              </tr>
            ))}
            {clientList.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Novo Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-slideIn">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Novo Cliente</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors text-xl">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nome Completo</label>
                  <input
                    required
                    type="text"
                    value={newClient.name}
                    onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                    placeholder="João Silva"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Empresa</label>
                  <input
                    type="text"
                    value={newClient.company}
                    onChange={e => setNewClient({ ...newClient, company: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                    placeholder="Nome da Empresa (Opcional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Telefone</label>
                    <input
                      type="tel"
                      value={newClient.phone}
                      onChange={e => setNewClient({ ...newClient, phone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nascimento</label>
                    <input
                      type="date"
                      value={newClient.birthDate}
                      onChange={e => setNewClient({ ...newClient, birthDate: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                    placeholder="cliente@exemplo.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tags</label>
                  <input
                    type="text"
                    value={newClient.tags}
                    onChange={e => setNewClient({ ...newClient, tags: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                    placeholder="Ex: VIP, Casamento, Indicação (separar por vírgula)"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
                  >
                    Cadastrar Cliente
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsList;
