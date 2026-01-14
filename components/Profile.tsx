import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { UserProfile } from '../types';
import { Session } from '@supabase/supabase-js';

interface ProfileProps {
    session: Session;
    onBack: () => void;
    onProfileUpdate: () => void;
    onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ session, onBack, onProfileUpdate, onLogout }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [phone, setPhone] = useState('');
    const [birthDate, setBirthDate] = useState('');

    useEffect(() => {
        loadProfile();
    }, [session]);

    const loadProfile = async () => {
        try {
            const data = await api.getProfile(session.user.id);
            setProfile(data);
            setFullName(data.fullName || '');
            setAvatarUrl(data.avatarUrl || '');
            setPhone(data.phone || '');
            setBirthDate(data.birthDate || '');
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.updateProfile(session.user.id, {
                fullName,
                avatarUrl,
                phone,
                birthDate
            });
            await onProfileUpdate(); // Trigger App to reload profile for header
            alert('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Erro ao atualizar perfil.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto animate-fadeIn">
            <button onClick={onBack} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 font-medium transition-colors">
                <i className="fa-solid fa-arrow-left text-xs"></i> Voltar ao Dashboard
            </button>

            <div className="space-y-4 mb-8">
                <h1 className="text-4xl font-black text-white tracking-tight">Meu Perfil</h1>
                <p className="text-slate-400">Gerencie suas informações pessoais.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-8">
                {/* Avatar Preview */}
                <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-slate-700 overflow-hidden mb-4 relative group">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600">
                                <i className="fa-solid fa-user text-4xl"></i>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-slate-500">Preview do Avatar</p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Nome Completo</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                                placeholder="Seu nome"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Data de Nascimento</label>
                            <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Telefone</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                            placeholder="(00) 00000-0000"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">URL do Avatar</label>
                        <input
                            type="text"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                            placeholder="https://exemplo.com/foto.jpg"
                        />
                        <p className="text-xs text-slate-600">Cole o link direto de uma imagem.</p>
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Email</label>
                            <input
                                type="text"
                                readOnly
                                value={profile?.email || session.user.email}
                                className="w-full bg-slate-800/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed"
                            />
                            <p className="text-xs text-slate-600">O email não pode ser alterado.</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                    >
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </form>

                <div className="pt-6 border-t border-slate-800">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 font-bold py-4 rounded-xl transition-all"
                    >
                        <i className="fa-solid fa-right-from-bracket"></i>
                        Sair da Conta
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
