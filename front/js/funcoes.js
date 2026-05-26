/* =============================================
   ML HEROES — funcoes.js (página de funções)
   ============================================= */

const API = 'https://ml-heroes-production.up.railway.app';

const listaFuncoes   = document.getElementById('listaFuncoes');
const btnNovaFuncao  = document.getElementById('btnNovaFuncao');
const modalFuncao    = document.getElementById('modalFuncao');
const overlay        = document.getElementById('overlay');
const btnFecharModal = document.getElementById('btnFecharModal');
const btnCancelar    = document.getElementById('btnCancelar');
const formFuncao     = document.getElementById('formFuncao');
const modalTitulo    = document.getElementById('modalTitulo');
const funcaoId       = document.getElementById('funcaoId');
const funcaoNome     = document.getElementById('funcaoNome');
const funcaoDescricao= document.getElementById('funcaoDescricao');

const ICONES = {
  Tank: '🛡️', Fighter: '⚔️', Assassin: '🗡️',
  Mage: '🔮', Marksman: '🏹', Support: '💊',
};

// ---- Toast ---- //
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ---- Modal ---- //
function abrirModal() {
  modalFuncao.classList.remove('hidden');
  overlay.classList.remove('hidden');
}
function fecharModal() {
  modalFuncao.classList.add('hidden');
  overlay.classList.add('hidden');
  formFuncao.reset();
  funcaoId.value = '';
}
btnFecharModal.addEventListener('click', fecharModal);
btnCancelar.addEventListener('click', fecharModal);
overlay.addEventListener('click', fecharModal);

// ---- Listar ---- //
async function listarFuncoes() {
  listaFuncoes.innerHTML = '<div class="loading">Carregando funções…</div>';
  try {
    const res  = await fetch(`${API}/funcoes`);
    const data = await res.json();

    if (!data.length) {
      listaFuncoes.innerHTML = '<div class="empty">Nenhuma função cadastrada.</div>';
      return;
    }

    listaFuncoes.innerHTML = data.map(f => `
      <div class="funcao-item">
        <div class="funcao-icon">${ICONES[f.nome] || '🎮'}</div>
        <div class="funcao-info">
          <div class="funcao-nome">${f.nome}</div>
          <div class="funcao-desc">${f.descricao || 'Sem descrição.'}</div>
        </div>
        <div class="funcao-actions">
          <button class="btn btn-ghost btn-sm btn-editar" data-id="${f.id}">✏️ Editar</button>
          <button class="btn btn-danger btn-sm btn-excluir" data-id="${f.id}" data-nome="${f.nome}">🗑️</button>
        </div>
      </div>`).join('');

    document.querySelectorAll('.btn-editar').forEach(btn =>
      btn.addEventListener('click', () => editarFuncao(btn.dataset.id)));
    document.querySelectorAll('.btn-excluir').forEach(btn =>
      btn.addEventListener('click', () => excluirFuncao(btn.dataset.id, btn.dataset.nome)));

  } catch {
    listaFuncoes.innerHTML = '<div class="empty">Erro ao carregar funções.</div>';
  }
}

// ---- Cadastrar / Editar ---- //
btnNovaFuncao.addEventListener('click', () => {
  modalTitulo.textContent = 'Nova Função';
  funcaoId.value = '';
  formFuncao.reset();
  abrirModal();
});

async function editarFuncao(id) {
  try {
    const res  = await fetch(`${API}/funcoes`);
    const data = await res.json();
    const f    = data.find(x => String(x.id) === String(id));
    if (!f) throw new Error();

    modalTitulo.textContent  = 'Editar Função';
    funcaoId.value           = f.id;
    funcaoNome.value         = f.nome;
    funcaoDescricao.value    = f.descricao || '';
    abrirModal();
  } catch {
    showToast('Erro ao carregar função.', 'error');
  }
}

formFuncao.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    nome:      funcaoNome.value.trim(),
    descricao: funcaoDescricao.value.trim(),
  };
  const id     = funcaoId.value;
  const url    = id ? `${API}/funcoes/${id}` : `${API}/funcoes`;
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro');
    }
    showToast(id ? 'Função atualizada!' : 'Função cadastrada!', 'success');
    fecharModal();
    listarFuncoes();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// ---- Excluir ---- //
async function excluirFuncao(id, nome) {
  if (!confirm(`Excluir a função "${nome}"? Só é possível se não houver heróis vinculados.`)) return;
  try {
    const res = await fetch(`${API}/funcoes/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao excluir.');
    }
    showToast('Função excluída.', 'success');
    listarFuncoes();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ---- Init ---- //
listarFuncoes();
