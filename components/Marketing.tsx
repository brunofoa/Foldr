import React from 'react';

interface MarketingProps {
    onBack: () => void;
}

const Marketing: React.FC<MarketingProps> = ({ onBack }) => {
    return (
        <div className="max-w-4xl mx-auto animate-fadeIn">
            <button onClick={onBack} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 font-medium transition-colors">
                <i className="fa-solid fa-arrow-left text-xs"></i> Voltar ao Dashboard
            </button>

            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">Marketing</h1>
                    <p className="text-slate-400 text-lg">Gerencie suas campanhas e comunique-se com clientes.</p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-400">
                        <i className="fa-solid fa-bullhorn text-3xl"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Funcionalidade em Desenvolvimento</h2>
                    <p className="text-slate-400 max-w-md mx-auto">
                        Em breve você poderá criar campanhas e enviar mensagens para seus clientes diretamente por aqui.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Marketing;
