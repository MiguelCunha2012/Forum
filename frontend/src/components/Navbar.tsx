import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Home, Settings, User as UserIcon } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 w-full px-6 py-4">
      <nav className="mx-auto max-w-7xl glass rounded-2xl px-6 py-3 flex items-center justify-between shadow-lg">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent hover:opacity-95 transition-opacity">
            FÓRUM GAME
          </Link>
        </div>

        {/* Links principais */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors">
            <Home size={16} />
            Início
          </Link>
          
          {user.role === 'admin' && (
            <>
              <Link to="/admin" className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors">
                <Settings size={16} />
                Painel Admin
              </Link>
            </>
          )}
        </div>

        {/* Perfil & Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border-r border-slate-700/50 pr-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <UserIcon size={16} />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-white leading-3">{user.name}</p>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                {user.role === 'admin' ? 'Administrador' : 'Leitor'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
