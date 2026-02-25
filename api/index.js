import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

// --- Configuração para Módulos ES ---
// Em Módulos ES, __dirname não está disponível. Este é o boilerplate padrão para obtê-lo.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- Fim da Configuração ---

// Carrega o banco de dados JSON
const dbPath = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

const app = express();
// A porta DEVE ser 3000 para corresponder ao seu label do Traefik
const PORT = 3000;

// --- Configuração MySQL (opcional) ---
// Variáveis de ambiente esperadas: MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, MYSQL_PORT
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
      namedPlaceholders: false
    });
  }
}

// Helper: executa um arquivo SQL da pasta `sql/` e retorna linhas
async function runSqlFile(name, replacements = {}) {
  if (!pool) throw new Error('MySQL pool não inicializado');
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) throw new Error('Nome de arquivo inválido');

  const sqlPath = path.join(__dirname, 'sql', `${name}.sql`);
  if (!fs.existsSync(sqlPath)) throw new Error('Arquivo SQL não encontrado: ' + sqlPath);

  let sql = fs.readFileSync(sqlPath, 'utf8');

  // Substituições simples: {{key}} ou {key}
  for (const [k, v] of Object.entries(replacements)) {
    const safe = pool.escape(String(v));
    sql = sql.split(`{{${k}}}`).join(safe);
    sql = sql.split(`{${k}}`).join(safe);
  }

  const [rows] = await pool.query(sql);
  return rows;
}

// Habilita CORS para todas as origens (ajuste se necessário)
app.use(cors());

// Inicializa pool MySQL se variáveis estiverem presentes
initDbPool().catch(err => console.warn('MySQL pool init warning:', err.message));

// --- ENDPOINTS ---

// Endpoint: /OPs
app.get('/OPs', (req, res) => {
  res.json(db.OPs);
});

// Endpoint: /ModelCuts
app.get('/ModelCuts', (req, res) => {
  res.json(db.ModelCuts);
});

// Endpoint: /MPs?data=...
app.get('/MPs', (req, res) => {
  const { data } = req.query;
  
  if (data) {
    const filteredMPs = db.MPs.filter(mp => mp.data === data);
    res.json(filteredMPs);
  } else {
    // Retorna todos se nenhum filtro for fornecido
    res.json(db.MPs);
  }
});

// Endpoint: /blank?blkOp=...
app.get('/blank', (req, res) => {
  const { blkOp } = req.query;

  if (blkOp) {
    // Compara como string, pois ambos (query e JSON) são strings
    const filteredBlanks = db.blank.filter(b => b.blkOp === blkOp);
    res.json(filteredBlanks);
  } else {
    // Retorna todos se nenhum filtro for fornecido
    res.json(db.blank);
  }
});

// Endpoint: /cortes
app.get('/cortes', (req, res) => {
    res.json(db.cortes);
});

// Rota raiz para verificar se a API está online
app.get('/', (req, res) => {
  res.send('API Siemens Portal está online.');
});

// Endpoint genérico para executar arquivos SQL na pasta `sql`
// Ex: GET /mysql/sql/pp_op_mp_do_produto?cod_produto=268
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

// Conveniência: endpoints nomeados para os SQLs já presentes
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

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor da API rodando na porta ${PORT}`);
});