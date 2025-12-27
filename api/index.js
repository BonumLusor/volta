import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Habilita CORS para todas as origens (ajuste se necessário)
app.use(cors());

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

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor da API rodando na porta ${PORT}`);
});