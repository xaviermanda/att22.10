const API_BASE = "";
const form = document.getElementById("clientForm");
const nomeInput = document.getElementById("nome");
const emailInput = document.getElementById("email");
const rows = document.getElementById("clientRows");
const empty = document.getElementById("empty");
const noResults = document.getElementById("noResults");
const count = document.getElementById("count");
const statusEl = document.getElementById("status");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const searchInput = document.getElementById("searchClients");
const exportBtn = document.getElementById("exportBtn");
let editingId = null;
let todosClientes = [];

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : {};
  if (!response.ok) throw new Error(data.erro || `Erro ${response.status}: não foi possível concluir a solicitação.`);
  return data;
}
function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
  statusEl.classList.toggle("success", !isError);
}
function resetForm() {
  editingId = null;
  form.reset();
  formTitle.textContent = "Adicionar cliente";
  submitBtn.innerHTML = '<span class="button-plus">＋</span> Cadastrar cliente <span class="button-arrow">→</span>';
  cancelBtn.classList.add("hidden");
}
function renderClientes(clientes) {
  const termo = (searchInput?.value || "").trim().toLocaleLowerCase("pt-BR");
  const filtrados = clientes.filter(cliente => `${cliente.nome} ${cliente.email} ${cliente.id}`.toLocaleLowerCase("pt-BR").includes(termo));
  count.textContent = termo ? `${filtrados.length}/${clientes.length}` : clientes.length;
  const countStat = document.getElementById("countStat");
  if (countStat) countStat.textContent = clientes.length;
  rows.innerHTML = "";
  empty.style.display = clientes.length ? "none" : "flex";
  noResults.classList.toggle("hidden", !(clientes.length && !filtrados.length));
  filtrados.forEach(cliente => {
    const tr = document.createElement("tr");
    const nome = document.createElement("td"); nome.textContent = cliente.nome;
    const email = document.createElement("td"); email.textContent = cliente.email;
    const id = document.createElement("td"); id.textContent = `#${cliente.id}`;
    const actions = document.createElement("td");
    const wrap = document.createElement("div"); wrap.className = "row-actions";
    const edit = document.createElement("button"); edit.className = "small-action"; edit.type = "button"; edit.textContent = "✎ Editar";
    edit.setAttribute("aria-label", `Editar ${cliente.nome}`);
    edit.onclick = () => {
      editingId = cliente.id;
      nomeInput.value = cliente.nome;
      emailInput.value = cliente.email;
      formTitle.textContent = `Editando cliente #${cliente.id}`;
      submitBtn.innerHTML = '<span class="button-plus">♡</span> Salvar alterações <span class="button-arrow">→</span>';
      cancelBtn.classList.remove("hidden");
      nomeInput.focus();
      document.getElementById("cadastro").scrollIntoView({ behavior: "smooth", block: "start" });
      setStatus(`Você está editando ${cliente.nome}.`);
    };
    const del = document.createElement("button"); del.className = "small-action delete"; del.type = "button"; del.textContent = "♡ Excluir";
    del.setAttribute("aria-label", `Excluir ${cliente.nome}`);
    del.onclick = async () => {
      if (!confirm(`Tem certeza que deseja excluir ${cliente.nome} da sua listinha?`)) return;
      del.disabled = true;
      try {
        await api(`/clientes/${cliente.id}`, { method: "DELETE" });
        if (editingId === cliente.id) resetForm();
        setStatus("Prontinho! Cliente removido da lista. ♡");
        await carregarClientes();
      } catch (error) { setStatus(error.message, true); del.disabled = false; }
    };
    wrap.append(edit, del); actions.append(wrap); tr.append(nome, email, id, actions); rows.append(tr);
  });
}
async function carregarClientes() {
  const refreshBtn = document.getElementById("refreshBtn");
  refreshBtn.classList.add("is-loading");
  try {
    const clientes = await api("/clientes");
    if (!Array.isArray(clientes)) throw new Error("A API respondeu em um formato inesperado.");
    todosClientes = clientes;
    renderClientes(todosClientes);
    document.querySelector(".api-status").textContent = "Conectada";
    setStatus("Sua listinha está atualizada. ✨");
  } catch (error) {
    document.querySelector(".api-status").textContent = "Offline";
    setStatus(`Não foi possível carregar a lista: ${error.message}`, true);
  } finally { refreshBtn.classList.remove("is-loading"); }
}
form.addEventListener("submit", async event => {
  event.preventDefault();
  const nome = nomeInput.value.trim();
  const email = emailInput.value.trim();
  if (!nome || !email) return setStatus("Preencha o nome e o e-mail antes de continuar. ♡", true);
  if (!emailInput.checkValidity()) return setStatus("Confira se o e-mail foi digitado corretamente.", true);
  submitBtn.disabled = true;
  const textoOriginal = submitBtn.innerHTML;
  submitBtn.innerHTML = "Salvando com carinho... ✨";
  try {
    const isEdit = editingId !== null;
    await api(isEdit ? `/clientes/${editingId}` : "/clientes", {
      method: isEdit ? "PUT" : "POST", body: JSON.stringify({ nome, email })
    });
    resetForm();
    setStatus(isEdit ? "Alterações salvas com sucesso! ♡" : "Cliente cadastrado com sucesso! Bem-vindo à listinha. 🎀");
    await carregarClientes();
    searchInput.value = "";
    renderClientes(todosClientes);
  } catch (error) { setStatus(error.message, true); }
  finally { submitBtn.disabled = false; if (submitBtn.innerHTML === "Salvando com carinho... ✨") submitBtn.innerHTML = textoOriginal; }
});
cancelBtn.addEventListener("click", () => { resetForm(); setStatus("Edição cancelada. Nenhuma alteração foi feita."); });
document.getElementById("refreshBtn").addEventListener("click", carregarClientes);
searchInput.addEventListener("input", () => renderClientes(todosClientes));
exportBtn.addEventListener("click", () => {
  if (!todosClientes.length) { setStatus("Ainda não há clientes para exportar. Cadastre alguém primeiro! ♡", true); return; }
  const quote = value => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = "ID,Nome,E-mail\r\n" + todosClientes.map(c => [quote(c.id), quote(c.nome), quote(c.email)].join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = "minha-listinha-de-clientes.csv";
  document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  setStatus("Sua listinha foi exportada em CSV! Guarde com carinho. 🎀");
});
carregarClientes();
