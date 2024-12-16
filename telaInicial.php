<?php
session_start();
if (!isset ($_SESSION['tipo']) || $_SESSION['tipo'] !== 'view'){
    header ("Location: login.php");
    exit;
}
?>
<h1>Bem-vindo, Espectador <?php echo $_SESSION['nome']; ?></h1>
<a href="logout.php">Sair</a>