<?php
session_start();
include 'conexao.php';

// Verifica se o usuário está autenticado como administrador
if (!isset($_SESSION['id']) || !isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'admin') {
    header("Location: login.php");
    exit;
}

// Verifica se o formulário foi enviado via método POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $action = $_POST['action'] ?? '';

    // Adicionar novo usuário
    if ($action === 'add') {
        $nome = $_POST['nome'] ?? '';
        $email = $_POST['email'] ?? '';
        $senha = $_POST['senha'] ?? '';
        $tipo = $_POST['tipo'] ?? 'view';

        if (!empty($nome) && !empty($email) && !empty($senha)) {
            $senhaHash = password_hash($senha, PASSWORD_BCRYPT);
            $sql = "INSERT INTO cadastro (nome, email, senha, tipo) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ssss", $nome, $email, $senhaHash, $tipo);
            $stmt->execute();
        }
    }

    // Editar usuário existente
    if ($action === 'edit') {
        $id = $_POST['id'] ?? 0;
        $nome = $_POST['nome'] ?? '';
        $email = $_POST['email'] ?? '';
        $tipo = $_POST['tipo'] ?? 'view';

        if (!empty($id) && !empty($nome) && !empty($email)) {
            $sql = "UPDATE cadastro SET nome = ?, email = ?, tipo = ? WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("sssi", $nome, $email, $tipo, $id);
            $stmt->execute();
        }
    }

    // Excluir usuário
    if ($action === 'delete') {
        $id = $_POST['id'] ?? 0;
        if (!empty($id)) {
            $sql = "DELETE FROM cadastro WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
        }
    }

    header("Location: crud.php");
    exit;
}

// Recupera todos os usuários cadastrados
$sql = "SELECT id, nome, email, tipo FROM cadastro";
$result = $conn->query($sql);
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerenciamento de Usuários</title>
    <link rel="stylesheet" href="CSS/crud.css">
</head>
<body>
    <h1>Gerenciamento de Usuários</h1>
    <a href="telaInicial.php">Voltar para a tela inicial</a>
    <hr>

    <!-- Formulário de adição de usuários -->
    <h2>Adicionar Novo Usuário</h2>
    <form action="crud.php" method="POST">
        <input type="hidden" name="action" value="add">
        <label for="nome">Nome:</label><br>
        <input type="text" id="nome" name="nome" required><br>
        <label for="email">E-mail:</label><br>
        <input type="email" id="email" name="email" required><br>
        <label for="senha">Senha:</label>
        <input type="password" id="senha" name="senha" required><br>
        <label for="tipo">Função:</label>
        <select name="tipo" id="tipo">
            <option value="view">View</option>
            <option value="admin">Admin</option>
        </select><br><br>
        <input type="submit" value="Adicionar Usuário">
    </form>
    <hr>

    <!-- Tabela de usuários -->
    <h2>Lista de Usuários</h2>
    <table>
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
            <?php while ($row = $result->fetch_assoc()): ?>
                <tr>
                    <td><?= $row['id'] ?></td>
                    <td><?= htmlspecialchars($row['nome']) ?></td>
                    <td><?= htmlspecialchars($row['email']) ?></td>
                    <td><?= htmlspecialchars($row['tipo']) ?></td>
                    <td>
                        <div class="action-buttons">
                            <form action="crud.php" method="POST">
                                <input type="hidden" name="action" value="edit">
                                <input type="hidden" name="id" value="<?= $row['id'] ?>">
                                <input type="text" name="nome" value="<?= htmlspecialchars($row['nome']) ?>" required>
                                <input type="email" name="email" value="<?= htmlspecialchars($row['email']) ?>" required>
                                <select name="tipo">
                                    <option value="view" <?= $row['tipo'] === 'view' ? 'selected' : '' ?>>View</option>
                                    <option value="admin" <?= $row['tipo'] === 'admin' ? 'selected' : '' ?>>Admin</option>
                                </select>
                                <button class="edit-button" type="submit">Editar</button>
                            </form>
                            <form action="crud.php" method="POST">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="id" value="<?= $row['id'] ?>">
                                <button class="delete-button" type="submit">Excluir</button>
                            </form>
                        </div>
                    </td>
                </tr>
            <?php endwhile; ?>
        </tbody>
    </table>
</body>
</html>
