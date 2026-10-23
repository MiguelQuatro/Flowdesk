// Importação de dependencias
const express = require("express");
const cors = require('cors')
const db = require("./db");
const app = express();
app.use(cors())
app.use(express.json());

//Funções Auxiliares

function idValido(id) {
  return Number.isInteger(id) && id > 0;
}

function tituloValido(titulo) {
  return (
    typeof titulo === "string" &&
    titulo.trim() !== "" &&
    titulo.trim().length <= 150
  );
}

function statusValido(status) {
  const statusPermitidos = ["aberto", "em_andamento", "resolvido"];

  return statusPermitidos.includes(status);
}

// Rotas

app.get("/", (req, res) => {
  res.send("Flowdesk API funcionando!");
});

// Chamados

app.get("/chamados", async (req, res) => {
  try {
    const [chamados] = await db.execute(
      `SELECT
            c.id AS chamado_id,
            c.titulo,
            c.descricao,
            c.status,
            u.id AS usuario_id,
            u.nome AS usuario
        FROM chamados AS c
        INNER JOIN usuarios AS u
            ON c.usuario_id = u.id`,
    );

    res.json(chamados);
  } catch (error) {
    console.error("Erro ao consultar chamados:", error.message);

    res.status(500).json({
      erro: "Erro interno ao consultar chamados.",
    });
  }
});

app.post("/chamados", async (req, res) => {
  const { titulo, descricao, usuario_id } = req.body;

  if (typeof titulo !== "string" || titulo.trim() === "") {
    return res.status(400).json({
      erro: "O título é obrigatório.",
    });
  }

  if (titulo.trim().length > 150) {
    return res.status(400).json({
      erro: "O título não pode exceder 150 caracteres.",
    });
  }

  if (
    descricao !== undefined &&
    descricao !== null &&
    typeof descricao !== "string"
  ) {
    return res.status(400).json({
      erro: "A descrição deve ser um texto.",
    });
  }

  if (
    typeof usuario_id !== "number" ||
    !Number.isInteger(usuario_id) ||
    usuario_id <= 0
  ) {
    return res.status(400).json({
      erro: "O ID do usuário deve ser um número inteiro positivo.",
    });
  }

  try {
    const [usuario] = await db.execute("SELECT id FROM usuarios WHERE id = ?", [
      usuario_id,
    ]);

    if (usuario.length === 0) {
      return res.status(404).json({
        erro: "Usuário não encontrado.",
      });
    }

    const [resultado] = await db.execute(
      `INSERT INTO chamados (titulo, descricao, usuario_id)
             VALUES (?, ?, ?)`,
      [titulo.trim(), descricao ?? null, usuario_id],
    );

    return res.status(201).json({
      mensagem: "Chamado criado com sucesso.",
      chamado: {
        id: resultado.insertId,
        titulo: titulo.trim(),
        descricao: descricao ?? null,
        status: "aberto",
        usuario_id,
      },
    });
  } catch (error) {
    console.error("Erro ao processar chamado:", error.message);

    return res.status(500).json({
      erro: "Erro interno ao cadastrar chamado.",
    });
  }
});

app.put("/chamados/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { titulo, descricao, status } = req.body;

  if (!idValido(id)) {
    return res.status(400).json({
      erro: "ID inválido.",
    });
  }

  if (!tituloValido(titulo)) {
    return res.status(400).json({
      erro: "Título inválido. Informe um texto não vazio de até 150 caracteres.",
    });
  }

  if (
    descricao !== undefined &&
    descricao !== null &&
    typeof descricao !== "string"
  ) {
    return res.status(400).json({
      erro: "A descrição deve ser um texto.",
    });
  }

  if (!statusValido(status)) {
    return res.status(400).json({
      erro: "Status inválido.",
    });
  }

  try {
    const [chamados] = await db.execute(
      "SELECT id FROM chamados WHERE id = ?",
      [id],
    );

    if (chamados.length === 0) {
      return res.status(404).json({
        erro: "Chamado não encontrado.",
      });
    }

    await db.execute(
      `UPDATE chamados
             SET titulo = ?, descricao = ?, status = ?
             WHERE id = ?`,
      [titulo.trim(), descricao ?? null, status, id],
    );

    return res.status(200).json({
      mensagem: "Chamado atualizado com sucesso.",
      chamado: {
        id,
        titulo: titulo.trim(),
        descricao: descricao ?? null,
        status,
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar chamado:", error.message);

    return res.status(500).json({
      erro: "Erro interno ao atualizar chamado.",
    });
  }
});

// Atualização de status do chamado

app.patch("/chamados/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { titulo, descricao, status } = req.body;

  if (!idValido(id)) {
    return res.status(400).json({
      erro: "ID do chamado inválido.",
    });
  }

  if (titulo === undefined && descricao === undefined && status === undefined) {
    return res.status(400).json({
      erro: "Informe pelo menos um campo para atualizar.",
    });
  }

  if (titulo !== undefined && !tituloValido(titulo)) {
    return res.status(400).json({
      erro: "Título inválido. Informe um texto não vazio de até 150 caracteres.",
    });
  }

  if (
    descricao !== undefined &&
    descricao !== null &&
    typeof descricao !== "string"
  ) {
    return res.status(400).json({
      erro: "A descrição deve ser um texto.",
    });
  }

  if (status !== undefined && !statusValido(status)) {
    return res.status(400).json({
      erro: "Status inválido.",
    });
  }

  try {
    const [chamados] = await db.execute(
      "SELECT id FROM chamados WHERE id = ?",
      [id],
    );

    if (chamados.length === 0) {
      return res.status(404).json({
        erro: "Chamado não encontrado.",
      });
    }

    const campos = [];
    const valores = [];

    if (titulo !== undefined) {
      campos.push("titulo = ?");
      valores.push(titulo.trim());
    }

    if (descricao !== undefined) {
      campos.push("descricao = ?");
      valores.push(descricao);
    }

    if (status !== undefined) {
      campos.push("status = ?");
      valores.push(status);
    }

    valores.push(id);

    await db.execute(
      `UPDATE chamados
             SET ${campos.join(", ")}
             WHERE id = ?`,
      valores,
    );

    return res.status(200).json({
      mensagem: "Chamado atualizado com sucesso.",
      camposAtualizados: campos.map((campo) => campo.split(" = ")[0]),
    });
  } catch (error) {
    console.error("Erro ao atualizar chamado:", error.message);

    return res.status(500).json({
      erro: "Erro interno ao atualizar chamado.",
    });
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

app.get("/usuarios", async (req, res) => {
  try {
    const [usuarios] = await db.query("SELECT id, nome, ativo FROM usuarios");

    res.json(usuarios);
  } catch (error) {
    console.error("Erro ao consultar usuários:", error.message);

    res.status(500).json({
      error: "Erro interno ao consultar usuários.",
    });
  }
});

// Conexão com o banco de dados MySQL
app.post("/usuarios", async (req, res) => {
  const { nome } = req.body;

  if (typeof nome !== "string" || nome.trim() === "") {
    return res.status(400).json({
      erro: "O nome é obrigatório.",
    });
  }

  try {
    const [resultado] = await db.execute(
      "INSERT INTO usuarios (nome) VALUES (?)",
      [nome.trim()],
    );

    res.status(201).json({
      id: resultado.insertId,
      nome: nome.trim(),
    });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error.message);

    res.status(500).json({
      erro: "Erro interno ao cadastrar usuários.",
    });
  }
});

//Consulta de usuários ativos

app.get("/usuarios/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!idValido(id)) {
    return res.status(400).json({
      erro: "ID inválido.",
    });
  }

  try {
    const [usuarios] = await db.execute(
      "SELECT id, nome, ativo FROM usuarios WHERE id = ?",
      [id],
    );
    if (usuarios.length === 0) {
      return res.status(404).json({
        erro: "Usuário não encontrado.",
      });
    }

    res.json(usuarios[0]);
  } catch (error) {
    console.error("Erro ao consultar usuário:", error.message);

    res.status(500).json({
      erro: "Erro interno ao consultar usuário.",
    });
  }
});

// Atualização de usuário

app.put("/usuarios/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { nome } = req.body;

  if (!idValido(id)) {
    return res.status(400).json({
      erro: "ID inválido.",
    });
  }

  if (typeof nome !== "string" || nome.trim() === "") {
    return res.status(400).json({
      erro: "O nome é obrigatório.",
    });
  }

  try {
    const [resultado] = await db.execute(
      "UPDATE usuarios SET nome = ? WHERE id = ?",
      [nome.trim(), id],
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        erro: "Usuário não encontrado.",
      });
    }

    res.json({
      mensagem: "Usuário atualizado com sucesso.",
      id,
      nome: nome.trim(),
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error.message);

    res.status(500).json({
      erro: "Erro interno ao atualizar usuário.",
    });
  }
});

//Delete de Usuário

app.delete("/usuarios/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!idValido(id)) {
    return res.status(400).json({
      erro: "ID inválido.",
    });
  }

  try {
    const [resultado] = await db.execute("DELETE FROM usuarios WHERE id = ?", [
      id,
    ]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        erro: "Usuário não encontrado.",
      });
    }

    res.json({
      mensagem: "Usuário excluído com sucesso.",
      id,
    });
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        erro: "Não é possível excluir este usuário porque existem chamados vinculados a ele.",
      });
    }

    console.error("Erro ao excluir usuário:", error.message);

    return res.status(500).json({
      erro: "Erro interno ao excluir usuário.",
    });
  }
});

app.delete("/chamados/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!idValido(id)) {
    return res.status(400).json({
      erro: "ID do chamado inválido.",
    });
  }

  try {
    const [resultado] = await db.execute("DELETE FROM chamados WHERE id = ?", [
      id,
    ]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        erro: "Chamado não encontrado.",
      });
    }

    return res.status(200).json({
      mensagem: "Chamado excluído com sucesso.",
      id,
    });
  } catch (error) {
    console.error("Erro ao excluir chamado:", error.message);

    return res.status(500).json({
      erro: "Erro interno ao excluir chamado.",
    });
  }
});
