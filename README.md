# Fórum Modernizado (Clean Architecture & Fullstack)

Este projeto é a versão completamente refatorada e modernizada de um sistema de fórum legado originalmente escrito em PHP arcaico. A nova versão foi reconstruída utilizando as melhores práticas de mercado, com separação estrita de responsabilidades (**Clean Architecture**), banco de dados **SQLite** auto-gerido e uma experiência visual de altíssimo nível.

---

## 🛠️ Stack Tecnológica

- **Backend (Python 3.14+):**
  - **FastAPI:** Framework assíncrono de alto desempenho.
  - **SQLAlchemy:** ORM moderno para manipulação segura e limpa do SQLite.
  - **PyJWT:** Criptografia e geração de Tokens JWT.
  - **Bcrypt:** Algoritmo seguro de hashing de senhas.
  - **Pydantic:** Validação rigorosa e serialização de dados de entrada e saída.
- **Frontend (TypeScript & React):**
  - **Vite:** Ferramenta ultra-rápida de build e desenvolvimento.
  - **Tailwind CSS (v4):** Design responsivo premium com suporte nativo a efeitos modernos.
  - **Axios:** Integração de API com suporte a cookies de sessão `HttpOnly`.
  - **Lucide React:** Coleção de ícones minimalistas e modernos.

---

## 📁 Estrutura de Pastas

O projeto adota a divisão conceitual da **Clean Architecture**, isolando as regras de negócios de detalhes de implementação como banco de dados e bibliotecas web.

```
forum/
├── legacy/                   # Código PHP e CSS legado para fins de histórico
├── backend/                  # API Restful em Python (FastAPI)
│   ├── app/
│   │   ├── domain/           # Entidades puras e Interfaces dos Repositórios (SOLID - DIP)
│   │   ├── application/      # Casos de Uso / Regras de negócio da aplicação (Services)
│   │   ├── infrastructure/   # Banco de Dados SQLite, Implementações de Repositório, Segurança
│   │   └── presentation/     # Rotas HTTP, Schemas Pydantic de validação
│   ├── main.py               # Ponto de inicialização do FastAPI
│   └── requirements.txt      # Dependências do backend
├── frontend/                 # Interface do Usuário (React + TypeScript + Vite + Tailwind v4)
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis (Navbar, cards, etc.)
│   │   ├── contexts/         # Estado global de autenticação (AuthContext)
│   │   ├── pages/            # Telas da aplicação (Home, Login, Admin, CRUD, etc.)
│   │   ├── services/         # Cliente de requisições Axios
│   │   └── index.css         # Configurações globais e estilos customizados (Glassmorphism)
│   ├── index.html
│   └── package.json          # Dependências do frontend
├── run.bat                   # Script executável para iniciar os dois servidores no Windows
└── README.md                 # Este documento de referência
```

---

## 🔒 Melhorias e Correções Aplicadas

1. **Correção de Bugs Críticos:**
   - O bug de cadastro (`cadastro.php` acessando campo inexistente no formulário) foi corrigido, e as permissões de usuário agora são devidamente mapeadas no banco.
   - Os posts agora gerenciam de forma consistente o campo de **Autor** e a **Imagem de Fundo** (que ficavam vazios ou causavam erros no código original).
2. **Segurança Avançada:**
   - **Prevenção contra SQL Injection:** Consultas SQL são processadas de forma 100% parametrizada pelo ORM SQLAlchemy.
   - **Tokens JWT Seguros:** Armazenados no navegador do usuário utilizando cookies do tipo `HttpOnly`, `SameSite=Lax`, blindando a aplicação contra ataques XSS que buscam capturar sessões.
   - **Upload Injetado Protegido:** Nomes de imagens enviados por clientes são substituídos por UUIDs criptográficos únicos de forma automática, validando o cabeçalho e tamanho limite (2MB) do arquivo no servidor.
   - **Exclusão Física Eficiente:** Ao deletar uma postagem, as imagens associadas são fisicamente excluídas do disco do servidor, evitando desperdício de espaço de armazenamento (orfanatos de arquivos).
3. **Experiência Visual e Usabilidade:**
   - Interface com estética moderna (Dark mode, Glassmorphism, brilho neon).
   - Upload de imagens no editor de postagens com suporte a até 8 imagens e pré-visualização dinâmica em tempo real (antes de enviar ao servidor).
   - Visualização imersiva de matérias carregando a imagem de fundo com overlay escuro borrado para manter contraste de texto excelente.

---

## 🚀 Como Executar o Projeto

Como você possui o **Node.js** e o **Python 3.14** instalados, você pode executar o projeto de forma extremamente simples.

### Execução Simplificada (Windows)

Basta dar dois cliques no arquivo **`run.bat`** na raiz do projeto. Ele abrirá dois terminais separados, inicializará as dependências e disponibilizará o sistema.

---

### Execução Manual

Caso prefira executar os serviços manualmente ou esteja em outro sistema operacional:

#### 1. Backend (FastAPI + SQLite)
Abra um terminal na pasta `backend/`:
```bash
# Entre na pasta
cd backend

# Ative o ambiente virtual (.venv)
# No Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# No Windows CMD:
.\.venv\Scripts\activate.bat
# No Linux/Mac:
source .venv/bin/activate

# Instale as dependências (caso não tenha feito ainda)
pip install -r requirements.txt

# Inicie o servidor local
uvicorn main:app --reload
```
O servidor rodará em [http://localhost:8000](http://localhost:8000). A documentação Swagger estará disponível em [http://localhost:8000/docs](http://localhost:8000/docs).

*Nota: O banco de dados `forum.db` e as tabelas com os usuários iniciais são gerados automaticamente no primeiro acesso ao backend.*

#### 2. Frontend (React + Vite)
Abra outro terminal na pasta `frontend/`:
```bash
# Entre na pasta
cd frontend

# Instale os pacotes (se necessário)
npm install

# Inicie o cliente de desenvolvimento
npm run dev
```
O frontend estará acessível em [http://localhost:5173](http://localhost:5173).

---

## 👤 Contas de Teste (Auto-Geradas)

Na primeira execução, o banco de dados SQLite será criado com as seguintes contas padrão de teste para validação imediata:

1. **Administrador:**
   - **E-mail:** `admin@forum.com`
   - **Senha:** `admin123`
   - *Permissões:* Acesso total, gerenciamento de usuários (CRUD) e publicação de matérias.
2. **Leitor Comum:**
   - **E-mail:** `user@forum.com`
   - **Senha:** `user123`
   - *Permissões:* Visualização das postagens disponíveis no feed e galeria de fotos.
