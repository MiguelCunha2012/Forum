<?php
session_start();
include 'conexao.php';

if (!isset($_SESSION['id']) || $_SESSION['tipo'] !== 'view') {
    header("Location: login.php");
    exit;
}

$sql = "SELECT id, titulo FROM posts";
$result = $conn->query($sql);
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tela Inicial</title>
</head>
<body>
    <h1>Bem-vindo à Tela Inicial</h1>
    <p>Selecione uma postagem para visualizar:</p>
    <?php if ($result && $result->num_rows > 0): ?>
        <?php while ($row = $result->fetch_assoc()): ?>
            <form action="visualizar_post.php" method="GET" style="margin-bottom: 10px;">
                <input type="hidden" name="id" value="<?= htmlspecialchars($row['id']) ?>">
                <button type="submit"><?= htmlspecialchars($row['titulo']) ?></button>
            </form>
        <?php endwhile; ?>
    <?php else: ?>
        <p>Não há postagens disponíveis no momento.</p>
    <?php endif; ?>
</body>
</html>