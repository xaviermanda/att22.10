const { db } = require("../config/firebase");

let clientesMemoria = [
  { id: 1, nome: "Amanda", email: "amanda@email.com" },
  { id: 2, nome: "Maria", email: "maria@email.com" }
];
let proximoId = 3;
const colecao = () => db.collection("clientes");

async function listar() {
  if (!db) return clientesMemoria;
  const snapshot = await colecao().orderBy("id", "asc").get();
  return snapshot.docs.map(doc => ({ ...doc.data(), id: Number(doc.id) }));
}

async function consultar(id) {
  if (!db) return clientesMemoria.find(c => c.id === Number(id));
  const doc = await colecao().doc(String(id)).get();
  return doc.exists ? { ...doc.data(), id: Number(doc.id) } : undefined;
}

async function cadastrar(dados) {
  if (!db) {
    const cliente = { id: proximoId++, nome: dados.nome, email: dados.email };
    clientesMemoria.push(cliente);
    return cliente;
  }
  const snapshot = await colecao().get();
  const maiorId = snapshot.docs.reduce((maior, doc) => Math.max(maior, Number(doc.id) || 0), 0);
  const id = maiorId + 1;
  const cliente = { id, nome: dados.nome, email: dados.email };
  await colecao().doc(String(id)).set(cliente);
  return cliente;
}

async function alterar(id, dados) {
  if (!db) {
    const cliente = await consultar(id);
    if (!cliente) return null;
    cliente.nome = dados.nome;
    cliente.email = dados.email;
    return cliente;
  }
  const ref = colecao().doc(String(id));
  const doc = await ref.get();
  if (!doc.exists) return null;
  const cliente = { id: Number(id), nome: dados.nome, email: dados.email };
  await ref.set(cliente);
  return cliente;
}

async function excluir(id) {
  if (!db) {
    const indice = clientesMemoria.findIndex(c => c.id === Number(id));
    if (indice === -1) return false;
    clientesMemoria.splice(indice, 1);
    return true;
  }
  const ref = colecao().doc(String(id));
  const doc = await ref.get();
  if (!doc.exists) return false;
  await ref.delete();
  return true;
}

module.exports = { listar, consultar, cadastrar, alterar, excluir };
