import axios from 'axios';

const api = axios.create({
  baseURL: '', // Vazio porque o proxy do Vite redirecionará /api e /uploads para o backend
  withCredentials: true, // Necessário para enviar os cookies HTTPOnly de sessão
});

export default api;
