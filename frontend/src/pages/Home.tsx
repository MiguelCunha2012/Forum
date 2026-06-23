import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { BookOpen, Search, Image as ImageIcon, ArrowRight } from 'lucide-react';

interface PostImage {
  id: number;
  post_id: number;
  image_path: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  background_image: string | null;
  images: PostImage[];
}

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('/api/posts');
        setPosts(response.data);
      } catch (err: any) {
        setError('Falha ao carregar as postagens.');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Hero Banner */}
      <div className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/40 via-indigo-900/20 to-dark-900 border border-white/5 p-8 md:p-12">
        <div className="absolute top-0 right-0 -z-10 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"></div>
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 border border-blue-500/20 mb-4">
            <BookOpen size={12} />
            Mural de Jogos
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Explore Tópicos e Compartilhe sobre Jogos
          </h1>
          <p className="mt-4 text-base text-slate-400">
            Bem-vindo ao fórum! Navegue pelas postagens, confira imagens e participe da nossa comunidade de apaixonados por jogos.
          </p>
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <div className="mb-8 relative max-w-md">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
          <Search size={18} />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por título ou conteúdo..."
          className="w-full rounded-xl bg-dark-900 border border-slate-700/50 pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
        />
      </div>

      {/* Feed de Postagens */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></span>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center text-red-400">
          {error}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-slate-700/50 bg-dark-900/50 p-12 text-center text-slate-400">
          Nenhuma postagem disponível no momento.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => navigate(`/posts/${post.id}`)}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl glass glass-hover p-6 cursor-pointer shadow-lg hover:shadow-xl"
            >
              <div>
                {/* Imagem de Fundo (Se houver) */}
                {post.background_image && (
                  <div className="absolute inset-0 -z-20 h-full w-full opacity-10 group-hover:opacity-20 transition-opacity">
                    <img
                      src={post.background_image.startsWith('http') ? post.background_image : `/${post.background_image}`}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-dark-950/40"></div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                  <span>Autor: <strong className="text-slate-300">{post.author}</strong></span>
                  <div className="flex items-center gap-2">
                    {post.images.length > 0 && (
                      <span className="flex items-center gap-1 bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                        <ImageIcon size={12} />
                        {post.images.length}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors mb-2 leading-tight">
                  {post.title}
                </h3>

                <p className="text-sm text-slate-400 line-clamp-3 mb-6">
                  {post.content}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 group-hover:text-blue-300 transition-colors mt-auto">
                Ler Matéria
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
