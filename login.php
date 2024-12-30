<?php
session_start(); // Inicia a sessão para gerenciamento de mensagens e autenticação.
include 'conexao.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") { // Verifica se o método da requisição é POST.
    // Obtém os valores enviados pelo formulário, garantindo que existam.
    $email = isset($_POST['email']) ? $_POST['email'] : '';
    $senha = isset($_POST['senha']) ? $_POST['senha'] : '';

    // Verifica se os campos estão preenchidos.
    if (empty($email) || empty($senha)) {
        $_SESSION['error'] = "Por favor, preencha todos os campos!";
        header("Location: login.php");
        exit;
    }

    // Prepara a consulta SQL para buscar o usuário pelo e-mail.
    $sql = "SELECT id, nome, senha, tipo FROM cadastro WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email); // Substitui o placeholder pelo e-mail.
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) { // Verifica se o e-mail foi encontrado no banco.
        $stmt->bind_result($id, $nome, $senhaHash, $tipo); // Associa as colunas aos parâmetros.
        $stmt->fetch();

        // Verifica se a senha fornecida corresponde ao hash armazenado.
        if (password_verify($senha, $senhaHash)) {
            // Salva os dados do usuário na sessão.
            $_SESSION['id'] = $id;
            $_SESSION['nome'] = $nome;
            $_SESSION['tipo'] = $tipo;

            // Redireciona com base no tipo de usuário.
            if ($tipo === 'admin') {
                header("Location: admin.php");
            } else {
                header("Location: telainicial.php");
            }
            exit;
        } else {
            // Senha incorreta.
            $_SESSION['error'] = "Senha incorreta!";
            header("Location: login.php");
            exit;
        }
    } else {
        // E-mail não encontrado.
        $_SESSION['error'] = "E-mail não encontrado!";
        header("Location: login.php");
        exit;
    }

    // Libera os recursos da consulta.
    $stmt->close();
    $conn->close();
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login de Usuário</title>
    <link rel="stylesheet" href="CSS/login.css">
</head>
<body>
    <!-- Gotas de chuva -->
    <div class="raindrop"></div>
    <div class="raindrop"></div>
    <div class="raindrop"></div>
    <div class="raindrop"></div>
    <div class="raindrop"></div>
    <div class="raindrop"></div>
    <div class="raindrop"></div>
    
    <h2>Login de Usuário</h2>

    <?php
    // Exibe mensagens de erro da sessão, se existirem.
    if (isset($_SESSION['error'])) {
        echo "<p style='color: red;'>" . $_SESSION['error'] . "</p>";
        unset($_SESSION['error']); // Remove a mensagem após exibi-la.
    }
    ?>

    <!-- Formulário de login -->
    <form action="login.php" method="POST">
        <label for="email">E-mail:</label><br>
        <input type="email" id="email" name="email" required><br><br>

        <label for="senha">Senha:</label><br>
        <input type="password" id="senha" name="senha" required><br><br>

        <input type="submit" value="Entrar"><br>
    </form>

    <p>Não tem uma conta? <a href="cadastro.php">Cadastre-se aqui</a></p>
</body>
</html>
