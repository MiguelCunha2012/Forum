import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, UserPlus, Edit2, Trash2, X, Shield, Eye, AlertCircle } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'view';
}

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Campos do Formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'view'>('view');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users');
      setUsers(response.data);
    } catch (err) {
      setError('Falha ao carregar lista de usuários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setModalMode('add');
    setSelectedUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('view');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setModalMode('edit');
    setSelectedUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword(''); // Opcional ao editar
    setRole(user.role);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      if (modalMode === 'add') {
        if (password.length < 6) {
          setFormError('A senha deve ter pelo menos 6 caracteres.');
          return;
        }
        await api.post('/api/users', { name, email, password, role });
      } else if (modalMode === 'edit' && selectedUser) {
        await api.put(`/api/users/${selectedUser.id}`, {
          name,
          email,
          role,
          ...(password ? { password } : {}),
        });
      }
      closeModal();
      fetchUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Erro ao salvar alterações.');
    }
  };

  const handleDelete = async (userId: number) => {
    if (!window.confirm('Tem certeza de que deseja excluir este usuário?')) return;
    try {
      await api.delete(`/api/users/${userId}`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao excluir usuário.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Cabeçalho */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft size={16} /> Painel Administrativo
          </Link>
          <h1 className="text-3xl font-extrabold text-white">Gerenciamento de Usuários</h1>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-500 hover:bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors shadow-lg shadow-blue-500/10 cursor-pointer"
        >
          <UserPlus size={18} />
          Adicionar Novo Usuário
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      {/* Tabela de Usuários */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></span>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl glass border border-white/5 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/50 bg-dark-900/30 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">E-mail</th>
                  <th className="px-6 py-4">Função</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm text-slate-300">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{u.id}</td>
                    <td className="px-6 py-4 font-semibold text-white">{u.name}</td>
                    <td className="px-6 py-4 text-slate-400">{u.email}</td>
                    <td className="px-6 py-4">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400 border border-blue-500/20">
                          <Shield size={12} />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-medium text-slate-400 border border-slate-700/50">
                          <Eye size={12} />
                          Leitor (View)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="rounded-lg p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal para Adicionar / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in backdrop-blur-sm">
          <div className="w-full max-w-md glass rounded-3xl p-6 shadow-2xl border border-white/10 relative">
            {/* Fechar */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-white mb-6">
              {modalMode === 'add' ? 'Adicionar Novo Usuário' : 'Editar Usuário'}
            </h3>

            {formError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
                <AlertCircle size={16} className="shrink-0" />
                <p>{formError}</p>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5" htmlFor="modal-name">
                  Nome Completo
                </label>
                <input
                  id="modal-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome"
                  className="w-full rounded-xl bg-dark-900 border border-slate-700/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5" htmlFor="modal-email">
                  E-mail
                </label>
                <input
                  id="modal-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@forum.com"
                  className="w-full rounded-xl bg-dark-900 border border-slate-700/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5" htmlFor="modal-password">
                  Senha {modalMode === 'edit' && '(deixe em branco para não alterar)'}
                </label>
                <input
                  id="modal-password"
                  type="password"
                  required={modalMode === 'add'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-dark-900 border border-slate-700/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5" htmlFor="modal-role">
                  Função (Permissão)
                </label>
                <select
                  id="modal-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'view')}
                  className="w-full rounded-xl bg-dark-900 border border-slate-700/50 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="view">Leitor (View)</option>
                  <option value="admin">Administrador (Admin)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-slate-700 text-slate-300 font-semibold py-2.5 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 transition-colors shadow-lg shadow-blue-500/10 cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
