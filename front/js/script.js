/* =============================================
   ML HEROES — script.js (página de heróis)
   ============================================= */

const API = 'https://heroes-ml-views.up.railway.app/api';

// ---- Elementos ---- //
const listaHerois       = document.getElementById('listaHerois');
const inputBusca        = document.getElementById('inputBusca');
const selectFuncaoFiltro= document.getElementById('selectFuncaoFiltro');
const btnFiltrar        = document.getElementById('btnFiltrar');
const btnNovoHeroi      = document.getElementById('btnNovoHeroi');
const modalHeroi        = document.getElementById('modalHeroi');
const overlay           = document.getElementById('overlay');
const btnFecharModal    = document.getElementById('btnFecharModal');
const btnCancelar       = document.getElementById('btnCancelar');
const formHeroi         = document.getElementById('formHeroi');
const modalTitulo       = document.getElementById('modalTitulo');
const heroiId           = document.getElementById('heroiId');
const heroiNome         = document.getElementById('heroiNome');
const heroiFuncao       = document.getElementById('heroiFuncao');
const heroiEspecialidade= document.getElementById('heroiEspecialidade');
const heroiDificuldade  = document.getElementById('heroiDificuldade');
const heroiImagem       = document.getElementById('heroiImagem');
const heroiDescricao    = document.getElementById('heroiDescricao');

// ---- Toast ---- //
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ---- Modal ---- //
function abrirModal() {
  modalHeroi.classList.remove('hidden');
  overlay.classList.remove('hidden');
}
function fecharModal() {
  modalHeroi.classList.add('hidden');
  overlay.classList.add('hidden');
  formHeroi.reset();
  heroiId.value = '';
}
btnFecharModal.addEventListener('click', fecharModal);
btnCancelar.addEventListener('click', fecharModal);
overlay.addEventListener('click', fecharModal);

// ---- Carregar Funções (selects) ---- //
async function carregarFuncoes() {
  try {
    const res  = await fetch(`${API}/funcoes`);
    const data = await res.json();

    // Select do filtro
    selectFuncaoFiltro.innerHTML = '<option value="">Todas as funções</option>';
    // Select do modal
    heroiFuncao.innerHTML = '<option value="">Selecione…</option>';

    data.forEach(f => {
      selectFuncaoFiltro.innerHTML += `<option value="${f.id}">${f.nome}</option>`;
      heroiFuncao.innerHTML        += `<option value="${f.id}">${f.nome}</option>`;
    });
  } catch {
    showToast('Erro ao carregar funções.', 'error');
  }
}

// ---- Listar / Filtrar Heróis ---- //
async function listarHerois() {
  listaHerois.innerHTML = '<div class="loading">Carregando heróis…</div>';
  try {
    const busca    = inputBusca.value.trim();
    const funcaoId = selectFuncaoFiltro.value;

    let url = `${API}/herois?`;
    if (busca)    url += `busca=${encodeURIComponent(busca)}&`;
    if (funcaoId) url += `funcao_id=${funcaoId}`;

    const res  = await fetch(url);
    const data = await res.json();

    if (!data.length) {
      listaHerois.innerHTML = '<div class="empty">Nenhum herói encontrado.</div>';
      return;
    }

    const cards = await Promise.all(data.map(h => heroiCard(h)));
    listaHerois.innerHTML = cards.join('');

    // Eventos dos botões nos cards
    document.querySelectorAll('.btn-editar').forEach(btn => {
      btn.addEventListener('click', () => editarHeroi(btn.dataset.id));
    });
    document.querySelectorAll('.btn-excluir').forEach(btn => {
      btn.addEventListener('click', () => excluirHeroi(btn.dataset.id, btn.dataset.nome));
    });

  } catch {
    listaHerois.innerHTML = '<div class="empty">Erro ao carregar heróis.</div>';
    showToast('Erro ao carregar heróis.', 'error');
  }
}

// Cache de imagens já buscadas para não repetir chamadas
const imageCache = {};

async function getImageUrl(nomeHeroi) {
  if (imageCache[nomeHeroi]) return imageCache[nomeHeroi];
  try {
    const res  = await fetch(`${API}/ml-heroes-images`);
    const data = await res.json();
    const heroes = data?.data?.records || [];
    heroes.forEach(r => {
      const nome = r?.data?.hero?.data?.name;
      const head = r?.data?.hero?.data?.head;
      if (nome && head) imageCache[nome] = head;
    });
    return imageCache[nomeHeroi] || null;
  } catch {
    return null;
  }
}

async function heroiCard(h) {
  const imgUrl = h.imagem_url || await getImageUrl(h.nome);
  const imgHtml = imgUrl
    ? `<img class="hero-img" src="${imgUrl}" alt="${h.nome}" onerror="this.outerHTML='<div class=hero-img-placeholder>🗡️</div>'" />`
    : `<div class="hero-img-placeholder">🗡️</div>`;

  const tagDif = h.dificuldade
    ? `<span class="tag tag-${h.dificuldade.toLowerCase().replace('á','a').replace('é','e').replace('í','i')}">${h.dificuldade}</span>`
    : '';

  return `
    <div class="hero-card">
      ${imgHtml}
      <div class="hero-body">
        <div class="hero-name">${h.nome}</div>
        <div class="hero-tags">
          ${h.funcoes ? `<span class="tag tag-funcao">${h.funcoes.nome}</span>` : ''}
          ${tagDif}
        </div>
        ${h.especialidade ? `<div style="font-size:.8rem;color:var(--muted);">🎯 ${h.especialidade}</div>` : ''}
        <div class="hero-desc">${h.descricao || 'Sem descrição cadastrada.'}</div>
      </div>
      <div class="hero-actions">
        <button class="btn btn-ghost btn-sm btn-editar" data-id="${h.id}">✏️ Editar</button>
        <button class="btn btn-danger btn-sm btn-excluir" data-id="${h.id}" data-nome="${h.nome}">🗑️ Excluir</button>
      </div>
    </div>`;
}

// ---- Cadastrar / Editar ---- //
btnNovoHeroi.addEventListener('click', () => {
  modalTitulo.textContent = 'Novo Herói';
  heroiId.value = '';
  formHeroi.reset();
  abrirModal();
});

async function editarHeroi(id) {
  try {
    const res  = await fetch(`${API}/herois/${id}`);
    const h    = await res.json();

    modalTitulo.textContent     = 'Editar Herói';
    heroiId.value               = h.id;
    heroiNome.value             = h.nome;
    heroiFuncao.value           = h.funcao_id;
    heroiEspecialidade.value    = h.especialidade  || '';
    heroiDificuldade.value      = h.dificuldade    || '';
    heroiImagem.value           = h.imagem_url     || '';
    heroiDescricao.value        = h.descricao      || '';

    abrirModal();
  } catch {
    showToast('Erro ao carregar herói.', 'error');
  }
}

formHeroi.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    nome:          heroiNome.value.trim(),
    funcao_id:     parseInt(heroiFuncao.value),
    especialidade: heroiEspecialidade.value.trim(),
    dificuldade:   heroiDificuldade.value,
    imagem_url:    heroiImagem.value.trim(),
    descricao:     heroiDescricao.value.trim(),
  };

  const id     = heroiId.value;
  const url    = id ? `${API}/herois/${id}` : `${API}/herois`;
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro desconhecido');
    }
    showToast(id ? 'Herói atualizado!' : 'Herói cadastrado!', 'success');
    fecharModal();
    listarHerois();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// ---- Excluir ---- //
async function excluirHeroi(id, nome) {
  if (!confirm(`Excluir o herói "${nome}"?`)) return;
  try {
    const res = await fetch(`${API}/herois/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    showToast('Herói excluído.', 'success');
    listarHerois();
  } catch {
    showToast('Erro ao excluir herói.', 'error');
  }
}

// ---- Filtro ---- //
btnFiltrar.addEventListener('click', listarHerois);
inputBusca.addEventListener('keydown', e => { if (e.key === 'Enter') listarHerois(); });

// ---- Inicializar ---- //
(async () => {
  await carregarFuncoes();
  await listarHerois();
})();