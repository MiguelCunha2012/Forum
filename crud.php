<?php
session_start();
include 'conexao.php';

// Verifica se o usuário está autenticado como administrador
if (!isset($_SESSION['id']) || !isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'admin') {
    // Redireciona para a página de login se a autenticação falhar
    header("Location: login.php");
    exit;
}

// Verifica se o formulário foi enviado via método POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $action = $_POST['action'] ?? ''; // Obtém a ação definida no formulário (add, edit ou delete)

    // Adicionar novo usuário
    if ($action === 'add') {
        $nome = $_POST['nome'] ?? ''; // Nome do usuário
        $email = $_POST['email'] ?? ''; // E-mail do usuário
        $senha = $_POST['senha'] ?? ''; // Senha do usuário
        $tipo = $_POST['tipo'] ?? 'view'; // Tipo de usuário (admin ou view)

        // Verifica se os campos obrigatórios estão preenchidos
        if (!empty($nome) && !empty($email) && !empty($senha)) {
            // Gera o hash da senha para armazená-la com segurança no banco de dados
            $senhaHash = password_hash($senha, PASSWORD_BCRYPT);

            // Prepara e executa a consulta para inserir um novo usuário
            $sql = "INSERT INTO cadastro (nome, email, senha, tipo) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ssss", $nome, $email, $senhaHash, $tipo);
            $stmt->execute();
        }
    }

    // Editar usuário existente
    if ($action === 'edit') {
        $id = $_POST['id'] ?? 0; // ID do usuário a ser editado
        $nome = $_POST['nome'] ?? ''; // Nome atualizado
        $email = $_POST['email'] ?? ''; // E-mail atualizado
        $tipo = $_POST['tipo'] ?? 'view'; // Tipo atualizado

        // Verifica se os campos obrigatórios estão preenchidos
        if (!empty($id) && !empty($nome) && !empty($email)) {
            // Prepara e executa a consulta para atualizar o usuário
            $sql = "UPDATE cadastro SET nome = ?, email = ?, tipo = ? WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("sssi", $nome, $email, $tipo, $id);
            $stmt->execute();
        }
    }

    // Excluir usuário existente
    if ($action === 'delete') {
        $id = $_POST['id'] ?? 0; // ID do usuário a ser excluído

        // Verifica se o ID foi fornecido
        if (!empty($id)) {
            // Prepara e executa a consulta para excluir o usuário
            $sql = "DELETE FROM cadastro WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
        }
    }

    // Após qualquer operação, redireciona para evitar o reenvio do formulário
    header("Location: crud.php");
    exit;
}

// Recupera todos os usuários cadastrados para exibição na tabela
$sql = "SELECT id, nome, email, tipo FROM cadastro";
$result = $conn->query($sql);
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerenciamento de Usuários</title>
</head>
<body>
    <h1>Gerenciamento de Usuários</h1>
    <a href="telaInicial.php">Voltar para a tela inicial</a>
    <hr>
    <h2>Adicionar Novo Usuário</h2>
    <!-- Formulário para adicionar novos usuários -->
    <form action="crud.php" method="POST">
        <input type="hidden" name="action" value="add"> <!-- Define a ação como 'add' -->
        <label for="nome">Nome:</label><br>
        <input type="text" id="nome" name="nome" required><br>
        <label for="email">E-mail:</label><br>
        <input type="email" id="email" name="email" required><br>
        <label for="senha">Senha:</label>
        <input type="password" id="senha" name="senha" required><br>
        <label for="tipo">Função:</label>
        <select name="tipo" id="tipo">
            <option value="view">View</option> <!-- Permissão de visualização -->
            <option value="admin">Admin</option> <!-- Permissão de administrador -->
        </select><br><br>
        <input type="submit" value="Adicionar Usuário">
    </form>
    <hr>
    <h2>Lista de Usuários</h2>
    <!-- Tabela para listar os usuários cadastrados -->
    <table border="1">
        <thead>
            <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Função</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
            <?php while ($row = $result->fetch_assoc()): ?> <!-- Loop para exibir cada usuário -->
                <tr>
                    <td><?= $row['id'] ?></td>
                    <td><?= htmlspecialchars($row['nome']) ?></td> <!-- Escapa caracteres especiais para evitar XSS -->
                    <td><?= htmlspecialchars($row['email']) ?></td>
                    <td><?= htmlspecialchars($row['tipo']) ?></td>
                    <td>
                        <!-- Formulário para editar o usuário -->
                        <form action="crud.php" method="POST" style="display:inline-block;">
                            <input type="hidden" name="action" value="edit"> <!-- Define a ação como 'edit' -->
                            <input type="hidden" name="id" value="<?= $row['id'] ?>"> <!-- ID do usuário -->
                            <input type="text" name="nome" value="<?= htmlspecialchars($row['nome']) ?>" required>
                            <input type="email" name="email" value="<?= htmlspecialchars($row['email']) ?>" required>
                            <select name="tipo">
                                <option value="view" <?= $row['tipo'] === 'view' ? 'selected' : '' ?>>View</option>
                                <option value="admin" <?= $row['tipo'] === 'admin' ? 'selected' : '' ?>>Admin</option>
                            </select>
                            <button type="submit">Editar</button>
                        </form>
                        <!-- Formulário para excluir o usuário -->
                        <form action="crud.php" method="POST" style="display:inline-block;">
                            <input type="hidden" name="action" value="delete"> <!-- Define a ação como 'delete' -->
                            <input type="hidden" name="id" value="<?= $row['id'] ?>"> <!-- ID do usuário -->
                            <button type="submit" onclick="return confirm('Tem certeza que deseja excluir este usuário?');">Excluir</button>
                        </form>
                    </td>
                </tr>
            <?php endwhile; ?>
        </tbody>
    </table>
</body>
</html>
