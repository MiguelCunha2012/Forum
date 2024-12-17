<?php
session_start();
include 'conexao.php';

if (!isset($_SESSION['id']) || $_SESSION['tipo'] !== "view") {
    header("Location: login.php");
    exit;
}

$post_id = $_GET['id'] ?? 0;

$sql = "SELECT * FROM posts WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $post_id);
$stmt->execute();
$result = $stmt->get_result();
$post = $result->fetch_assoc();

if (!$post) {
    echo "Postagem não encontrada";
    exit;
}

$sql_imagens = "SELECT imagem FROM post_imagens WHERE post_id = ?";
$stmt_imagens = $conn->prepare($sql_imagens);
$stmt_imagens->bind_param("i", $post_id);
$stmt_imagens->execute();
$imagens_result = $stmt_imagens->get_result();
$imagens = $imagens_result->fetch_all(MYSQLI_ASSOC);

$conn->close();
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($post['titulo']) ?></title>
    <style>
        body {
            background-image: url('<?= htmlspecialchars($post['imagem_fundo']) ?>');
            background-size: cover;
            background-repeat: no-repeat;
        }
    </style>
</head>
<body>
    <h1><?= htmlspecialchars($post['titulo']) ?></h1>
    <p><strong>Autor:</strong> <?= htmlspecialchars($post['autor']) ?></p>
    <p><?= nl2br(htmlspecialchars($post['conteudo'])) ?></p>
    <h3>Imagens:</h3>
    <?php if ($imagens): ?>
        <?php foreach ($imagens as $imagem): ?>
            <img src="<?= htmlspecialchars($imagem['imagem']) ?>" alt="Imagem do post" style="max-width: 100%; height: auto; margin-bottom: 10px;">
        <?php endforeach; ?>
    <?php else: ?>
        <p>Não há imagens para esta postagem.</p>
    <?php endif; ?>
</body>
</html>
