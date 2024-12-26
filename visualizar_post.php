<?php
session_start(); // Inicia a sessão para acessar as variáveis de sessão.
include 'conexao.php';

// Verifica se o usuário está autenticado e tem o tipo "view". Caso contrário, redireciona para o login.
if (!isset($_SESSION['id']) || $_SESSION['tipo'] !== "view") {
    header("Location: login.php");
    exit;
}

// Obtém o ID do post a partir do parâmetro da URL. Se não estiver definido, assume 0.
$post_id = $_GET['id'] ?? 0;

// Prepara e executa uma consulta SQL para buscar os detalhes do post pelo ID.
$sql = "SELECT * FROM posts WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $post_id); // Substitui o placeholder "?" pelo ID do post.
$stmt->execute();
$result = $stmt->get_result();
$post = $result->fetch_assoc(); // Busca os dados da postagem.

// Verifica se o post existe. Caso contrário, exibe uma mensagem e encerra o script.
if (!$post) {
    echo "Postagem não encontrada";
    exit;
}

// Prepara e executa uma consulta SQL para buscar as imagens associadas ao post.
$sql_imagens = "SELECT imagem FROM post_imagens WHERE post_id = ?";
$stmt_imagens = $conn->prepare($sql_imagens);
$stmt_imagens->bind_param("i", $post_id);
$stmt_imagens->execute();
$imagens_result = $stmt_imagens->get_result();
$imagens = $imagens_result->fetch_all(MYSQLI_ASSOC); // Obtém todas as imagens como um array associativo.

$conn->close(); // Fecha a conexão com o banco de dados.
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Exibe o título da postagem no título da página -->
    <title><?= htmlspecialchars($post['titulo']) ?></title>
    <style>
        body {
            /* Define uma imagem de fundo com a URL armazenada no banco de dados */
            background-image: url('<?= htmlspecialchars($post['imagem_fundo']) ?>');
            background-size: cover; /* Ajusta o tamanho da imagem para cobrir todo o fundo */
            background-repeat: no-repeat; /* Evita repetição da imagem */
        }
    </style>
</head>
<body>
    <!-- Exibe o título da postagem -->
    <h1><?= htmlspecialchars($post['titulo']) ?></h1>
    <!-- Exibe o autor da postagem -->
    <p><strong>Autor:</strong> <?= htmlspecialchars($post['autor']) ?></p>
    <!-- Exibe o conteúdo da postagem, preservando quebras de linha -->
    <p><?= nl2br(htmlspecialchars($post['conteudo'])) ?></p>
    <h3>Imagens:</h3>
    <!-- Verifica se há imagens associadas -->
    <?php if ($imagens): ?>
        <!-- Exibe cada imagem em uma tag <img> -->
        <?php foreach ($imagens as $imagem): ?>
            <img src="<?= htmlspecialchars($imagem['imagem']) ?>" alt="Imagem do post" style="max-width: 100%; height: auto; margin-bottom: 10px;">
        <?php endforeach; ?>
    <?php else: ?>
        <!-- Caso não haja imagens, exibe uma mensagem -->
        <p>Não há imagens para esta postagem.</p>
    <?php endif; ?>
</body>
</html>
