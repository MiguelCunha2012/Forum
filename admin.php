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
    <link rel="stylesheet" href="CSS/rain.css">
</head>
<script>
    // Função para gerar gotas de chuva
    function gerarChuva() {
    const quantidade = 30; // Quantidade de gotas
    const container = document.body;

    for (let i = 0; i < quantidade; i++) {
        const raindrop = document.createElement('div');
        raindrop.classList.add('raindrop');
        
        // Posicionamento horizontal aleatório
        raindrop.style.left = `${Math.random() * 100}vw`; 
        
        // Posicionamento vertical fora da tela no topo
        raindrop.style.top = `${-Math.random() * 50}vh`; 
        
        // Duração da animação aleatória
        raindrop.style.animationDuration = `${Math.random() * 2 + 2}s`; // Duração entre 2 e 4 segundos
        // Atraso para a animação começar de forma aleatória
        raindrop.style.animationDelay = `${Math.random() * 3}s`; 
        
        container.appendChild(raindrop);
    }
}

// Chama a função para gerar a chuva quando a página carregar
window.onload = function() {
    gerarChuva();
};
</script>
<body>
    <h1> <?php echo $_SESSION['nome']; ?>, o que você deseja fazer ?</h1>
    <!-- Botões com estilo aplicado -->
    <button class="botao" onclick="window.location.href='crud.php'">Ir para Usuários</button>
    <button class="botao" onclick="window.location.href='editorDePaginas.php'">Escrever nova matéria</button>
    <a href="logout.php">Sair</a>
</body>
</html>
