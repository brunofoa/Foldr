
import React, { useState } from 'react';
import { ProjectType, BriefingQuestion } from '../types';
import { getBriefingQuestions } from '../services/geminiService';

interface BriefingWizardProps {
  projectType: ProjectType;
  onComplete: (answers: Record<string, string>) => void;
  onCancel: () => void;
}

const BriefingWizard: React.FC<BriefingWizardProps> = ({ projectType, onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const questions = getBriefingQuestions(projectType);

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(answers);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onCancel();
    }
  };

  const currentQuestion = questions[currentStep];

  return (
    <div className="max-w-2xl mx-auto py-12 animate-slideIn">
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <span className="text-indigo-400 font-bold text-sm tracking-widest uppercase">Briefing Inteligente</span>
          <span className="text-slate-500 text-sm">{currentStep + 1} de {questions.length}</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full">
          <div
            className="bg-indigo-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-slate-800 p-8 md:p-12 rounded-3xl border border-slate-700 shadow-2xl">
        <h2 className="text-2xl font-bold mb-8 text-white">{currentQuestion.question}</h2>

        <div className="mb-12">
          {currentQuestion.type === 'text' && (
            <input
              type="text"
              autoFocus
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
              className="w-full bg-slate-900 border-b-2 border-slate-700 focus:border-indigo-500 py-3 text-xl text-white outline-none transition-colors"
              placeholder="Sua resposta aqui..."
            />
          )}
          {currentQuestion.type === 'number' && (
            <input
              type="number"
              autoFocus
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
              className="w-full bg-slate-900 border-b-2 border-slate-700 focus:border-indigo-500 py-3 text-xl text-white outline-none transition-colors"
              placeholder="0"
            />
          )}
        </div>

        <div className="flex justify-between items-center gap-4">
          <button
            onClick={handleBack}
            className="text-slate-400 hover:text-white font-medium transition-colors"
          >
            {currentStep === 0 ? 'Cancelar' : 'Voltar'}
          </button>
          <button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
            className={`px-8 py-3 rounded-full font-bold transition-all ${!answers[currentQuestion.id]
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20'
              }`}
          >
            {currentStep === questions.length - 1 ? 'Gerar Plano de Produção' : 'Próxima Pergunta'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BriefingWizard;
