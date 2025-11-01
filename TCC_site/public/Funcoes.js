// --- Configuração do Firebase --- 
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

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// --- Proteção de páginas logadas ---
auth.onAuthStateChanged(function(user) {
  if (!user) {
    window.location.href = 'index.html';
  }
});

// --- Login com Google ---
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

// --- Login com Email/Senha ---
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

// --- Cadastro com Email/Senha ---
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

// --- Recuperação de Senha ---
document.querySelector('.forgot-password')?.addEventListener('click', function(e){
  e.preventDefault();
  const email = document.getElementById('email').value;
  if (email) {
    auth.sendPasswordResetEmail(email)
      .then(() => alert('Email de recuperação enviado!'))
      .catch(error => alert('Erro ao enviar email: ' + error.message));
  } else {
    alert('Digite seu email para recuperar a senha.');
  }
});

// --- Edição de Staff ---
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

document.getElementById('cadastroJogadorForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const novoJogador = {
    nome: document.getElementById('nome').value || "",
    idade: document.getElementById('idade').value || "",
    nascimento: document.getElementById('nascimento').value || "",
    posicao: document.getElementById('posicao').value || "",
    foto: document.getElementById('foto').value || "",
    temperamento: "",
    controleEmocional: "",
    resiliencia: "",
    jogos: "",
    minutos: "",
    gols: "",
    historico: ""
  };
  const idUnico = auth.currentUser ? auth.currentUser.uid : Date.now(); // Ou outro identificador único
  database.ref('players/' + idUnico).set(novoJogador)
    .then(() => alert("Jogador cadastrado com sucesso!"))
    .catch(error => alert("Erro ao cadastrar jogador: " + error.message));
});


// --- Logout ---
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

// --- Filtro de Jogadores e Grid --- 
function filterPlayers(category) {
  const playerGrid = document.getElementById('playerGrid');
  playerGrid.innerHTML = '<p>Carregando...</p>';

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

// --- Carregar jogadores padrão ---
window.addEventListener('DOMContentLoaded', function() {
  filterPlayers('Sub-15'); // Exibe jogadores da Sub-15 ao abrir
});

// --- Seleção de titular ---
document.querySelector('.titular-btn')?.addEventListener('click', function() {
  const players = document.querySelectorAll('.player-card');
  players.forEach(card => {
    card.classList.toggle('titular');
  });
});

// --- Navegação de tabs ---
function showTab(tabName) {
  const tabs = document.querySelectorAll('.tab-content');
  const buttons = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => tab.classList.remove('active'));
  buttons.forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabName).classList.add('active');
  event.target.classList.add('active');
}

// --- Presença em treino ---
function marcarPresenca(treinoId) {
  const userId = auth.currentUser ? auth.currentUser.uid : null;
  if (!userId) {
    alert("Você precisa estar logado para marcar presença!");
    return;
  }
  database.ref(`presencas/${treinoId}/${userId}`).set({
    presente: true,
    data: new Date().toISOString()
  })
  .then(() => alert("Presença registrada!"))
  .catch((error) => alert("Erro ao registrar presença: " + error.message));
}

// --- Registrar pagamento ---
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
