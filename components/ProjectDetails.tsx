import React, { useState } from 'react';
import { Project, ProjectStatus, Task, ProductionStep } from '../types';
import { api } from '../services/api';

interface ProjectDetailsProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onClose: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, onUpdateProject, onClose }) => {
  const [activeTab, setActiveTab] = useState<'plano' | 'checklist'>('plano');

  const toggleTask = (taskId: string) => {
    const updatedChecklist = project.checklist.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    // Optimistic UI Update
    onUpdateProject({ ...project, checklist: updatedChecklist });

    // API Call
    const task = project.checklist.find(t => t.id === taskId);
    if (task) {
      api.updateProjectTask(taskId, !task.completed).catch(console.error);
    }
  };

  const toggleStep = (stepId: string) => {
    const updatedSteps = project.steps.map(step =>
      step.id === stepId ? { ...step, completed: !step.completed } : step
    );
    // Optimistic UI Update
    onUpdateProject({ ...project, steps: updatedSteps });

    // API Call
    const step = project.steps.find(s => s.id === stepId);
    if (step) {
      api.updateProductionStep(stepId, !step.completed).catch(console.error);
    }
  };

  const finalizeProject = () => {
    // Optimistic UI Update
    onUpdateProject({ ...project, status: ProjectStatus.CONCLUIDO });

    // API Call
    api.updateProjectStatus(project.id, ProjectStatus.CONCLUIDO).catch(console.error);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Voltar para Projetos
        </button>
        <div className="flex gap-3">
          {project.status !== ProjectStatus.CONCLUIDO && (
            <button
              onClick={finalizeProject}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-full font-bold text-sm transition-all"
            >
              Finalizar Projeto
            </button>
          )}
        </div>
      </header>

      <div className="bg-slate-800 rounded-3xl border border-slate-700 p-8 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-extrabold text-white">{project.name}</h1>
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-full uppercase tracking-widest">
                {project.type}
              </span>
            </div>
            <p className="text-slate-400 text-lg">{project.client} • Entrega em {new Date(project.deliveryDate).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {project.alerts.length > 0 && (
          <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4">
            <i className="fa-solid fa-bell text-amber-500 text-xl animate-pulse"></i>
            <div>
              <p className="text-amber-100 font-medium text-sm">Insight da IA: {project.alerts[0].message}</p>
            </div>
          </div>
        )}

        <div className="flex border-b border-slate-700 mb-8">
          <button
            onClick={() => setActiveTab('plano')}
            className={`px-6 py-4 font-bold text-sm tracking-wider uppercase border-b-2 transition-all ${activeTab === 'plano' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
          >
            Plano de Produção
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-6 py-4 font-bold text-sm tracking-wider uppercase border-b-2 transition-all ${activeTab === 'checklist' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
          >
            Checklist de Campo
          </button>
        </div>

        {activeTab === 'plano' ? (
          <div className="space-y-6">
            {['Pré', 'Produção', 'Pós'].map(phase => (
              <div key={phase} className="space-y-3">
                <h3 className="text-slate-500 font-bold uppercase text-xs tracking-widest">{phase}</h3>
                <div className="grid gap-3">
                  {project.steps.filter(s => s.phase === phase).map(step => (
                    <div
                      key={step.id}
                      onClick={() => toggleStep(step.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${step.completed ? 'bg-slate-900 border-emerald-500/30 text-slate-500' : 'bg-slate-700/50 border-slate-600 text-white'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <i className={`fa-solid ${step.completed ? 'fa-circle-check text-emerald-500' : 'fa-circle text-slate-600'}`}></i>
                        <span className={step.completed ? 'line-through' : ''}>{step.title}</span>
                      </div>
                      <span className="text-xs font-mono">{new Date(step.dueDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {['Equipamento', 'Captação', 'Backup', 'Edição', 'Entrega'].map(cat => (
              <div key={cat} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <h3 className="text-white font-bold">{cat}</h3>
                </div>
                <div className="space-y-2">
                  {project.checklist.filter(t => t.category === cat).map(task => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg hover:bg-slate-700 transition-all cursor-pointer group"
                    >
                      <i className={`fa-solid ${task.completed ? 'fa-square-check text-indigo-400' : 'fa-square text-slate-700 group-hover:text-slate-500'}`}></i>
                      <span className={`text-sm ${task.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                  {project.checklist.filter(t => t.category === cat).length === 0 && (
                    <p className="text-slate-600 text-xs italic">Nenhuma tarefa listada.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
