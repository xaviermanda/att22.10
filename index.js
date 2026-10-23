
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const clienteRoutes = require("./routes/clienteRoutes");
const Cliente = require("./models/Cliente");

app.get("/api", (req, res) => {
  res.json({
    nome: "API de Clientes",
    versao: "1.1.0",
    descricao: "API REST de clientes com CRUD e integração com Firebase Firestore.",
    endpoints: [
      { metodo: "GET", caminho: "/clientes", descricao: "Lista todos os clientes" },
      { metodo: "GET", caminho: "/clientes/api", descricao: "Retorna os clientes em JSON" },
      { metodo: "GET", caminho: "/clientes/:id", descricao: "Consulta um cliente por ID" },
      { metodo: "POST", caminho: "/clientes", descricao: "Cadastra um cliente (nome, email)" },
      { metodo: "PUT", caminho: "/clientes/:id", descricao: "Altera nome e email de um cliente" },
      { metodo: "DELETE", caminho: "/clientes/:id", descricao: "Exclui um cliente" }
    ],
    exemploCadastro: { nome: "Ana Costa", email: "ana@email.com" }
  });
});

// Lista os clientes em JSON
app.get("/clientes/api", async (req, res) => {
  try {
    const clientes = await Cliente.listar();
    res.json(clientes);
  } catch (e) {
    console.error("ERRO REAL DO FIREBASE:", e);
    res.status(500).json({
      erro: e.message,
      codigo: e.code || "sem código"
    });
  }
});

app.get("/api/clientes", async (req, res) => {
  try {
    res.json(await Cliente.listar());
  } catch (e) {
    console.error("ERRO AO LISTAR CLIENTES:", e);
    res.status(500).json({ erro: e.message, codigo: e.code || "sem código" });
  }
});

app.get("/api/resposta", async (req, res) => {
  try {
    res.json({
      status: "sucesso",
      mensagem: "Resposta JSON da API",
      dados: await Cliente.listar()
    });
  } catch (e) {
    console.error("ERRO NA RESPOSTA DA API:", e);
    res.status(500).json({ erro: e.message, codigo: e.code || "sem código" });
  }
});

app.use("/clientes", clienteRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Tratamento dos demais erros
app.use((err, req, res, next) => {
  console.error("ERRO NA API:", err);
  res.status(500).json({
    erro: err.message || "Erro interno na API.",
    codigo: err.code || "sem código"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor funcionando na porta ${PORT}`);
});
