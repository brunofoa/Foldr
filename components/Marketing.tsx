import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Client } from '../types';

interface MarketingProps {
    onBack: () => void;
}

const Marketing: React.FC<MarketingProps> = ({ onBack }) => {
    // State
    const [step, setStep] = useState<'selection' | 'sending'>('selection');
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [sentIds, setSentIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Load clients on mount
    useEffect(() => {
        api.getClients()
            .then(data => {
                setClients(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load clients:", err);
                setIsLoading(false);
            });
    }, []);

    // Filter clients based on search
    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Selection Logic
    const toggleSelectAll = () => {
        if (selectedIds.length === filteredClients.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredClients.map(c => c.id));
        }
    };

    const toggleClient = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // Sending Logic
    const handleSend = (client: Client) => {
        if (!client.phone) {
            alert(`O cliente ${client.name} não possui telefone cadastrado.`);
            return;
        }

        // Clean phone number: remove non-numeric chars
        let phone = client.phone.replace(/\D/g, '');

        // Add country code if missing (Basic assumption: Brazil 55 if length <= 11)
        if (phone.length <= 11) {
            phone = `55${phone}`;
        }

        const encodedMessage = encodeURIComponent(message);
        const url = `https://wa.me/${phone}?text=${encodedMessage}`;

        window.open(url, '_blank');

        // Mark as sent
        if (!sentIds.includes(client.id)) {
            setSentIds([...sentIds, client.id]);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto animate-fadeIn pb-12">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <button onClick={step === 'selection' ? onBack : () => setStep('selection')} className="text-slate-400 hover:text-white mb-4 flex items-center gap-2 font-medium transition-colors">
                        <i className="fa-solid fa-arrow-left text-xs"></i>
                        {step === 'selection' ? 'Voltar ao Dashboard' : 'Voltar para Seleção'}
                    </button>
                    <h1 className="text-4xl font-black text-white tracking-tight">Marketing</h1>
                    <p className="text-slate-400 text-lg">
                        {step === 'selection' ? 'Selecione os clientes e escreva sua mensagem.' : 'Envie as mensagens individualmente.'}
                    </p>
                </div>
            </div>

            {step === 'selection' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Client Selection */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[600px]">
                        <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-white text-lg">Destinatários</h2>
                                <span className="text-xs font-bold bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full">
                                    {selectedIds.length} selecionados
                                </span>
                            </div>

                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <i className="fa-solid fa-search absolute left-3 top-3 text-slate-500 text-xs"></i>
                                    <input
                                        type="text"
                                        placeholder="Buscar cliente..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                    />
                                </div>
                                <button
                                    onClick={toggleSelectAll}
                                    className="px-3 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap"
                                >
                                    {selectedIds.length === filteredClients.length && filteredClients.length > 0 ? 'Desmarcar' : 'Todos'}
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {filteredClients.length > 0 ? (
                                filteredClients.map(client => (
                                    <div
                                        key={client.id}
                                        onClick={() => toggleClient(client.id)}
                                        className={`flex items-center p-3 rounded-xl cursor-pointer transition-all border ${selectedIds.includes(client.id)
                                                ? 'bg-indigo-600/10 border-indigo-500/50'
                                                : 'bg-transparent border-transparent hover:bg-slate-800'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center transition-colors ${selectedIds.includes(client.id) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'
                                            }`}>
                                            {selectedIds.includes(client.id) && <i className="fa-solid fa-check text-white text-xs"></i>}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${selectedIds.includes(client.id) ? 'text-white' : 'text-slate-300'}`}>
                                                {client.name}
                                            </p>
                                            <p className="text-xs text-slate-500">{client.phone || 'Sem telefone'}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-slate-500 text-sm">
                                    Nenhum cliente encontrado.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Message & Action */}
                    <div className="flex flex-col h-[600px] space-y-6">
                        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Sua Mensagem</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Olá! Gostaria de falar sobre..."
                                className="flex-1 w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-700 focus:border-indigo-500 outline-none resize-none leading-relaxed"
                            />
                            <div className="mt-2 text-right text-xs text-slate-500">
                                {message.length} caracteres
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                if (selectedIds.length === 0) return alert('Selecione pelo menos um cliente.');
                                if (!message.trim()) return alert('Escreva uma mensagem.');
                                setStep('sending');
                            }}
                            disabled={selectedIds.length === 0 || !message.trim()}
                            className="w-full bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] uppercase tracking-widest text-sm"
                        >
                            Preparar Disparos
                            <i className="fa-brands fa-whatsapp ml-2"></i>
                        </button>
                    </div>
                </div>
            )}

            {step === 'sending' && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
                    <div className="p-8 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
                        <h2 className="text-2xl font-bold text-white mb-2">Pronto para Enviar</h2>
                        <div className="flex gap-4 text-sm text-slate-400">
                            <span><i className="fa-solid fa-users mr-1"></i> {selectedIds.length} destinatários</span>
                            <span><i className="fa-solid fa-check-double mr-1"></i> {sentIds.length} enviados</span>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-800">
                        {clients.filter(c => selectedIds.includes(c.id)).map(client => {
                            const isSent = sentIds.includes(client.id);
                            return (
                                <div key={client.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${isSent ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                                            {isSent ? <i className="fa-solid fa-check"></i> : client.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className={`font-bold ${isSent ? 'text-slate-500 line-through' : 'text-white'}`}>{client.name}</p>
                                            <p className="text-xs text-slate-500">{client.phone}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleSend(client)}
                                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${isSent
                                                ? 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                                                : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                                            }`}
                                    >
                                        {isSent ? 'Enviado' : 'Enviar WhatsApp'}
                                        {!isSent && <i className="fa-solid fa-paper-plane text-xs"></i>}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Marketing;
