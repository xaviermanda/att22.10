# Mimo — CRUD de clientes (Coquette Edition)

Projeto escolar Node.js + Express com interface rosa/lilás, padrão MVC e CRUD de clientes. Pode usar Firebase Firestore; sem o JSON, funciona em memória apenas para teste.

## Configurar Firebase
1. No Firebase Console, crie/abra o projeto e ative o **Cloud Firestore**.
2. Em Configurações do projeto → Contas de serviço, gere uma chave privada JSON.
3. Coloque o arquivo dentro de `config/` e renomeie para `serviceAccountKey.json`.
4. A estrutura fica `config/firebase.js` e `config/serviceAccountKey.json`.
5. **Nunca envie `serviceAccountKey.json` para o GitHub.** O `.gitignore` já está configurado para ignorá-lo.

## Instalar e executar
Na pasta raiz do projeto:
```bash
npm install
npm run dev
```
Se preferir, `npm start` também funciona.
Abra http://localhost:3000.

## Testes
- `http://localhost:3000` — interface Mimo
- `http://localhost:3000/clientes` — lista em JSON
- `http://localhost:3000/clientes/api` — JSON da API, conforme a etapa do tutorial
- `http://localhost:3000/api` — documentação dos endpoints

O CRUD suporta GET, POST, PUT e DELETE em `/clientes`. Quando o Firebase estiver configurado, os dados são salvos na coleção `clientes` do Firestore. Sem a chave, o projeto avisa no terminal e usa dados temporários em memória.

## Publicar
No Render, use Build Command `npm install` e Start Command `npm start`. Não coloque a chave privada no GitHub. Para usar Firebase no Render, configure a credencial como variável/secret e adapte a inicialização para o segredo da plataforma, ou mantenha a chave fora do repositório.
