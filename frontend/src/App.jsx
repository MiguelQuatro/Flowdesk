import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [chamados, setChamados] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function buscarChamados() {
      try {
        const resposta = await fetch('http://localhost:3000/chamados')
      
        if (!resposta.ok) {
          throw new Error('Não foi possível carregar os chamados.')
        }

        const dados = await resposta.json()
        setChamados(dados)
      } catch (erro) {
        setErro(erro.message)
      } finally {
        setCarregando(false)
      }
    }

    buscarChamados()
  }, [])

  if (carregando) {
    return <p>Carregando chamados...</p>
  }

  if (erro) {
    return <p>Erro: {erro}</p>
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
            <button className="new-ticket">+ Novo chamado</button>
          </div>

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
                </tr>
              </thead>

              <tbody>
                {chamados.map((chamado) => (
                  <tr key={chamado.chamado_id}>
                    <td>#{chamado.chamado_id}</td>
                    <td>{chamado.titulo}</td>
                    <td>{chamado.usuario}</td>
                    <td>
                      <span className={`status ${chamado.status}`}>
                        {chamado.status === "aberto"
                          ? "Aberto"
                          : "Em andamento"}
                      </span>
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
