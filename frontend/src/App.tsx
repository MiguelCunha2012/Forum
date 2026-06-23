import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import de Páginas
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ViewPost from './pages/ViewPost';
import Admin from './pages/Admin';
import ManageUsers from './pages/ManageUsers';
import CreatePost from './pages/CreatePost';

// Import de Componentes
import Navbar from './components/Navbar';

// --- ROUTE GUARDS ---

// Rota Privada Comum (Requer Login)
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-950">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></span>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Rota Privada do Admin (Requer Login e privilégio Admin)
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-950">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></span>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'admin' ? <>{children}</> : <Navigate to="/" replace />;
};

// Rota Pública (Redireciona se logado)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-950">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></span>
      </div>
    );
  }
  
  if (user) {
    return user.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// --- ESTRUTURA GERAL ---
const Layout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-dark-950">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Rotas Privadas (View ou Admin) */}
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/posts/:id" element={<PrivateRoute><ViewPost /></PrivateRoute>} />

          {/* Rotas de Administração */}
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
          <Route path="/admin/posts/new" element={<AdminRoute><CreatePost /></AdminRoute>} />

          {/* Rota Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Layout Geral para Rotas Privadas */}
          <Route path="/*" element={<Layout />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
