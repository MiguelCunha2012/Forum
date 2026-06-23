import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, User as UserIcon, Image as ImageIcon, X } from 'lucide-react';

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

const ViewPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null); // Para modal de visualização de foto cheia

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/api/posts/${id}`);
        setPost(response.data);
      } catch (err: any) {
        setError('Postagem não encontrada.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></span>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12 text-center">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-red-400 mb-6">
          {error || 'Postagem não encontrada'}
        </div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:underline">
          <ArrowLeft size={16} /> Voltar para a tela inicial
        </Link>
      </div>
    );
  }

  // Define a imagem de fundo correta (URL absoluta ou relativa)
  const bgImgUrl = post.background_image
    ? post.background_image.startsWith('http')
      ? post.background_image
      : `/${post.background_image}`
    : null;

  return (
    <div className="relative min-h-screen pb-16">
      {/* Imagem de Fundo Borrada (Estilo Imersivo Premium) */}
      {bgImgUrl && (
        <div className="absolute inset-0 -z-50 h-full w-full overflow-hidden">
          <img
            src={bgImgUrl}
            alt=""
            className="h-full w-full object-cover blur-3xl opacity-20 scale-105"
          />
          <div className="absolute inset-0 bg-dark-950/80"></div>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Botão Voltar */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>

        {/* Artigo Principal */}
        <article className="glass rounded-3xl p-6 md:p-10 shadow-2xl border border-white/5 relative">
          {/* Banner de fundo do post dentro do box */}
          {bgImgUrl && (
            <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-8 border border-white/10 relative">
              <img src={bgImgUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 to-transparent"></div>
            </div>
          )}

          {/* Cabeçalho do Artigo */}
          <header className="mb-6 border-b border-slate-700/50 pb-6">
            <h1 className="text-3xl font-extrabold text-white md:text-4xl leading-tight">
              {post.title}
            </h1>
            
            <div className="mt-4 flex flex-wrap gap-4 items-center text-sm text-slate-400">
              <div className="flex items-center gap-1.5">
                <UserIcon size={16} className="text-blue-400" />
                <span>Autor: <strong className="text-slate-300">{post.author}</strong></span>
              </div>
            </div>
          </header>

          {/* Conteúdo */}
          <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-line text-base md:text-lg mb-10">
            {post.content}
          </div>

          {/* Galeria de Imagens Anexadas */}
          {post.images.length > 0 && (
            <div className="border-t border-slate-700/50 pt-8">
              <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-6">
                <ImageIcon size={20} className="text-indigo-400" />
                Galeria de Fotos
              </h3>
              
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {post.images.map((img) => {
                  const imgUrl = img.image_path.startsWith('http') ? img.image_path : `/${img.image_path}`;
                  return (
                    <div
                      key={img.id}
                      onClick={() => setActiveImage(imgUrl)}
                      className="group aspect-square overflow-hidden rounded-xl bg-dark-900 border border-white/5 cursor-pointer relative hover:border-blue-500/50 transition-all duration-300"
                    >
                      <img
                        src={imgUrl}
                        alt="Anexo"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-dark-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-xs bg-dark-950/80 text-slate-200 px-2 py-1 rounded-md border border-white/10">Ampliar</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </article>
      </div>

      {/* Lightbox / Modal de Imagem Ampliada */}
      {activeImage && (
        <div
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 transition-all duration-300 animate-fade-in"
        >
          <button
            onClick={() => setActiveImage(null)}
            className="absolute top-4 right-4 rounded-full bg-dark-800/80 p-2 text-slate-300 hover:text-white border border-white/5 cursor-pointer"
          >
            <X size={24} />
          </button>
          
          <img
            src={activeImage}
            alt="Imagem Ampliada"
            className="max-h-screen max-w-full rounded-lg object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

export default ViewPost;
