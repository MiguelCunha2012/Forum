<?php 
session_start(); // Inicia a sessão para armazenamento de mensagens de erro e autenticação.
include 'conexao.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") { // Verifica se o método da requisição é POST.
    // Captura os valores do formulário com validação básica.
    $nome = isset($_POST['nome']) ? $_POST['nome'] : '';
    $email = isset($_POST['email']) ? $_POST['email'] : '';
    $senha = isset($_POST['senha']) ? $_POST['senha'] : '';
    $tipo = isset($_POST['tipo']) ? $_POST['role'] : 'view';

    // Verifica se todos os campos obrigatórios foram preenchidos.
    if (empty($nome) || empty($email) || empty($senha)) {
        $_SESSION['error'] = "Por favor, preencha todos os campos!";
        header("Location: cadastro.php");
        exit;
    }

    // Verifica se o e-mail já está cadastrado.
    $sql = "SELECT COUNT(*) FROM cadastro WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->bind_result($count);
    $stmt->fetch();
    $stmt->close();

    if ($count > 0) { // Caso o e-mail já exista no banco, exibe erro.
        $_SESSION['error'] = "Este e-mail já está cadastrado. Por favor, use outro e-mail.";
        header("Location: cadastro.php");
        exit;
    }

    // Gera o hash da senha para armazenamento seguro no banco.
    $senhaHash = password_hash($senha, PASSWORD_BCRYPT);

    // Insere os dados do novo usuário no banco.
    $sql = "INSERT INTO cadastro (nome, email, senha, tipo) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $nome, $email, $senhaHash, $tipo);

    if ($stmt->execute()) { // Cadastro realizado com sucesso.
        header("Location: login.php");
        exit;
    } else {
        $_SESSION['error'] = "Erro ao cadastrar: " . $stmt->error;
        header("Location: cadastro.php");
        exit;
    }

    $stmt->close();
    $conn->close();
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastro de Usuário</title>
</head>
<body>
    <h2>Cadastro de Usuário</h2>

    <?php
    // Exibe mensagem de erro, se houver.
    if (isset($_SESSION['error'])) {
        echo "<p style='color: red;'>" . $_SESSION['error'] . "</p>";
        unset($_SESSION['error']); // Remove a mensagem após exibi-la.
    }
    ?>

    <!-- Formulário de cadastro -->
    <form action="cadastro.php" method="POST">
        <label for="nome">Nome:</label><br>
        <input type="text" id="nome" name="nome" required><br><br>

        <label for="email">E-mail:</label><br>
        <input type="email" id="email" name="email" required><br><br>

        <label for="senha">Senha:</label><br>
        <input type="password" id="senha" name="senha" required><br><br>

        <input type="submit" value="Cadastrar">
    </form>
</body>
</html>
