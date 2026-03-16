import express from 'express';
import cors from 'cors';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = './database.json';
const SENHA_ADMIN = "ayulinda";

const verificarSenha = (req: any, res: any, next: any) => {
    const token = req.headers.authorization;
    if (token === SENHA_ADMIN) next();
    else res.status(401).json({ erro: "Acesso negado" });
};

const carregarDados = () => {
    try {
        if (fs.existsSync(DB_FILE)) return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch (e) { console.error("Erro BD"); }
    return [];
};

let lista = carregarDados();
const salvar = () => fs.writeFileSync(DB_FILE, JSON.stringify(lista, null, 2));

app.post('/login', (req, res) => {
    if (req.body.senha === SENHA_ADMIN) res.json({ ok: true });
    else res.status(401).json({ erro: "Senha Incorreta" });
});

app.post('/registrar', (req, res) => {
    const { nick, ip, classe } = req.body;
    const index = lista.findIndex(j => j.nick?.toLowerCase() === nick?.toLowerCase());
    if (index !== -1) {
        lista[index] = { ...lista[index], ip, classe, naPT: true, hora: Date.now() };
    } else {
        lista.push({ id: Math.random().toString(36).substring(2, 11), nick, ip, classe, mor: false, naPT: true, hora: Date.now() });
    }
    salvar();
    res.json({ ok: true });
});

app.get('/fazoL', (req, res) => res.json(lista));

app.patch('/fazoL/mor/:id', verificarSenha, (req, res) => {
    const p = lista.find(j => j.id === req.params.id);
    if (p) { p.mor = !p.mor; salvar(); }
    res.json(p);
});

app.delete('/fazoL/jogador/:id', verificarSenha, (req, res) => {
    const player = lista.find(j => j.id === req.params.id);
    if (player) {
        if (player.mor) player.naPT = false;
        else lista = lista.filter(j => j.id !== req.params.id);
        salvar();
    }
    res.json({ ok: true });
});
lete('/fazoL/limpar', verificarSenha, (req, res) => {
    lista.forEach(j => j.naPT = false);
    lista = lista.filter(j => j.mor === true);
    salvar();
    res.json({ ok: true });
app.de
});

app.get('/fazoL', (req, res) => {
    res.send('O pai tá on!');
});

// FUNÇÃO ANTI-SLEEP
setInterval(async () => {
    try {
        const res = await fetch(`https://site-loucos-por-avalon.onrender.com/fazoL`);
        if (res.ok) {
            console.log("⚓ Auto-ping: Servidor acordado!");
        }
    } catch (e: any) {
        console.error("❌ Erro no auto-ping:", e.message);
    }
}, 600000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});