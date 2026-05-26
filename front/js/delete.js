async function excluirHeroi(id, nome) {
  try {
    const res = await fetch('https://heroes-ml-views.up.railway.app/api/herois/22', { method: 'DELETE' });
    if (!res.ok) throw new Error();
    console.log('Herói excluído.', 'success');
  } catch {
    console.log('Erro ao excluir herói.', 'error');
  }
}

excluirHeroi()