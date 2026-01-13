
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface LoginProps {
    onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('Cadastro realizado! Verifique seu email para confirmar.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-fadeIn">
                <div className="text-center mb-8">
                    <img src="/foldr-logo.png" alt="Foldr" className="h-24 mx-auto mb-6 object-contain" />
                    <h1 className="text-2xl font-bold text-white tracking-tight">Bem-vindo</h1>
                    <p className="text-slate-400">Entre para gerenciar sua produção.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span className="text-sm font-bold">{error}</span>
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email</label>
                        <input
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 focus:border-indigo-500 outline-none transition-all text-white placeholder:text-slate-600"
                            placeholder="seu@email.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Senha</label>
                        <input
                            required
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 focus:border-indigo-500 outline-none transition-all text-white placeholder:text-slate-600"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
                    >
                        {loading ? (
                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                        ) : (
                            isSignUp ? 'Criar Conta' : 'Entrar'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-slate-400 text-sm hover:text-white transition-colors font-medium"
                    >
                        {isSignUp ? 'Já tem uma conta? Entre aqui.' : 'Não tem conta? Crie agora.'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
