const Cliente = require("../models/Cliente");

function validarDados(req, res) {
  const { nome, email } = req.body || {};
  if (typeof nome !== "string" || !nome.trim() || typeof email !== "string" || !email.trim()) {
    res.status(400).json({ erro: "Nome e email são obrigatórios" });
    return null;
  }
  return { nome: nome.trim(), email: email.trim() };
}

async function listar(req, res, next) {
  try { res.json(await Cliente.listar()); } catch (e) { next(e); }
}
async function consultar(req, res, next) {
  try {
    const cliente = await Cliente.consultar(req.params.id);
    if (!cliente) return res.status(404).json({ erro: "Cliente não encontrado" });
    res.json(cliente);
  } catch (e) { next(e); }
}
async function cadastrar(req, res, next) {
  const dados = validarDados(req, res);
  if (!dados) return;
  try { res.status(201).json(await Cliente.cadastrar(dados)); } catch (e) { next(e); }
}
async function alterar(req, res, next) {
  const dados = validarDados(req, res);
  if (!dados) return;
  try {
    const cliente = await Cliente.alterar(req.params.id, dados);
    if (!cliente) return res.status(404).json({ erro: "Cliente não encontrado" });
    res.json(cliente);
  } catch (e) { next(e); }
}
async function excluir(req, res, next) {
  try {
    if (!await Cliente.excluir(req.params.id)) return res.status(404).json({ erro: "Cliente não encontrado" });
    res.json({ mensagem: "Cliente excluído com sucesso" });
  } catch (e) { next(e); }
}
module.exports = { listar, consultar, cadastrar, alterar, excluir };
