<?php
session_start();

// Verifica se o tipo de usuário está definido na sessão e se é do tipo 'admin'.
// Caso não seja um administrador ou a variável não esteja configurada, o usuário é redirecionado para a página de login.
if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'admin'){
    header ("Location: login.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Administrador</title>
    <link rel="stylesheet" href="CSS/admin.css">
</head>
<body>
    <h1> <?php echo $_SESSION['nome']; ?>, o que você deseja fazer ?</h1>
    <!-- Botões com estilo aplicado -->
    <button class="botao" onclick="window.location.href='crud.php'">Ir para Usuários</button>
    <button class="botao" onclick="window.location.href='editorDePaginas.php'">Escrever nova matéria</button>
    <a href="logout.php">Sair</a>
</body>
</html>
