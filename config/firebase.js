const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");

const caminhoCredenciais = path.join(__dirname, "serviceAccountKey.json");
let db = null;

if (fs.existsSync(caminhoCredenciais)) {
  try {
    const serviceAccount = require(caminhoCredenciais);
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    db = admin.firestore();
    console.log("Firebase conectado. Os dados serão salvos no Firestore.");
  } catch (erro) {
    console.error("Não foi possível conectar ao Firebase:", erro.message);
    console.error("Confira se config/serviceAccountKey.json é a chave de conta de serviço correta.");
  }
} else {
  console.warn("Firebase não configurado: coloque o JSON em config/serviceAccountKey.json. Usando memória temporária.");
}

module.exports = { db };
