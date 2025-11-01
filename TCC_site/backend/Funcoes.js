const firebaseConfig = {
  apiKey: "AIzaSyDOBPL9fkSQST6-XaXGPLdtz_LWWhU7d0w",
  authDomain: "sport-club-1b9e5.firebaseapp.com",
  databaseURL: "https://sport-club-1b9e5-default-rtdb.firebaseio.com",
  projectId: "sport-club-1b9e5",
  storageBucket: "sport-club-1b9e5.firebasestorage.app",
  messagingSenderId: "854453548372",
  appId: "1:854453548372:web:3d33cd08ebfdcc852b84c1",
  measurementId: "G-QV34JTLDR7"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();


auth.onAuthStateChanged(function(user) {
  if (!user) {
    window.location.href = 'index.html'; // Redireciona se não estiver logado
  }
});

// Login com Google
document.getElementById('googleSignIn')?.addEventListener('click', () => {
    auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .then(() => window.location.href = 'dashboard.html')
        .catch((error) => alert("Erro: " + error.message));
});

document.getElementById('googleSignUp')?.addEventListener('click', () => {
    auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .then(() => window.location.href = 'dashboard.html')
        .catch((error) => alert("Erro: " + error.message));
});

// Login com Email/Senha
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Validações básicas
  if (!email.includes('@') || !email.includes('.')) {
    alert('Digite um e-mail válido!');
    return;
  }
  if (password.length < 6) {
    alert('A senha deve ter pelo menos 6 caracteres.');
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      alert("Login realizado com sucesso!");
      window.location.href = 'dashboard.html';
    })
    .catch((error) => alert("Erro: " + error.message));
});


// Cadastro com Email/Senha
document.getElementById('signupForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Validações básicas
  if (!email.includes('@') || !email.includes('.')) {
    alert('Digite um e-mail válido!');
    return;
  }
  if (password.length < 6) {
    alert('A senha deve ter pelo menos 6 caracteres.');
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      alert("Cadastro realizado!");
      window.location.href = 'index.html';
    })
    .catch((error) => alert("Erro: " + error.message));
});


// Edição de Staff
document.getElementById('editBtn')?.addEventListener('click', () => {
    const inputs = document.querySelectorAll('#staffForm input');
    inputs.forEach(input => input.removeAttribute('readonly'));
    document.getElementById('editBtn').style.display = 'none';
    document.getElementById('saveBtn').style.display = 'inline-block';
});

document.getElementById('staffForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const staffData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        birthdate: document.getElementById('birthdate').value,
        role: document.getElementById('role').value,
        username: document.getElementById('username').value
    };
    const userId = auth.currentUser ? auth.currentUser.uid : 'defaultUser';
    database.ref('staff/' + userId).set(staffData)
        .then(() => {
            alert("Dados salvos com sucesso!");
            document.getElementById('saveBtn').style.display = 'none';
            document.getElementById('editBtn').style.display = 'inline-block';
            const inputs = document.querySelectorAll('#staffForm input');
            inputs.forEach(input => input.setAttribute('readonly', true));
        })
        .catch((error) => alert("Erro ao salvar: " + error.message));
});

// Logout
document.addEventListener('DOMContentLoaded', () => {
    const logoutLinks = document.querySelectorAll('.logout-btn');
    logoutLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            auth.signOut()
                .then(() => window.location.href = 'logout.html')
                .catch((error) => alert("Erro ao sair: " + error.message));
        });
    });
});

// Filtro de Jogadores 
function filterPlayers(category) {
  const playerGrid = document.getElementById('playerGrid');
  playerGrid.innerHTML = '<p>Carregando...</p>'; // Feedback de loading

  database.ref('players/' + category).once('value')
    .then(snapshot => {
      let html = '';
      snapshot.forEach(child => {
        html += `<div class="player-card">${child.val().name}</div>`;
      });
      playerGrid.innerHTML = html || '<p>Nenhum jogador cadastrado.</p>';
    })
    .catch(error => {
      playerGrid.innerHTML = `<p>Erro ao buscar jogadores: ${error.message}</p>`;
    });
}


// Navegação de Tabs
function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

server.js;


// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'SportClub')));

function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return { staff: [], players: [] };
  }
}
function writeDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

/* Staff */
app.get('/api/staff', (req, res) => {
  res.json(readDB().staff);
});
app.get('/api/staff/:id', (req, res) => {
  const db = readDB();
  const item = db.staff.find(s => String(s.id) === String(req.params.id));
  if (item) res.json(item); else res.status(404).json({ error: 'Not found' });
});
app.put('/api/staff/:id', (req, res) => {
  const db = readDB();
  const idx = db.staff.findIndex(s => String(s.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.staff[idx] = { ...db.staff[idx], ...req.body };
  writeDB(db);
  res.json(db.staff[idx]);
});
app.post('/api/staff', (req, res) => {
  const db = readDB();
  const id = db.staff.length ? Math.max(...db.staff.map(s => s.id)) + 1 : 1;
  const item = { id, ...req.body };
  db.staff.push(item);
  writeDB(db);
  res.json(item);
});

/* Players */
app.get('/api/players', (req, res) => {
  res.json(readDB().players);
});
app.get('/api/players/:id', (req, res) => {
  const db = readDB();
  const item = db.players.find(s => String(s.id) === String(req.params.id));
  if (item) res.json(item); else res.status(404).json({ error: 'Not found' });
});
app.put('/api/players/:id', (req, res) => {
  const db = readDB();
  const idx = db.players.findIndex(s => String(s.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.players[idx] = { ...db.players[idx], ...req.body };
  writeDB(db);
  res.json(db.players[idx]);
});
app.post('/api/players', (req, res) => {
  const db = readDB();
  const id = db.players.length ? Math.max(...db.players.map(s => s.id)) + 1 : 1;
  const item = { id, ...req.body };
  db.players.push(item);
  writeDB(db);
  res.json(item);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Marcar presença no treino
function marcarPresenca(treinoId) {
  const userId = auth.currentUser ? auth.currentUser.uid : null;
  if (!userId) {
    alert("Você precisa estar logado para marcar presença!");
    return;
  }
  // Simplesmente grava uma presença com a data/hora atual
  database.ref(`presencas/${treinoId}/${userId}`).set({
    presente: true,
    data: new Date().toISOString()
  })
  .then(() => alert("Presença registrada!"))
  .catch((error) => alert("Erro ao registrar presença: " + error.message));
}
//<button onclick="marcarPresenca('treino20251027')">Marcar Presença</button>

function registrarPagamento(mes) {
  const userId = auth.currentUser ? auth.currentUser.uid : null;
  if (!userId) {
    alert("Você precisa estar logado para registrar pagamento!");
    return;
  }
  database.ref(`pagamentos/${userId}/${mes}`).set({
    pago: true,
    data: new Date().toISOString()
  })
  .then(() => alert("Pagamento registrado!"))
  .catch((error) => alert("Erro ao registrar pagamento: " + error.message));
}
//<button onclick="registrarPagamento('2025-10')">Registrar Pagamento</button>

window.addEventListener('DOMContentLoaded', function() {
  filterPlayers('Sub-15'); // Exibe jogadores da Sub-15 assim que abre
});

// Supondo que o botão tem classe "titular-btn"
document.querySelector('.titular-btn').addEventListener('click', function() {
  const players = document.querySelectorAll('.player-card');
  players.forEach(card => {
    card.classList.toggle('titular');
  });
});

