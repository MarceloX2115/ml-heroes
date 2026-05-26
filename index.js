require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'front')));

// =============================================
//  PROXY — imagens da API externa (evita CORS)
// =============================================
app.get('/api/ml-heroes-images', async (req, res) => {
  try {
    const response = await fetch('https://mlbb.rone.dev/api/heroes?size=200&order=asc');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================
//  ROTAS DE FUNÇÕES (Roles)
// =============================================

// GET /api/funcoes — lista todas as funções
app.get('/api/funcoes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('funcoes')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/funcoes — cadastra uma nova função
app.post('/api/funcoes', async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome é obrigatório.' });

    const { data, error } = await supabase
      .from('funcoes')
      .insert([{ nome, descricao }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/funcoes/:id — edita uma função
app.put('/api/funcoes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao } = req.body;

    const { data, error } = await supabase
      .from('funcoes')
      .update({ nome, descricao })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/funcoes/:id — exclui uma função
app.delete('/api/funcoes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('funcoes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Função excluída com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================
//  ROTAS DE HERÓIS
// =============================================

// GET /api/herois — lista todos os heróis (com join na função)
app.get('/api/herois', async (req, res) => {
  try {
    const { busca, funcao_id } = req.query;

    let query = supabase
      .from('herois')
      .select(`
        *,
        funcoes ( id, nome )
      `)
      .order('nome', { ascending: true });

    if (busca) {
      query = query.ilike('nome', `%${busca}%`);
    }

    if (funcao_id) {
      query = query.eq('funcao_id', funcao_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/herois/:id — retorna um herói específico
app.get('/api/herois/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('herois')
      .select(`*, funcoes ( id, nome )`)
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/herois — cadastra um novo herói
app.post('/api/herois', async (req, res) => {
  try {
    const { nome, funcao_id, especialidade, dificuldade, descricao, imagem_url } = req.body;

    if (!nome || !funcao_id) {
      return res.status(400).json({ error: 'Nome e função são obrigatórios.' });
    }

    const { data, error } = await supabase
      .from('herois')
      .insert([{ nome, funcao_id, especialidade, dificuldade, descricao, imagem_url }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/herois/:id — edita um herói
app.put('/api/herois/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, funcao_id, especialidade, dificuldade, descricao, imagem_url } = req.body;

    const { data, error } = await supabase
      .from('herois')
      .update({ nome, funcao_id, especialidade, dificuldade, descricao, imagem_url })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/herois/:id — exclui um herói
app.delete('/api/herois/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('herois')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Herói excluído com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota raiz → serve o front-end
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'front', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🗡️  Servidor rodando em http://localhost:${PORT}`);
});