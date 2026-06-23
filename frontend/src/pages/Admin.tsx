import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Users, FileText, PlusCircle, ArrowRight, ShieldAlert, Image as ImageIcon } from 'lucide-react';

const Admin: React.FC = () => {
  const [stats, setStats] = useState({ users: 0, posts: 0, images: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, postsRes] = await Promise.all([
          api.get('/api/users'),
          api.get('/api/posts')
        ]);
        
        let totalImages = 0;
        postsRes.data.forEach((p: any) => {
          totalImages += p.images.length;
        });

        setStats({
          users: usersRes.data.length,
          posts: postsRes.data.length,
          images: totalImages
        });
      } catch (error) {
        console.error('Erro ao buscar dados do painel:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Cabeçalho */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400 border border-indigo-500/20 mb-3">
            <ShieldAlert size={12} />
            Painel Administrativo
          </span>
          <h1 className="text-3xl font-extrabold text-white">O que você deseja fazer hoje?</h1>
          <p className="text-slate-400 text-sm mt-1">Gerencie a plataforma, modere posts e controle usuários.</p>
        </div>
      </div>

      {/* Grid de Estatísticas */}
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></span>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-3 mb-12">
          {/* Card Usuários */}
          <div className="glass rounded-2xl p-6 border border-white/5 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Usuários Cadastrados</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.users}</h3>
            </div>
          </div>

          {/* Card Matérias */}
          <div className="glass rounded-2xl p-6 border border-white/5 flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Matérias Publicadas</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.posts}</h3>
            </div>
          </div>

          {/* Card Anexos */}
          <div className="glass rounded-2xl p-6 border border-white/5 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <ImageIcon size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Imagens Anexadas</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.images}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Ações Rápidas */}
      <h2 className="text-xl font-bold text-white mb-6">Ações Rápidas</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Ir para Usuários */}
        <div
          onClick={() => navigate('/admin/users')}
          className="group rounded-2xl glass glass-hover p-8 cursor-pointer relative overflow-hidden border border-white/5"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
              <Users size={32} />
            </div>
            <ArrowRight size={20} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1.5 transition-all" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
            Gerenciamento de Usuários
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Adicione, edite ou exclua membros da plataforma. Configure funções administrativas (Admin/View).
          </p>
        </div>

        {/* Escrever Nova Matéria */}
        <div
          onClick={() => navigate('/admin/posts/new')}
          className="group rounded-2xl glass glass-hover p-8 cursor-pointer relative overflow-hidden border border-white/5"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
              <PlusCircle size={32} />
            </div>
            <ArrowRight size={20} className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1.5 transition-all" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
            Escrever Nova Matéria
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Crie novos tópicos e posts informativos. Adicione imagem de fundo personalizada e anexe até 8 fotos adicionais.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
