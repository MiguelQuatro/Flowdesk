# Flowdesk

Sistema de gestão de chamados e atendimento interno para organizar demandas, priorizar pendências e acompanhar o andamento das solicitações em um único ambiente.

🚧 Status: em desenvolvimento. A API de usuários e chamados e a interface básica já funcionam. Autenticação, filtros e testes estão no roadmap.

## Problema

Quando a operação cresce, solicitações começam a aparecer em mensagens, planilhas, e-mails e atendimento manual. Isso gera perda de contexto, atrasos, retrabalho e dificuldade para saber o que já foi resolvido.

O Flowdesk centraliza esse processo em uma API e em um painel simples para registrar usuários, criar chamados e acompanhar o status das demandas em um único lugar.

## Funcionalidades

### Já implementado
- [x] CRUD de usuários
- [x] Criação e listagem de chamados
- [x] Atualização de status (aberto, em_andamento, resolvido)
- [x] Relacionamento usuário → chamados (1:N)

### Em andamento / planejado
- [ ] Autenticação (JWT + bcrypt)
- [ ] Filtros por status, usuário e data
- [ ] Histórico de alterações do chamado
- [ ] Testes automatizados

## Stack tecnológica

- Node.js
- Express
- MySQL
- mysql2
- dotenv
- CORS
- React
- Vite

## Como rodar

### 1) Clone o projeto

```bash
git clone https://github.com/MiguelQuatro/Flowdesk.git
cd Flowdesk
```

### 2) Instale as dependências

```bash
npm install
```

### 3) Configure o ambiente

Crie o arquivo `.env` na raiz do projeto com base no exemplo:

```bash
cp .env.example .env
```

Exemplo de configuração:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=flowdesk
PORT=3000
```

> O arquivo `.env` fica localmente e não deve ser enviado ao repositório.

### 4) Crie o banco de dados

No MySQL, execute:

```sql
CREATE DATABASE flowdesk;

USE flowdesk;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE chamados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT,
  status ENUM('aberto', 'em_andamento', 'resolvido') NOT NULL DEFAULT 'aberto',
  usuario_id INT NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

### 5) Inicie a API

```bash
npm start
```

A API ficará disponível em:

```text
http://localhost:3000
```

### 6) Inicie o frontend

```bash
cd frontend
npm install
npm run dev
```

A interface ficará disponível em:

```text
http://localhost:5173
```

## Estrutura do projeto

```text
Flowdesk/
├── .env.example
├── .gitignore
├── README.md
├── db.js
├── package.json
├── server.js
├── routes/
│   └── usuarios.js
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   └── public/
└── .env  (criado localmente, ignorado pelo Git)
```

## API

### Rotas principais

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Verifica se a API está funcionando |
| GET | `/usuarios` | Lista usuários |
| POST | `/usuarios` | Cria usuário |
| GET | `/usuarios/:id` | Busca usuário por ID |
| PUT | `/usuarios/:id` | Atualiza usuário |
| DELETE | `/usuarios/:id` | Remove usuário |
| GET | `/chamados` | Lista chamados |
| POST | `/chamados` | Cria chamado |
| PUT | `/chamados/:id` | Atualiza chamado inteiro |
| PATCH | `/chamados/:id` | Atualiza parcialmente |
| DELETE | `/chamados/:id` | Remove chamado |

## Modelo de dados

### Usuários
- id
- nome
- ativo

### Chamados
- id
- titulo
- descricao
- status
- usuario_id

### Relacionamento

```text
usuarios 1 ─── N chamados
```

## Segurança e boas práticas

O projeto ainda está em fase inicial e, por isso, não possui autenticação por JWT, sessão ou hash de senha.

Recomendações para evolução:

- implementar autenticação com JWT ou sessão
- usar bcrypt para armazenar senhas
- manter credenciais em `.env`
- validar permissões por perfil de usuário
- proteger rotas sensíveis com middleware de autenticação

> Importante: nunca deixe senhas, strings de conexão ou dados sensíveis no código-fonte. Use sempre `.env`.

## Roadmap

- [ ] Implementar autenticação e autorização
- [ ] Separar rotas e controllers em módulos
- [ ] Melhorar visual do frontend com dashboard de chamados
- [ ] Adicionar filtros por status, usuário e data
- [ ] Implementar testes automatizados
- [ ] Histórico de alterações do chamado

## Decisões técnicas

### Por que Node.js + Express?

Porque oferece uma API leve, rápida e fácil de evoluir para integrações futuras.

### Por que MySQL?

Porque o problema tem relação direta entre usuários e chamados, e isso combina bem com um modelo relacional simples.

### Por que React + Vite?

Porque facilita a criação de uma interface moderna, responsiva e de desenvolvimento ágil.

## Demonstração

O projeto pode ser demonstrado em ambiente local com os seguintes passos:

1. criar usuário
2. criar chamado
3. alterar status para `em_andamento`
4. finalizar o chamado

Exemplo de dados fictícios:

- Nome do usuário: `Usuário Demo`
- Status: `aberto`

> Os dados acima são ilustrativos e devem ser usados apenas em ambiente local de testes.

## Autor

Miguel Quatro

- GitHub: https://github.com/MiguelQuatro

---

Flowdesk foi pensado para organizar demandas e melhorar o controle de chamados em um ambiente simples, fácil de entender e pronto para evoluir.
