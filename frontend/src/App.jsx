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
  const [chamadoParaExcluir, setChamadoParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

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
    setExcluindo(true);
    setErro("");

    try {
      const resposta = await fetch(
        "http://localhost:3000/chamados/" + chamado.chamado_id,
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

      setChamadoParaExcluir(null);
    } catch (erro) {
      setErro(
        erro instanceof TypeError
          ? "Não foi possível conectar ao servidor. Tente novamente."
          : erro.message,
      );
    } finally {
      setExcluindo(false);
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
                        onClick={() => setChamadoParaExcluir(chamado)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {chamadoParaExcluir && (
            <div
              className="modal-overlay"
              onClick={() => {
                if (!excluindo) {
                  setChamadoParaExcluir(null);
                }
              }}
            >
              <div
                className="modal-confirmacao"
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-modal"
                onClick={(evento) => evento.stopPropagation()}
              >
                <div className="modal-icone">!</div>

                <h2 id="titulo-modal">Excluir chamado?</h2>

                <p>
                  Tem certeza de que deseja excluir este chamado? Essa ação não
                  poderá ser desfeita.
                </p>

                <div className="modal-nome-chamado">
                  #{chamadoParaExcluir.chamado_id} — {chamadoParaExcluir.titulo}
                </div>

                {erro && <p role="alert">Erro: {erro}</p>}

                <div className="modal-acoes">
                  <button
                    type="button"
                    className="botao-cancelar"
                    disabled={excluindo}
                    onClick={() => {
                      setChamadoParaExcluir(null);
                      setErro("");
                    }}
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    className="botao-excluir"
                    disabled={excluindo}
                    onClick={() => excluirChamado(chamadoParaExcluir)}
                  >
                    {excluindo ? "Excluindo..." : "Excluir chamado"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
