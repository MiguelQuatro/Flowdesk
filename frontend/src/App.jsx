import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [chamados, setChamados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function buscarChamados() {
      try {
        const resposta = await fetch("http://localhost:3000/chamados");

        if (!resposta.ok) {
          throw new Error("Não foi possível carregar os chamados.");
        }

        const dados = await resposta.json();
        setChamados(dados);
      } catch (erro) {
        setErro(erro.message);
      } finally {
        setCarregando(false);
      }
    }

    buscarChamados();
  }, []);

  async function criarChamado(evento) {
    evento.preventDefault();
    setSalvando(true);

    try {
      const resposta = await fetch("http://localhost:3000/chamados", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo,
          descricao,
          usuario_id: 1,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Não foi possível criar o chamado.");
      }

      const respostaLista = await fetch("http://localhost:3000/chamados");

      if (!respostaLista.ok) {
        throw new Error(
          "Chamado criado, mas não foi possível atualizar a lista.",
        );
      }

      const listaAtualizada = await respostaLista.json();
      setChamados(listaAtualizada);
      setTitulo("");
      setDescricao("");
      setFormularioAberto(false);
      setErro("");
    } catch (erro) {
      setErro(erro.message);
    } finally {
      setSalvando(false);
    }
  }
  async function alterarStatus(chamado, novoStatus) {
    try {
      const resposta = await fetch(
        `http://localhost:3000/chamados/${chamado.chamado_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            titulo: chamado.titulo,
            descricao: chamado.descricao,
            status: novoStatus,
          }),
        },
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Não foi possível atualizar o status.");
      }

      setChamados((listaAtual) =>
        listaAtual.map((item) =>
          item.chamado_id === chamado.chamado_id
            ? { ...item, status: novoStatus }
            : item,
        ),
      );
    } catch (erro) {
      setErro(erro.message);
    }
  }

  async function excluirChamado(chamado) {
    const confirmar = window.confirm(
      `Deseja realmente excluir o chamado "${chamado.titulo}"?`,
    );

    if (!confirmar) {
      return;
    }

    try {
      const resposta = await fetch(
        `http://localhost:3000/chamados/${chamados.chamado_id}`,
        {
          method: "DELETE",
        },
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Não foi possível excluir o chamado.");
      }

      setChamados((listaAtual) =>
        listaAtual.filter((item) => item.chamado_id !== chamado.chamado_id),
      );
    } catch (erro) {
      window.alert(erro.message);
    }
  }
  if (carregando) {
    return <p>Carregando chamados...</p>;
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Flowdesk</h2>
        <p className="menu-label">MENU PRINCIPAL</p>

        <nav>
          <a className="active" href="#">
            Chamados
          </a>
          <a href="#">Usuários</a>
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <span>Painel de atendimento</span>
          <span>Administrador</span>
        </header>

        <section className="dashboard">
          <div className="page-heading">
            <div>
              <h1>Chamados</h1>
              <p>Acompanhe e gerencie as solicitações.</p>
            </div>

            <button
              className="new-ticket"
              onClick={() => setFormularioAberto(true)}
            >
              + Novo chamado
            </button>
          </div>

          {formularioAberto && (
            <div className="ticket-card">
              <h2>Novo chamado</h2>

              {erro && <p role="alert">Erro: {erro}</p>}

              <form onSubmit={criarChamado}>
                <div className="form-group">
                  <label htmlFor="titulo">Título</label>
                  <input
                    id="titulo"
                    type="text"
                    value={titulo}
                    onChange={(evento) => setTitulo(evento.target.value)}
                    placeholder="Ex.: Erro ao acessar o sistema"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="descricao">Descrição</label>
                  <textarea
                    id="descricao"
                    value={descricao}
                    onChange={(evento) => setDescricao(evento.target.value)}
                    placeholder="Descreva o problema"
                    rows={4}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="new-ticket"
                  disabled={salvando}
                >
                  {salvando ? "Salvando..." : "Criar chamado"}
                </button>

                <button
                  type="button"
                  onClick={() => setFormularioAberto(false)}
                >
                  Fechar
                </button>
              </form>
            </div>
          )}

          <div className="ticket-card">
            <div className="card-heading">
              <h2>Todos os chamados</h2>
              <span>{chamados.length} registros</span>
            </div>

            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Assunto</th>
                  <th>Responsável</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {chamados.map((chamado) => (
                  <tr key={chamado.chamado_id}>
                    <td>#{chamado.chamado_id}</td>
                    <td>{chamado.titulo}</td>
                    <td>{chamado.usuario}</td>
                    <td>
                      <select
                        value={chamado.status}
                        onChange={(evento) =>
                          alterarStatus(chamado, evento.target.value)
                        }
                      >
                        <option value="aberto">Aberto</option>
                        <option value="em_andamento">Em andamento</option>
                        <option value="resolvido">Resolvido</option>
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => excluirChamado(chamado)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
