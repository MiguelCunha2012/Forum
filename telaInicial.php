<?php
session_start(); // Inicia a sessão para acessar variáveis de sessão.
include 'conexao.php';

// Verifica se o usuário está autenticado e tem o tipo 'view'.
// Caso contrário, redireciona para a página de login.
if (!isset($_SESSION['id']) || $_SESSION['tipo'] !== 'view') {
    header("Location: login.php");
    exit;
}

// Consulta para buscar o ID e o título de todas as postagens disponíveis.
$sql = "SELECT id, titulo FROM posts";
$result = $conn->query($sql); // Executa a consulta.
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tela Inicial</title>
    <link rel="stylesheet" href="CSS/telaInicial.css">

</head>
<body>
    <!-- Cabeçalho da página -->
    <h1>Bem-vindo à Tela Inicial</h1>
    <p>Selecione uma postagem para visualizar:</p>

    <!-- Verifica se a consulta retornou resultados -->
    <?php if ($result && $result->num_rows > 0): ?>
        <!-- Itera sobre cada postagem retornada pela consulta -->
        <?php while ($row = $result->fetch_assoc()): ?>
            <form action="visualizar_post.php" method="GET" style="margin-bottom: 10px;">
                <!-- Campo oculto com o ID da postagem -->
                <input type="hidden" name="id" value="<?= htmlspecialchars($row['id']) ?>">
                <!-- Botão com o título da postagem -->
                <button type="submit"><?= htmlspecialchars($row['titulo']) ?></button>
            </form>
        <?php endwhile; ?>
    <?php else: ?>
        <!-- Exibe mensagem caso não haja postagens -->
        <p>Não há postagens disponíveis no momento.</p>
    <?php endif; ?>
</body>
</html>
