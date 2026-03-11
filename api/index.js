import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

// --- Configuração para Módulos ES ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega o banco de dados JSON (Mock legado)
const dbPath = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

const app = express();
const PORT = 3000;

// --- Configuração MySQL ---
let pool = null;
async function initDbPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: "144.126.159.63",
      user: 'root',
      password: 'iMNQ0Jby1q1yrE',
      database: 'db_uc_desenv',
      port: 4897,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      namedPlaceholders: false,
      multipleStatements: true 
    });
  }
}

// Helper: executa um arquivo SQL da pasta `sql/`
async function runSqlFile(name, replacements = {}) {
  if (!pool) throw new Error('MySQL pool não inicializado');
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) throw new Error('Nome de arquivo inválido');

  const sqlPath = path.join(__dirname, 'sql', `${name}.sql`);
  if (!fs.existsSync(sqlPath)) throw new Error('Arquivo SQL não encontrado: ' + sqlPath);

  let sql = fs.readFileSync(sqlPath, 'utf8');

  for (const [k, v] of Object.entries(replacements)) {
    const safe = pool.escape(String(v));
    sql = sql.split(`{{${k}}}`).join(safe);
    sql = sql.split(`{${k}}`).join(safe);
  }

  const [rows] = await pool.query(sql);
  return rows;
}

app.use(cors());
app.use(express.json());

// --- ENDPOINT: SALVAR PLANO DE CORTE (PLANEJAMENTO) ---
app.post('/salvar-plano-corte', async (req, res) => {
  try {
    if (!pool) await initDbPool();
    const { metadata, pecas } = req.body;

    const valuesSql = pecas.map(p => {
      return `(${pool.escape(metadata.cod_plano_corte)}, 
               ${pool.escape(p.cod_rolo)}, 
               ${pool.escape(metadata.cod_empresa)}, 
               ${pool.escape(p.cod_op)}, 
               ${pool.escape(p.cod_op_pc || 1)}, 
               ${pool.escape(p.largura)}, 
               ${pool.escape(p.comprimento)}, 
               ${pool.escape(p.m2)}, 
               ${pool.escape(p.x0)}, 
               ${pool.escape(p.x1)}, 
               ${pool.escape(p.y0)}, 
               ${pool.escape(p.y1)}, 
               ${pool.escape(metadata.cod_produto)}, 
               ${pool.escape(p.nr_serie || 'PECA')})`;
    }).join(',');

    const sqlPath = path.join(__dirname, 'sql', 'plano_corte_04_planejar_cortes.sql');
    let sql = fs.readFileSync(sqlPath, 'utf8');

    const substituirGlobal = (sqlTexto, chave, valor) => {
      const regex = new RegExp(`{${chave}}`, 'g');
      return sqlTexto.replace(regex, pool.escape(valor !== undefined && valor !== null ? valor : null));
    };

    const pOrigem = pecas[0] || {};
    sql = substituirGlobal(sql, 'cod_colaborador', metadata.cod_colaborador);
    sql = substituirGlobal(sql, 'cod_plano_corte', metadata.cod_plano_corte);
    sql = substituirGlobal(sql, 'cod_empresa', metadata.cod_empresa);
    sql = substituirGlobal(sql, 'cod_produto', metadata.cod_produto);
    sql = substituirGlobal(sql, 'cod_lote', metadata.cod_lote || pOrigem.cod_lote_origem);
    sql = substituirGlobal(sql, 'cod_embalagem', metadata.cod_embalagem || pOrigem.cod_embalagem_origem);
    sql = substituirGlobal(sql, 'cod_deposito', metadata.cod_deposito || 1); 
    sql = substituirGlobal(sql, 'localizacao', metadata.localizacao || '');

    sql = sql.replace('{VALUES_PECAS}', valuesSql);

    const [result] = await pool.query(sql);
    res.json({ success: true, message: "Plano processado com sucesso!" });
  } catch (err) {
    console.error("Erro ao salvar plano:", err.message);
    res.status(500).json({ error: err.message, sql: err.sql });
  }
});

// --- ENDPOINT NOVO: CONFIRMAR E REALIZAR O CORTE ---
app.post('/confirmar-plano-corte', async (req, res) => {
  try {
    if (!pool) await initDbPool();
    const { cod_plano_corte, cod_colaborador, pecas } = req.body;

    if (!cod_plano_corte || !pecas || pecas.length === 0) {
      return res.status(400).json({ error: "Dados incompletos para confirmação." });
    }

    // 1. Gera sequencial de embalagem dinâmico com base na `ultima_embalagem_do_lote` do banco
    let embalagensPorLote = {};

    const valuesSql = pecas.map((p) => {
      // Inicializa o contador do lote se ainda não existir
      if (!embalagensPorLote[p.cod_lote]) {
        embalagensPorLote[p.cod_lote] = p.ultima_embalagem_do_lote || 0;
      }
      
      // Incrementa e usa a nova embalagem
      embalagensPorLote[p.cod_lote]++;
      const novaEmbalagem = embalagensPorLote[p.cod_lote];
      
      const nr_serie = p.cod_op === 0 ? 'CORTADO' : (p.cod_op === -1 ? 'SUCATA' : 'PECA');

      return `( ${pool.escape(cod_plano_corte)}, ${pool.escape(p.cod_rolo)}, ${pool.escape(p.cod_empresa)}, ${pool.escape(p.cod_op)}, ${pool.escape(p.cod_op_pc)}, ${pool.escape(p.largura)}, ${pool.escape(p.comprimento)}, ${pool.escape(p.m2)}, ${pool.escape(p.x0)}, ${pool.escape(p.x1)}, ${pool.escape(p.y0)}, ${pool.escape(p.y1)}, ${pool.escape(p.cod_produto)}, ${pool.escape(p.cod_lote)}, ${pool.escape(novaEmbalagem)}, ${pool.escape(nr_serie)} )`;
    }).join(',');

    // 2. Carrega arquivo SQL de confirmação
    const sqlPath = path.join(__dirname, 'sql', 'plano_corte_07_confirmar_cortes.sql');
    let sql = fs.readFileSync(sqlPath, 'utf8');

    // 3. Substituições Globais
    const regexPlano = new RegExp(`{cod_plano_corte}`, 'g');
    const regexColab = new RegExp(`{cod_colaborador}`, 'g');
    
    sql = sql.replace(regexPlano, pool.escape(cod_plano_corte));
    sql = sql.replace(regexColab, pool.escape(cod_colaborador));

    // 4. Substituição precisa da matriz VALUES no script pelo nosso `valuesSql` gerado dinamicamente
    // O script contém: VALUES ( {cod_plano_corte}, {cod_rolo}, ... )
    const templateValuesStr = "VALUES ( {cod_plano_corte}, {cod_rolo}, {cod_empresa}, {cod_op}, {cod_op_pc}, {largura}, {comprimento}, {m2}, {x0}, {x1}, {y0}, {y1}, '{cod_produto}', {cod_lote}, {cod_embalagem}, '{nr_serie}' )";
    
    if (sql.includes(templateValuesStr)) {
      sql = sql.replace(templateValuesStr, `VALUES ${valuesSql}`);
    } else {
      // Fallback: Busca pela estrutura de VALUES via regex caso tenha tabulações extras no SQL
      sql = sql.replace(/VALUES\s*\(\s*\{cod_plano_corte\}[\s\S]*?'\{nr_serie\}'\s*\)/, `VALUES ${valuesSql}`);
    }

    // 5. Executa Script inteiro e atualiza banco
    const [result] = await pool.query(sql);
    res.json({ success: true, message: "Corte realizado com sucesso!" });
    
  } catch (err) {
    console.error("Erro ao confirmar corte:", err.message);
    res.status(500).json({ error: err.message, sql: err.sql });
  }
});


// --- ENDPOINTS GENÉRICOS DE SQL ---
app.get('/mysql/sql/:name', async (req, res) => {
  try {
    if (!pool) await initDbPool();
    const name = req.params.name;
    const replacements = { ...req.query };
    const rows = await runSqlFile(name, replacements);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Outros Endpoints de Legado/Atalho
app.get('/pp_op_mp_do_produto', async (req, res) => {
  try {
    if (!pool) await initDbPool();
    const rows = await runSqlFile('pp_op_mp_do_produto', req.query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/mysql/pp_op_liberada', async (req, res) => {
  try {
    if (!pool) await initDbPool();
    const rows = await runSqlFile('pp_op_liberada', req.query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/mysql/eq_saldo', async (req, res) => {
  try {
    if (!pool) await initDbPool();
    const rows = await runSqlFile('eq_saldo', req.query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- NOVOS ENDPOINTS DEDICADOS ---

app.get('/mysql/plano_corte_05_lista_planos', async (req, res) => {
  try {
    if (!pool) await initDbPool();
    const rows = await runSqlFile('plano_corte_05_lista_planos', req.query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/mysql/plano_corte_06_lista_pecas_planejadas', async (req, res) => {
  try {
    if (!pool) await initDbPool();
    // Passa o cod_plano_corte que vem de req.query para o helper substituir no ficheiro .sql
    const rows = await runSqlFile('plano_corte_06_lista_pecas', req.query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Inicia o servidor
initDbPool().catch(err => console.warn('MySQL pool init warning:', err.message));
app.listen(PORT, () => {
  console.log(`Servidor da API rodando na porta ${PORT}`);
});