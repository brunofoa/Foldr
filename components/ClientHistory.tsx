
import React from 'react';
import { Project, Client, ProjectStatus } from '../types';

interface ClientHistoryProps {
  clientName: string;
  clients: Client[];
  projects: Project[];
  onBack: () => void;
  onSelectProject: (id: string) => void;
  onUpdateClient: (updatedClient: Client) => void;
}

const ClientHistory: React.FC<ClientHistoryProps> = ({ clientName, clients, projects, onBack, onSelectProject, onUpdateClient }) => {
  const clientDetails = clients.find(c => c.name === clientName);
  const clientProjects = projects.filter(p => p.client === clientName).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const [isEditing, setIsEditing] = React.useState(false);
  const [editForm, setEditForm] = React.useState<{ phone: string, email: string, birthDate: string, company: string, tags: string }>({
    phone: '',
    email: '',
    birthDate: '',
    company: '',
    tags: ''
  });

  React.useEffect(() => {
    if (clientDetails) {
      setEditForm({
        phone: clientDetails.phone || '',
        email: clientDetails.email || '',
        birthDate: clientDetails.birthDate || '',
        company: clientDetails.company || '',
        tags: clientDetails.tags?.join(', ') || ''
      });
    }
  }, [clientDetails]);

  const handleSave = () => {
    if (clientDetails) {
      onUpdateClient({
        ...clientDetails,
        phone: editForm.phone,
        email: editForm.email,
        birthDate: editForm.birthDate,
        company: editForm.company,
        tags: editForm.tags.split(',').map(t => t.trim()).filter(t => t)
      });
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-2xl font-bold shadow-xl">
            {clientName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{clientName}</h1>
            <p className="text-slate-400">
              {clientDetails?.company && <span className="font-bold text-white mr-2">{clientDetails.company}</span>}
              Histórico de projetos e informações de contato.
            </p>
            {clientDetails?.tags && clientDetails.tags.length > 0 && (
              <div className="flex gap-2 mt-2">
                {clientDetails.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-700 text-slate-300 text-xs font-medium">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors self-start md:self-center"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Voltar para Lista
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <aside className="space-y-6">
          <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-indigo-400 font-bold uppercase text-xs tracking-widest">Dados do Cliente</h3>
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${isEditing
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
              >
                {isEditing ? 'Salvar' : 'Editar'}
              </button>
            </div>

            <div className="space-y-4">
              {/* Company Input */}
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-building text-slate-500 w-5"></i>
                {isEditing ? (
                  <input
                    value={editForm.company}
                    onChange={e => setEditForm({ ...editForm, company: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white w-full outline-none focus:border-indigo-500"
                    placeholder="Empresa"
                  />
                ) : (
                  <span className="text-slate-200">{clientDetails?.company || 'Sem empresa'}</span>
                )}
              </div>

              {/* Tags Input */}
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-tags text-slate-500 w-5"></i>
                {isEditing ? (
                  <input
                    value={editForm.tags}
                    onChange={e => setEditForm({ ...editForm, tags: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white w-full outline-none focus:border-indigo-500"
                    placeholder="Tags (separar por vírgula)"
                  />
                ) : (
                  <span className="text-slate-200">{clientDetails?.tags?.length ? `${clientDetails.tags.length} tags` : 'Sem tags'}</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <i className="fa-solid fa-phone text-slate-500 w-5"></i>
                {isEditing ? (
                  <input
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white w-full outline-none focus:border-indigo-500"
                    placeholder="Telefone"
                  />
                ) : (
                  <span className="text-slate-200">{clientDetails?.phone || 'Não informado'}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-envelope text-slate-500 w-5"></i>
                {isEditing ? (
                  <input
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white w-full outline-none focus:border-indigo-500"
                    placeholder="Email"
                  />
                ) : (
                  <span className="text-slate-200">{clientDetails?.email || 'Não informado'}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-cake-candles text-slate-500 w-5"></i>
                {isEditing ? (
                  <input
                    type="date"
                    value={editForm.birthDate}
                    onChange={e => setEditForm({ ...editForm, birthDate: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white w-full outline-none focus:border-indigo-500"
                  />
                ) : (
                  <span className="text-slate-200">
                    {clientDetails?.birthDate ? new Date(clientDetails.birthDate).toLocaleDateString('pt-BR') : 'Não informado'}
                  </span>
                )}
              </div>

              {isEditing && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="w-full text-xs text-slate-400 hover:text-white mt-2"
                >
                  Cancelar
                </button>
              )}
            </div>
            <div className="pt-4 border-t border-slate-700">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Membro desde</span>
                <span className="text-slate-300">
                  {clientDetails?.createdAt ? new Date(clientDetails.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600/10 p-6 rounded-3xl border border-indigo-500/20">
            <p className="text-indigo-200 text-sm font-medium leading-relaxed italic text-center">
              "Fidelizar o cliente através da entrega de excelência em cada frame."
            </p>
          </div>
        </aside>

        {/* Project List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <i className="fa-solid fa-clapperboard text-indigo-500"></i>
            Projetos Realizados ({clientProjects.length})
          </h2>

          <div className="space-y-4">
            {clientProjects.map(project => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-indigo-500 transition-all cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${project.status === ProjectStatus.CONCLUIDO ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                    <i className={
                      project.type === 'Vídeo' ? 'fa-solid fa-video' :
                        project.type === 'Foto' ? 'fa-solid fa-camera' :
                          'fa-solid fa-briefcase'
                    }></i>
                  </div>
                  <div>
                    <h4 className="text-white font-bold group-hover:text-indigo-400 transition-colors">{project.name}</h4>
                    <p className="text-xs text-slate-500">{project.type} • {new Date(project.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className={`hidden sm:inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase ${project.status === ProjectStatus.CONCLUIDO ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                    {project.status}
                  </span>
                  <i className="fa-solid fa-chevron-right text-slate-700 group-hover:text-indigo-500 transition-colors"></i>
                </div>
              </div>
            ))}
            {clientProjects.length === 0 && (
              <div className="text-center py-12 bg-slate-900/50 rounded-3xl border border-dashed border-slate-700">
                <i className="fa-solid fa-box-open text-4xl text-slate-700 mb-3"></i>
                <p className="text-slate-500">Nenhum projeto encontrado para este cliente.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientHistory;
