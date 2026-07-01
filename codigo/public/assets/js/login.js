// Mesa Aberta - Módulo de Login (adaptado)
//
// Baseado no módulo de login fornecido na atividade.
// Adaptação: a navegação pelo site NÃO exige login. O usuário só é
// redirecionado para o formulário de login quando tenta usar uma
// funcionalidade que exige autenticação (ex.: favoritar um jogo).
//
// Autor original do módulo: Rommel Vieira Carneiro (rommelcarneiro@gmail.com)
// Adaptado por: Crispim

// Página de Login
const LOGIN_URL = "/modulos/login/login.html";
let RETURN_URL = "/index.html";
const API_URL = '/usuarios';

// Banco de dados de usuários (carregado via API)
var db_usuarios = [];

// Usuário corrente: null quando ninguém está logado
var usuarioCorrente = null;

// Inicializa a aplicação de Login
function initLoginApp() {
    let pagina = window.location.pathname;

    // Recupera o usuário logado a partir do sessionStorage, se existir
    let usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
    usuarioCorrente = usuarioCorrenteJSON ? JSON.parse(usuarioCorrenteJSON) : null;

    if (pagina === LOGIN_URL) {
        // Estamos na própria página de login: define a URL de retorno
        let returnURL = sessionStorage.getItem('returnURL');
        RETURN_URL = returnURL || RETURN_URL;

        // Carrega a base de usuários para validar o formulário
        carregarUsuarios(() => {
            console.log('Usuários carregados...');
        });
    } else {
        // Em qualquer outra página: guarda a URL atual para retorno pós-login
        sessionStorage.setItem('returnURL', pagina);

        // Atualiza a área de informações de login/usuário assim que o DOM estiver pronto
        document.addEventListener('DOMContentLoaded', function () {
            showUserInfo('userInfo');
        });
    }
}

function carregarUsuarios(callback) {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            db_usuarios = data;
            if (callback) callback();
        })
        .catch(error => {
            console.error('Erro ao ler usuários via API JSONServer:', error);
        });
}

// Verifica se o login do usuário está ok e, se positivo, monta usuarioCorrente
function loginUser(login, senha) {
    for (var i = 0; i < db_usuarios.length; i++) {
        var usuario = db_usuarios[i];

        if (login == usuario.login && senha == usuario.senha) {
            usuarioCorrente = {
                id: usuario.id,
                login: usuario.login,
                email: usuario.email,
                nome: usuario.nome
            };

            sessionStorage.setItem('usuarioCorrente', JSON.stringify(usuarioCorrente));
            return true;
        }
    }
    return false;
}

// Apaga os dados do usuário corrente e volta para a home
function logoutUser() {
    sessionStorage.removeItem('usuarioCorrente');
    usuarioCorrente = null;

    // Calcula o caminho da home-page a partir da página atual
    let destino = window.location.pathname.includes('/modulos/') ? '../../index.html' : 'index.html';
    window.location.href = destino;
}

function addUser(nome, login, senha, email) {
    let usuario = { login: login, senha: senha, nome: nome, email: email };

    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario),
    })
        .then(response => response.json())
        .then(data => {
            db_usuarios.push(data);
        })
        .catch(error => {
            console.error('Erro ao inserir usuário via API JSONServer:', error);
        });
}

// Atualiza a área de identificação na barra superior:
// "Entrar" quando não logado, "Olá, <nome> | Sair" quando logado
function showUserInfo(elementId) {
    var elem = document.getElementById(elementId);
    if (!elem) return;

    if (usuarioCorrente) {
        elem.innerHTML = `Olá, ${usuarioCorrente.nome} | <a href="#" id="linkSair">Sair</a>`;
        let linkSair = document.getElementById('linkSair');
        if (linkSair) linkSair.addEventListener('click', function (e) {
            e.preventDefault();
            logoutUser();
        });
    } else {
        elem.innerHTML = `<a href="${LOGIN_URL}">Entrar</a>`;
    }
}

// Funções que exigem login (ex.: favoritar) devem chamar isto antes de agir.
// Retorna true se o usuário está logado; caso contrário, avisa e redireciona.
function exigirLogin() {
    if (!usuarioCorrente) {
        alert('Você precisa entrar para usar essa funcionalidade.');
        sessionStorage.setItem('returnURL', window.location.pathname);
        window.location.href = LOGIN_URL;
        return false;
    }
    return true;
}

// Inicializa as estruturas utilizadas pelo módulo de login
initLoginApp();
