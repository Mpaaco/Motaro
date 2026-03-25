# 🔧 MotaroApp

Sistema de gestão de clientes e serviços para a **Morrone's Mecânica**. Controle de solicitações, status de serviços e financeiro — tudo em um só lugar.

---

## 🚀 Como rodar

### Pré-requisitos
- Node.js instalado
- Conta no MongoDB Atlas com cluster ativo

### Configuração

1. Clone o repositório e instale as dependências:
```bash
npm install
```

2. Crie o arquivo `.env` na raiz com:
```env
MONGODB_URI=mongodb+srv://<usuario>:<senha>@<cluster>.mongodb.net/?appName=<app>
PORT=3000
```

3. **(Somente na primeira vez, se houver clientes antigos)** Rode o script de migração:
```bash
node server/migrate.js
```

4. Inicie o servidor:
```bash
npm start
```

5. Acesse: [http://localhost:3000](http://localhost:3000)

---

## 📁 Estrutura

```
MotaroApp/
├── server/
│   ├── models/
│   │   ├── Client.js          # Modelo de cliente (suporte a múltiplos veículos)
│   │   └── ServiceRecord.js   # Modelo de solicitação de serviço
│   ├── routes/
│   │   ├── clients.js         # API de clientes
│   │   └── records.js         # API de registros
│   ├── server.js              # Servidor Express
│   └── migrate.js             # Script de migração (roda uma vez)
├── js/
│   ├── utils/
│   │   ├── api.js             # Funções de fetch centralizadas
│   │   ├── masks.js           # Máscaras de input
│   │   └── validators.js      # Validações
│   ├── home.js                # Lógica da home (modais, tags, contador)
│   ├── cadastro.js            # Cadastro de cliente
│   ├── registro.js            # Registro de solicitação (seleção de veículo)
│   ├── solicitacoes.js        # Página de gestão de solicitações
│   ├── financeiro.js          # Dashboard financeiro
│   └── main.js                # Menu hamburguer e loading screen
├── style/
│   ├── global/global.css
│   └── pages/                 # CSS por página
├── index.html                 # Home
├── cadastro.html              # Cadastro de cliente
├── registro.html              # Registro de solicitação
├── solicitacoes.html          # Gestão de solicitações
└── financeiro.html            # Controle financeiro
```

---

## ✨ Funcionalidades

### Cadastro de Clientes
- Cadastro com nome, CPF, contato e veículo (marca, modelo, ano, placa)
- Suporte a **múltiplos veículos** por CPF

### Registro de Solicitação
- Busca de cliente por CPF
- Seleção de veículo existente ou adição de novo carro
- Placa preenchida automaticamente ao selecionar veículo
- Upload de até 4 fotos (câmera ou galeria → Base64)
- Campos: título (obrigatório), descrição, valor, forma de pagamento, prazo

### Home
- Contador dinâmico de carros na fila ("Em andamento")
- Cards de solicitações com tags clicáveis de **status** e **pagamento**
- Modal de detalhe do registro com lightbox para fotos
- Agenda semanal

### Solicitações
- Grid de clientes com busca por CPF
- **Modal 1:** lista de solicitações do cliente com tags e exclusão
- **Modal 2:** detalhe completo com fotos e lightbox
- Fechar com ESC ou clique fora

### Tags Interativas (em todas as telas)
| Tag | Cores | Alterna para |
|---|---|---|
| `Em andamento` | Amarelo | `Finalizado` |
| `Finalizado` | Verde | `Em andamento` |
| `Não pago` | Vermelho claro | `Pago` |
| `Pago` | Verde | `Não pago` |

### Financeiro
- Cards: Total recebido · Mês atual · Ano atual · A receber
- Filtros por ano, mês e pagamento
- Gráfico de barras ou linha (Chart.js)
- Tabela detalhada de registros
- Exportação **CSV** e **Excel (.xlsx)**

---

## 🛠️ Tech Stack

| Camada | Tecnologia |
|---|---|
| Backend | Node.js, Express, Mongoose |
| Banco de dados | MongoDB Atlas |
| Frontend | HTML, CSS, JavaScript (ES Modules) |
| Gráficos | Chart.js (CDN) |
| Exportação Excel | SheetJS (CDN) |
| Fontes | Google Fonts (Montserrat) |

---

## 🎨 Paleta de Cores

| Cor | Uso |
|---|---|
| `#7AD95F` | Verde primário (ações, destaques) |
| `#0D0D0D` | Texto principal |
| `#FAFAFA` | Fundo das páginas |
| `#F5F5F5` | Fundo de cards |
| `#FFD700` | Tag "Em andamento" |
| `#A8E6A3` | Tag "Finalizado" / "Pago" |
| `#FFE0E0` | Tag "Não pago" |
