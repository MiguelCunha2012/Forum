<?php
session_start();
include 'conexao.php';

if (!isset($_SESSION['id']) || $_SESSION['tipo'] !== 'admin') {
    header("Location: login.php");
    exit;
}

$mensagem = "";
$imagem_fundo = "";
$imagens_destino = [];

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $titulo = filter_input(INPUT_POST, 'titulo', FILTER_SANITIZE_STRING);
    $conteudo = filter_input(INPUT_POST, 'conteudo', FILTER_SANITIZE_STRING);
    $autor = filter_input(INPUT_POST, 'autor', FILTER_SANITIZE_STRING);

    if (isset($_FILES['imagens']) && count($_FILES['imagens']['name']) > 8) {
        $mensagem .= "Por favor, envie no máximo 8 imagens.<br>";
    } else {
        if (!empty($_FILES['imagens']['name'][0])) {
            foreach ($_FILES['imagens']['name'] as $key => $imagem_nome) {
                if ($_FILES['imagens']['error'][$key] == 0) {
                    $imagem_tmp = $_FILES['imagens']['tmp_name'][$key];
                    $imagem_ext = strtolower(pathinfo($imagem_nome, PATHINFO_EXTENSION));
                    $tipos_permitidos = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];

                    $imagem_info = getimagesize($imagem_tmp);
                    if ($imagem_info && in_array($imagem_ext, $tipos_permitidos)) {
                        $imagem_nome_final = uniqid() . '.' . $imagem_ext;
                        $imagem_destino = 'uploads/' . $imagem_nome_final;

                        if (move_uploaded_file($imagem_tmp, $imagem_destino)) {
                            $imagens_destino[] = $imagem_destino;
                            if (empty($imagem_fundo)) {
                                $imagem_fundo = $imagem_destino;
                            }
                        }
                    }
                }
            }
        }

        if (!empty($titulo) && !empty($conteudo) && !empty($autor)) {
            $sql = "INSERT INTO posts (titulo, conteudo, autor, imagem_fundo) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ssss", $titulo, $conteudo, $autor, $imagem_fundo);

            if ($stmt->execute()) {
                $post_id = $stmt->insert_id;

                foreach ($imagens_destino as $imagem) {
                    $sql_imagem = "INSERT INTO post_imagens (post_id, imagem) VALUES (?, ?)";
                    $stmt_imagem = $conn->prepare($sql_imagem);
                    $stmt_imagem->bind_param("is", $post_id, $imagem);
                    $stmt_imagem->execute();
                }
                $mensagem .= "Postagem criada com sucesso!";
            } else {
                $mensagem .= "Erro ao criar postagem: " . $stmt->error;
            }
        } else {
            $mensagem .= "Por favor, preencha todos os campos!";
        }
    }
}

$conn->close();
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Criar Postagem</title>
</head>
<body>
    <h1>Criar Postagem</h1>
    <?php if (!empty($mensagem)): ?>
        <p style="color: green;"><?= htmlspecialchars($mensagem) ?></p>
    <?php endif; ?>
    <form action="" method="POST" enctype="multipart/form-data">
        <label for="titulo">Título:</label>
        <input type="text" id="titulo" name="titulo" required>
        <label for="conteudo">Conteúdo:</label>
        <textarea id="conteudo" name="conteudo" rows="5" required></textarea>
        <label for="autor">Autor:</label>
        <input type="text" id="autor" name="autor" required>
        <label for="imagens">Imagens (até 8):</label>
        <input type="file" id="imagens" name="imagens[]" multiple accept="image/*">
        <button type="submit">Criar Postagem</button>
    </form>
</body>
</html>
