-- ================================================
-- SCRIPT SQL — Sistema de Heróis Mobile Legends
-- Execute no SQL Editor do Supabase
-- ================================================

-- Tabela 1: funcoes (roles dos heróis)
CREATE TABLE funcoes (
  id         SERIAL PRIMARY KEY,
  nome       VARCHAR(50)  NOT NULL UNIQUE,
  descricao  TEXT
);

-- Tabela 2: herois
CREATE TABLE herois (
  id           SERIAL PRIMARY KEY,
  nome         VARCHAR(100) NOT NULL,
  funcao_id    INT          NOT NULL REFERENCES funcoes(id) ON DELETE RESTRICT,
  especialidade VARCHAR(100),
  dificuldade  VARCHAR(20)  CHECK (dificuldade IN ('Fácil', 'Médio', 'Difícil')),
  descricao    TEXT,
  imagem_url   TEXT,
  criado_em    TIMESTAMP    DEFAULT NOW()
);

-- ============ DADOS INICIAIS ============

INSERT INTO funcoes (nome, descricao) VALUES
  ('Tank',       'Absorve dano e protege a equipe'),
  ('Fighter',    'Combate corpo a corpo equilibrado'),
  ('Assassin',   'Alto dano, elimina alvos rapidamente'),
  ('Mage',       'Dano mágico à distância'),
  ('Marksman',   'Dano físico contínuo à distância'),
  ('Support',    'Cura e suporte para aliados');

INSERT INTO herois (nome, funcao_id, especialidade, dificuldade, descricao, imagem_url) VALUES
  ('Tigreal',   1, 'Initiator/Crowd Control', 'Fácil',   'Tank iniciador clássico com alto CC.',             'https://i.imgur.com/tigreal.png'),
  ('Layla',     5, 'Burst Damage/Reap',       'Fácil',   'Marksman ideal para iniciantes, alto alcance.',    'https://i.imgur.com/layla.png'),
  ('Gusion',    3, 'Burst Damage/Reap',       'Difícil', 'Assassino com combos rápidos e teleporte.',        'https://i.imgur.com/gusion.png'),
  ('Kagura',    4, 'Burst Damage/Poke',       'Difícil', 'Mage com mecânica de guarda-chuva única.',         'https://i.imgur.com/kagura.png'),
  ('Estes',     6, 'Heal/Support',            'Médio',   'O melhor suporte de cura do jogo.',                'https://i.imgur.com/estes.png'),
  ('Chou',      2, 'Crowd Control/Burst',     'Difícil', 'Fighter com kicks poderosos e alto outplay.',      'https://i.imgur.com/chou.png'),
  ('Lancelot',  3, 'Burst Damage',            'Médio',   'Assassino elegante com imunidade em habilidades.', 'https://i.imgur.com/lancelot.png'),
  ('Nana',      4, 'Poke/Crowd Control',      'Fácil',   'Mage/Support com polimorfo que transforma inimigos.','https://i.imgur.com/nana.png');
