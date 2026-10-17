// Para rodar o servidor, execute o comando: node server.js
const express = require('express');
const db = require('./db');
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Flowdesk API funcionando!");
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

app.get("/usuarios", async (req, res) => {
    try {
        const [usuarios] = await db.query(
            "SELECT id, nome, ativo FROM usuarios"
        );

        res.json(usuarios);
    } catch (error) {
        console.error("Erro ao consultar usuários:", error.message);

        res.status(500).json({
            error: "Erro interno ao consultar usuários."
        });
    }
});
// Conexão com o banco de dados MySQL
app.post("/usuarios", async (req, res) => {
    const { nome } = req.body;

    if (typeof nome !== "string" || nome.trim() === "") {
        return res.status(400).json({
            erro: "O nome é obrigatório."
        });
    }

    try {
        const [resultado] = await db.execute(
            "INSERT INTO usuarios (nome) VALUES (?)",
            [nome.trim()]
        );

        res.status(201).json({
            id: resultado.insertId,
            nome: nome.trim()
        });
    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error.message);

        res.status(500).json({
            erro: "Erro interno ao cadastrar usuários."
        });
    }
});

//Consulta de usuários ativos

app.get("/usuarios/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400). json({
            erro: "ID inválido."
        });
    }

    try {
        const [usuarios] = await db.execute(
            "SELECT id, nome, ativo FROM usuarios WHERE id = ?",
            [id]
        );
        if (usuarios.length === 0) {
            return res.status(404).json({
                erro: "Usuário não encontrado."
            });
        }

        res.json(usuarios[0]);
    } catch (error) {
        console.error("Erro ao consultar usuário:", error.message);

        res.status(500).json({
            erro: "Erro interno ao consultar usuário."
        });
    }
});