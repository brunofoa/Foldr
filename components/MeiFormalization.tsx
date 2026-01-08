
import React, { useState, useEffect } from 'react';

interface MeiItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface MeiFormalizationProps {
  onBack: () => void;
}

const MeiFormalization: React.FC<MeiFormalizationProps> = ({ onBack }) => {
  const [items, setItems] = useState<MeiItem[]>([
    {
      id: '1',
      title: 'Abrir MEI (CNAEs Corretos)',
      description: 'Escolha atividades como Filmagem de Eventos, Edição de Vídeos ou Fotografia para garantir a tributação correta.',
      completed: false
    },
    {
      id: '2',
      title: 'Criar Contrato Padrão',
      description: 'Fundamental para segurança jurídica. Inclua cláusulas de direito de imagem, prazos de entrega e backup.',
      completed: false
    },
    {
      id: '3',
      title: 'Organizar Documentos Básicos',
      description: 'Mantenha em uma pasta: RG, CPF, Título de Eleitor e comprovante de endereço atualizado.',
      completed: false
    },
    {
      id: '4',
      title: 'Inscrição Municipal',
      description: 'Necessária para emitir Nota Fiscal de Serviços (NFS-e) na sua prefeitura.',
      completed: false
    },
    {
      id: '5',
      title: 'Conta Bancária PJ',
      description: 'Separe suas finanças pessoais das profissionais para uma gestão financeira saudável.',
      completed: false
    },
    {
      id: '6',
      title: 'Certificado Digital (Opcional)',
      description: 'Pode ser necessário dependendo da sua cidade para emissão de notas fiscais eletrônicas.',
      completed: false
    }
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('foldr_mei_checklist');
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  const toggleItem = (id: string) => {
    const updated = items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setItems(updated);
    localStorage.setItem('foldr_mei_checklist', JSON.stringify(updated));
  };

  const completedCount = items.filter(i => i.completed).length;
  const progress = (completedCount / items.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Formalização MEI</h1>
          <p className="text-slate-400">Guia de regularização para profissionais do audiovisual.</p>
        </div>
        <button 
          onClick={onBack}
          className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors self-start md:self-center"
        >
          <i className="fa-solid fa-house"></i>
          Dashboard
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <i className="fa-solid fa-list-check text-indigo-500"></i>
                Checklist de Regularização
              </h2>
              <span className="text-sm font-mono text-indigo-400">{Math.round(progress)}% Concluído</span>
            </div>
            
            <div className="w-full bg-slate-900 h-2 rounded-full mb-8 overflow-hidden">
              <div 
                className="bg-indigo-500 h-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="space-y-4">
              {items.map(item => (
                <div 
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer group flex items-start gap-4 ${
                    item.completed ? 'bg-slate-900/50 border-emerald-500/20 opacity-75' : 'bg-slate-700/30 border-slate-600 hover:border-indigo-500'
                  }`}
                >
                  <div className={`mt-1 text-xl ${item.completed ? 'text-emerald-500' : 'text-slate-600 group-hover:text-slate-400'}`}>
                    <i className={item.completed ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle'}></i>
                  </div>
                  <div>
                    <h4 className={`font-bold ${item.completed ? 'text-slate-500 line-through' : 'text-white'}`}>{item.title}</h4>
                    <p className={`text-sm mt-1 leading-relaxed ${item.completed ? 'text-slate-600' : 'text-slate-400'}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-indigo-600/10 p-8 rounded-3xl border border-indigo-500/20 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">
              <i className="fa-solid fa-lightbulb text-white"></i>
            </div>
            <h3 className="text-lg font-bold text-white">Por que ser MEI?</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-check text-indigo-400 mt-1"></i>
                <span>Emissão de Nota Fiscal para empresas (B2B).</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-check text-indigo-400 mt-1"></i>
                <span>Acesso a direitos previdenciários (Aposentadoria, Auxílio-doença).</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-check text-indigo-400 mt-1"></i>
                <span>Tributação reduzida e simplificada (DAS mensal).</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-check text-indigo-400 mt-1"></i>
                <span>Facilidade na abertura de conta bancária PJ.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">CNAEs Recomendados</h3>
            <div className="space-y-3">
              <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700">
                <p className="text-xs font-bold text-indigo-400">5911-1/99</p>
                <p className="text-xs text-slate-300">Atividades de produção cinematográfica, de vídeos...</p>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700">
                <p className="text-xs font-bold text-indigo-400">7420-0/04</p>
                <p className="text-xs text-slate-300">Filmagem de festas e eventos</p>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700">
                <p className="text-xs font-bold text-indigo-400">5912-0/99</p>
                <p className="text-xs text-slate-300">Atividades de pós-produção cinematográfica...</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MeiFormalization;
