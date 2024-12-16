<?php
session_start();
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
</head>
<body>
    <h1> <?php echo $_SESSION['nome']; ?>, o que você deseja fazer ?</h1>
    <button onclick="window.location.href='crud.php'">Ir para Usuários</button> <br>
    <button onclick="window.location.href='editorDePaginas.php'">Escrever nova matéria</button> <br>
    <a href="logout.php">Sair</a>
</body>
</html>