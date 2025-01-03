<?php
session_start(); // Inicia a sessão para acessar as variáveis de sessão.
include 'conexao.php';

// Verifica se o usuário está autenticado e tem o tipo "admin". Caso contrário, redireciona para o login.
if (!isset($_SESSION['id']) || $_SESSION['tipo'] !== "admin") {
    header("Location: login.php");
    exit;
}

// Processa o envio de uma nova postagem, incluindo o upload de imagens.
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Recupera o título e conteúdo do formulário.
    $titulo = $_POST['titulo'];
    $conteudo = $_POST['conteudo'];

    // Prepara e executa a consulta SQL para inserir a postagem no banco de dados.
    $sql = "INSERT INTO posts (titulo, conteudo) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $titulo, $conteudo);
    $stmt->execute();

    // Pega o ID da postagem recém-criada.
    $post_id = $stmt->insert_id;

    // Verifica se o campo de imagem foi preenchido e se é uma imagem válida.
    if (isset($_FILES['imagem']) && count($_FILES['imagem']['name']) > 0) {
        $file_count = count($_FILES['imagem']['name']); // Contagem de imagens enviadas

        // Limita o número de imagens para 8
        $max_images = 8;
        if ($file_count > $max_images) {
            echo "Você pode enviar no máximo 8 imagens.";
        } else {
            // Itera sobre cada arquivo de imagem enviado
            for ($i = 0; $i < $file_count; $i++) {
                // Recupera as informações de cada arquivo
                $file_name = $_FILES['imagem']['name'][$i];
                $file_tmp = $_FILES['imagem']['tmp_name'][$i];
                $file_size = $_FILES['imagem']['size'][$i];
                $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

                // Tipos permitidos de imagem
                $allowed_ext = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif']; // Adicionado 'webp'

                // Verifica se a extensão do arquivo é permitida
                if (in_array($file_ext, $allowed_ext)) {
                    // Verifica o tamanho do arquivo (2MB como limite)
                    if ($file_size <= 2 * 1024 * 1024) { // 2MB
                        // Diretório para salvar a imagem
                        $upload_dir = 'uploads/';
                        $upload_path = $upload_dir . basename($file_name);

                        // Move o arquivo para o diretório de uploads
                        if (move_uploaded_file($file_tmp, $upload_path)) {
                            // Insere o caminho da imagem na tabela 'post_imagens'
                            $sql_imagem = "INSERT INTO post_imagens (post_id, imagem) VALUES (?, ?)";
                            $stmt_imagem = $conn->prepare($sql_imagem);
                            $stmt_imagem->bind_param("is", $post_id, $upload_path);
                            $stmt_imagem->execute();
                        } else {
                            echo "Erro ao mover o arquivo para o diretório de uploads.";
                        }
                    } else {
                        echo "O arquivo " . $file_name . " excede o tamanho máximo permitido de 2MB.";
                    }
                } else {
                    echo "O arquivo " . $file_name . " não é um arquivo de imagem válido (somente JPG, JPEG, PNG, GIF, WebP).";
                }
            }
        }
    }

    // Mensagem de sucesso
    $_SESSION['postagem_criada'] = "Postagem criada com sucesso!";

    // Redireciona de volta para a mesma página
    header("Location: editorDePaginas.php");
    exit;
}

// Exibe a mensagem de postagem criada, se houver.
if (isset($_SESSION['postagem_criada'])) {
    echo "<p>" . $_SESSION['postagem_criada'] . "</p>";
    unset($_SESSION['postagem_criada']); // Limpa a mensagem após exibi-la
}
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Criar Postagem</title>
    <link rel="stylesheet" href="CSS/editorDePaginas.css">
</head>
<body>
    <h1>Criar Nova Postagem</h1>
    <form action="" method="POST" enctype="multipart/form-data">
        <label for="titulo">Título:</label>
        <input type="text" id="titulo" name="titulo" required><br>

        <label for="conteudo">Conteúdo:</label>
        <textarea id="conteudo" name="conteudo" rows="5" required></textarea><br>

        <label for="imagem">Imagens (máximo de 8):</label>
        <input type="file" id="imagem" name="imagem[]" accept="image/*" multiple><br>

        <button type="submit">Criar Postagem</button>
    </form>
</body>
</html>
