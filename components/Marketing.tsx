import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Client } from '../types';

interface MarketingProps {
    onBack: () => void;
}

const Marketing: React.FC<MarketingProps> = ({ onBack }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
    const [message, setMessage] = useState('');
    const [mode, setMode] = useState<'selection' | 'sending'>('selection');
    const [sentClients, setSentClients] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const data = await api.getClients();
            setClients(data);
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            alert('Não foi possível carregar a lista de clientes.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedClients(new Set(clients.map(c => c.id)));
        } else {
            setSelectedClients(new Set());
        }
    };

    const handleSelectClient = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedClients);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedClients(newSelected);
    };

    const handlePrepare = () => {
        if (selectedClients.size === 0) {
            alert('Selecione pelo menos um cliente.');
            return;
        }
        if (!message.trim()) {
            alert('Digite uma mensagem para a campanha.');
            return;
        }
        setMode('sending');
    };

    const handleSend = (client: Client) => {
        if (!client.phone) {
            alert(`O cliente ${client.name} não possui telefone cadastrado.`);
            return;
        }

        // Remove non-digits
        const phone = client.phone.replace(/\D/g, '');

        // Basic encode
        const encodedMessage = encodeURIComponent(message);

        // Open WhatsApp
        window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');

        // Mark as sent
        const newSent = new Set(sentClients);
        newSent.add(client.id);
        setSentClients(newSent);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto animate-fadeIn">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <button onClick={onBack} className="text-slate-400 hover:text-white mb-4 flex items-center gap-2 font-medium">
                        <i className="fa-solid fa-arrow-left text-xs"></i> Voltar
                    </button>
                    <h1 className="text-4xl font-black text-white tracking-tight">Marketing</h1>
                    <p className="text-slate-400 text-lg">Envie campanhas via WhatsApp para seus clientes.</p>
                </div>
                {mode === 'sending' && (
                    <button
                        onClick={() => setMode('selection')}
                        className="bg-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                    >
                        Editar Seleção
                    </button>
                )}
            </div>

            {mode === 'selection' ? (
                <div className="space-y-6">
                    {/* Message Input */}
                    <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 block">Mensagem da Campanha</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Olá! Temos uma novidade especial para você..."
                            className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 focus:border-indigo-500 outline-none transition-all text-white resize-none placeholder:text-slate-700"
                        />
                    </div>

                    {/* Client Selection */}
                    <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700">
                            <h2 className="font-bold text-white text-lg">Selecionar Clientes ({selectedClients.size})</h2>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">Selecionar Todos</span>
                                <input
                                    type="checkbox"
                                    checked={selectedClients.size === clients.length && clients.length > 0}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-600 bg-slate-700 checked:bg-indigo-600 transition-colors cursor-pointer"
                                />
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {clients.map(client => (
                                <label key={client.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${selectedClients.has(client.id)
                                        ? 'bg-indigo-500/10 border-indigo-500/50'
                                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                                    }`}>
                                    <input
                                        type="checkbox"
                                        checked={selectedClients.has(client.id)}
                                        onChange={(e) => handleSelectClient(client.id, e.target.checked)}
                                        className="w-5 h-5 rounded border-slate-600 bg-slate-700 checked:bg-indigo-600 transition-colors"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-white truncate">{client.name}</div>
                                        <div className="text-xs text-slate-500 truncate">{client.phone || 'Sem telefone'}</div>
                                    </div>
                                </label>
                            ))}
                            {clients.length === 0 && (
                                <div className="col-span-full py-8 text-center text-slate-500 italic">
                                    Nenhum cliente encomtrado.
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handlePrepare}
                        disabled={selectedClients.size === 0}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        PREPARAR DISPAROS <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-bold text-white text-lg">Disparar Mensagens</h2>
                            <div className="text-sm font-bold text-slate-400">
                                Enviados: <span className="text-emerald-400">{sentClients.size}</span> / {selectedClients.size}
                            </div>
                        </div>

                        <div className="space-y-3">
                            {clients.filter(c => selectedClients.has(c.id)).map(client => {
                                const isSent = sentClients.has(client.id);
                                return (
                                    <div key={client.id} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${isSent ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                                                }`}>
                                                {isSent ? <i className="fa-solid fa-check"></i> : client.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className={`font-bold ${isSent ? 'text-emerald-400' : 'text-white'}`}>{client.name}</div>
                                                <div className="text-xs text-slate-500">{client.phone}</div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleSend(client)}
                                            disabled={!client.phone}
                                            className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${isSent
                                                    ? 'bg-slate-800 text-slate-500 cursor-default'
                                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                }`}
                                        >
                                            {isSent ? (
                                                <>Enviado</>
                                            ) : (
                                                <>
                                                    <i className="fa-brands fa-whatsapp text-lg"></i>
                                                    Enviar WhatsApp
                                                </>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Marketing;
