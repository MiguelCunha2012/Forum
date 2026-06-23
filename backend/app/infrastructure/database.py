import os
import bcrypt
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

# Caminho absoluto do banco de dados na raiz do projeto
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATABASE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'forum.db')}")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Modelos do Banco de Dados (Mapeamento do Legado)
class DBUser(Base):
    __tablename__ = "cadastro"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    senha = Column(String(255), nullable=False)
    tipo = Column(String(20), default="view", nullable=False) # 'admin' ou 'view'

class DBPost(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    titulo = Column(String(200), nullable=False)
    conteudo = Column(Text, nullable=False)
    autor = Column(String(100), default="Anônimo", nullable=False)
    imagem_fundo = Column(String(255), nullable=True)

    # Relacionamento com as imagens anexas
    imagens = relationship("DBPostImage", back_populates="post", cascade="all, delete-orphan")

class DBPostImage(Base):
    __tablename__ = "post_imagens"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    imagem = Column(String(255), nullable=False)

    post = relationship("DBPost", back_populates="imagens")

# Dependência para obter a sessão do banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Função para inicializar e semear o banco
def init_db():
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Garante a existência do usuário Admin padrão
        admin_exists = db.query(DBUser).filter(DBUser.email == "admin@forum.com").first()
        if not admin_exists:
            senha_admin = bcrypt.hashpw("admin123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            admin = DBUser(nome="Administrador", email="admin@forum.com", senha=senha_admin, tipo="admin")
            db.add(admin)
            
        # Garante a existência do usuário comum padrão
        user_exists = db.query(DBUser).filter(DBUser.email == "user@forum.com").first()
        if not user_exists:
            senha_user = bcrypt.hashpw("user123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            usuario = DBUser(nome="Usuário Comum", email="user@forum.com", senha=senha_user, tipo="view")
            db.add(usuario)
            
        db.commit()

        # Garante a existência do post sobre Red Dead Redemption 2
        rdr2_exists = db.query(DBPost).filter(DBPost.titulo.like("%Red Dead Redemption 2%")).first()
        if not rdr2_exists:
            post_rdr2 = DBPost(
                titulo="Red Dead Redemption 2 - A Derradeira Obra-Prima da Rockstar Games",
                conteudo="Lançado em 2018, Red Dead Redemption 2 é um dos jogos mais ambiciosos e aclamados de todos os tempos. Situado em 1899 nos Estados Unidos, o jogo acompanha a história de Arthur Morgan, um fora da lei veterano pertencente à gangue liderada por Dutch van der Linde.\n\nCom um nível de detalhamento absurdo, o ecossistema reage a cada ação do jogador: os animais caçam entre si, o clima afeta fisicamente o cavalo e o fôlego das personagens, e a inteligência artificial dos cidadãos reage com base em sua reputação e crimes anteriores. É amplamente considerado o ápice da imersão e narrativa interativa nos videogames modernos.",
                autor="Arthur Morgan",
                imagem_fundo="uploads/Imagem_de_fundo_RD2.avif"
            )
            db.add(post_rdr2)
            db.commit()
            db.refresh(post_rdr2)
            
            # Adiciona imagens na galeria copiadas da pasta uploads legada
            img1 = DBPostImage(post_id=post_rdr2.id, imagem="uploads/Arthur_nas_montanhas.webp")
            img2 = DBPostImage(post_id=post_rdr2.id, imagem="uploads/Arthur_sol.webp")
            db.add_all([img1, img2])
            db.commit()
    except Exception as e:
        print(f"Erro ao inicializar o banco de dados: {e}")
        db.rollback()
    finally:
        db.close()
