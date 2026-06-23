import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Send, UploadCloud, X, AlertCircle, CheckCircle } from 'lucide-react';

const CreatePost: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Background Image states
  const [bgType, setBgType] = useState<'upload' | 'url'>('url');
  const [bgUrl, setBgUrl] = useState('');
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [bgFilePreview, setBgFilePreview] = useState<string | null>(null);

  // Gallery images states
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem de fundo deve ter no máximo 2MB.');
        return;
      }
      setBgFile(file);
      setBgFilePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Verifica limite de 8 imagens
    const totalFiles = galleryFiles.length + files.length;
    if (totalFiles > 8) {
      alert('Você pode anexar no máximo 8 imagens.');
      return;
    }

    // Filtra arquivos acima de 2MB
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    files.forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        alert(`O arquivo ${file.name} foi rejeitado pois excede o tamanho máximo de 2MB.`);
      } else {
        validFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    });

    setGalleryFiles((prev) => [...prev, ...validFiles]);
    setGalleryPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeGalleryFile = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeBgFile = () => {
    setBgFile(null);
    setBgFilePreview(null);
    if (bgInputRef.current) bgInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (title.length < 3) {
      setError('O título deve ter pelo menos 3 caracteres.');
      return;
    }

    if (content.length < 5) {
      setError('O conteúdo deve ter pelo menos 5 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('titulo', title);
      formData.append('conteudo', content);
      formData.append('autor', author || 'Anônimo');

      // Adiciona imagem de fundo
      if (bgType === 'url' && bgUrl) {
        formData.append('imagem_fundo_url', bgUrl);
      } else if (bgType === 'upload' && bgFile) {
        formData.append('imagem_fundo_file', bgFile);
      }

      // Adiciona imagens anexadas
      galleryFiles.forEach((file) => {
        formData.append('imagem', file);
      });

      await api.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao publicar matéria.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Cabeçalho */}
      <div className="mb-8">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-3"
        >
          <ArrowLeft size={16} /> Painel Administrativo
        </Link>
        <h1 className="text-3xl font-extrabold text-white">Criar Nova Matéria</h1>
        <p className="text-slate-400 text-sm mt-1">Publique um novo artigo no fórum com galeria de fotos.</p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          <AlertCircle size={18} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
          <CheckCircle size={18} className="shrink-0" />
          <p>Matéria publicada com sucesso! Redirecionando...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass rounded-3xl p-6 md:p-8 border border-white/5 space-y-6">
          {/* Título & Autor */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2" htmlFor="post-title">
                Título da Matéria
              </label>
              <input
                id="post-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Primeiros passos com Clean Architecture"
                className="w-full rounded-xl bg-dark-900 border border-slate-700/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2" htmlFor="post-author">
                Nome do Autor
              </label>
              <input
                id="post-author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Nome do Autor"
                className="w-full rounded-xl bg-dark-900 border border-slate-700/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Conteúdo */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2" htmlFor="post-content">
              Conteúdo do Post
            </label>
            <textarea
              id="post-content"
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva o texto completo do post..."
              className="w-full rounded-xl bg-dark-900 border border-slate-700/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all resize-y leading-relaxed"
            ></textarea>
          </div>

          {/* Configuração de Fundo do Post */}
          <div className="border-t border-slate-800/60 pt-6">
            <h3 className="text-sm font-bold text-white mb-4">Design do Post (Imagem de Fundo)</h3>
            
            <div className="flex gap-4 mb-4">
              <label className="inline-flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="bgType"
                  value="url"
                  checked={bgType === 'url'}
                  onChange={() => setBgType('url')}
                  className="accent-blue-500"
                />
                URL de Imagem Externa
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="bgType"
                  value="upload"
                  checked={bgType === 'upload'}
                  onChange={() => setBgType('upload')}
                  className="accent-blue-500"
                />
                Fazer Upload Local
              </label>
            </div>

            {bgType === 'url' ? (
              <input
                type="url"
                value={bgUrl}
                onChange={(e) => setBgUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... (opcional)"
                className="w-full rounded-xl bg-dark-900 border border-slate-700/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
              />
            ) : (
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  ref={bgInputRef}
                  onChange={handleBgFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => bgInputRef.current?.click()}
                  className="rounded-xl border border-dashed border-slate-700 hover:border-blue-500 hover:bg-blue-500/5 px-4 py-3 text-sm text-slate-300 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <UploadCloud size={16} />
                  Selecionar Foto de Fundo
                </button>
                {bgFilePreview && (
                  <div className="relative h-12 w-20 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
                    <img src={bgFilePreview} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={removeBgFile}
                      className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Anexar Imagens adicionais */}
          <div className="border-t border-slate-800/60 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white">Fotos Adicionais (Máximo de 8 imagens, até 2MB cada)</h3>
              <span className="text-xs text-slate-500 font-mono">{galleryFiles.length}/8 anexos</span>
            </div>

            <div className="space-y-4">
              <input
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                onChange={handleGalleryChange}
                className="hidden"
                disabled={galleryFiles.length >= 8}
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={galleryFiles.length >= 8}
                className="w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-blue-500 hover:bg-blue-500/5 disabled:opacity-40 disabled:pointer-events-none rounded-2xl py-8 transition-all cursor-pointer"
              >
                <UploadCloud size={32} className="text-slate-500 mb-2" />
                <span className="text-sm text-slate-300 font-medium">Arraste fotos ou clique para selecionar</span>
                <span className="text-xs text-slate-500 mt-1">Suporta JPG, PNG, GIF, WebP, Avif</span>
              </button>

              {/* Previews da Galeria */}
              {galleryPreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-4 sm:grid-cols-6 md:grid-cols-8">
                  {galleryPreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-dark-900"
                    >
                      <img src={preview} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryFile(index)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 hover:text-red-300 transition-opacity cursor-pointer"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botão de Envio */}
        <div className="flex gap-4">
          <Link
            to="/admin"
            className="flex-1 text-center rounded-xl border border-slate-700 text-slate-300 font-semibold py-3 hover:bg-slate-800 transition-all cursor-pointer"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 shadow-lg hover:shadow-blue-500/10 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            ) : (
              <>
                <Send size={18} />
                Publicar Matéria
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
