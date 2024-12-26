<?php
// Inicia a sessão para verificar se o usuário está autenticado
session_start();
// Inclui o arquivo de conexão com o banco de dados
include 'conexao.php';

// Verifica se o usuário está autenticado e se tem permissão de administrador
if (!isset($_SESSION['id']) || $_SESSION['tipo'] !== 'admin') {
    // Redireciona para a página de login caso não esteja autenticado como administrador
    header("Location: login.php");
    exit;
}

// Inicializa variáveis para mensagens e armazenamento de imagens
$mensagem = "";
$imagem_fundo = "";
$imagens_destino = [];

// Verifica se o formulário foi enviado via método POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Filtra e sanitiza os campos de entrada
    $titulo = filter_input(INPUT_POST, 'titulo', FILTER_SANITIZE_STRING);
    $conteudo = filter_input(INPUT_POST, 'conteudo', FILTER_SANITIZE_STRING);
    $autor = filter_input(INPUT_POST, 'autor', FILTER_SANITIZE_STRING);

    // Verifica se o número de imagens enviadas é maior que 8
    if (isset($_FILES['imagens']) && count($_FILES['imagens']['name']) > 8) {
        $mensagem .= "Por favor, envie no máximo 8 imagens.<br>";
    } else {
        // Processa as imagens enviadas
        if (!empty($_FILES['imagens']['name'][0])) {
            foreach ($_FILES['imagens']['name'] as $key => $imagem_nome) {
                // Verifica se não houve erro no upload da imagem
                if ($_FILES['imagens']['error'][$key] == 0) {
                    $imagem_tmp = $_FILES['imagens']['tmp_name'][$key]; // Caminho temporário da imagem
                    $imagem_ext = strtolower(pathinfo($imagem_nome, PATHINFO_EXTENSION)); // Extensão do arquivo
                    $tipos_permitidos = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif']; // Tipos permitidos

                    // Verifica se o arquivo é uma imagem válida e está no formato permitido
                    $imagem_info = getimagesize($imagem_tmp);
                    if ($imagem_info && in_array($imagem_ext, $tipos_permitidos)) {
                        $imagem_nome_final = uniqid() . '.' . $imagem_ext; // Gera um nome único para a imagem
                        $imagem_destino = 'uploads/' . $imagem_nome_final; // Define o destino da imagem

                        // Move a imagem para o diretório 'uploads'
                        if (move_uploaded_file($imagem_tmp, $imagem_destino)) {
                            $imagens_destino[] = $imagem_destino; // Armazena o caminho da imagem
                            if (empty($imagem_fundo)) {
                                $imagem_fundo = $imagem_destino; // Define a primeira imagem como fundo
                            }
                        }
                    }
                }
            }
        }

        // Verifica se os campos obrigatórios foram preenchidos
        if (!empty($titulo) && !empty($conteudo) && !empty($autor)) {
            // Insere os dados da postagem no banco de dados
            $sql = "INSERT INTO posts (titulo, conteudo, autor, imagem_fundo) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ssss", $titulo, $conteudo, $autor, $imagem_fundo);

            // Verifica se a inserção foi bem-sucedida
            if ($stmt->execute()) {
                $post_id = $stmt->insert_id; // Obtém o ID da postagem criada

                // Insere as imagens relacionadas à postagem no banco de dados
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

// Fecha a conexão com o banco de dados
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
    <!-- Exibe a mensagem de sucesso ou erro -->
    <?php if (!empty($mensagem)): ?>
        <p style="color: green;"><?= htmlspecialchars($mensagem) ?></p>
    <?php endif; ?>
    <!-- Formulário para criar uma nova postagem -->
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
