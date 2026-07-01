
const LOGIN_URL = "/modulos/login/login.html";
let RETURN_URL = "/index.html";
const API_URL = '/usuarios';

var db_usuarios = [];

var usuarioCorrente = null;

function initLoginApp() {
    let pagina = window.location.pathname;

    let usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
    usuarioCorrente = usuarioCorrenteJSON ? JSON.parse(usuarioCorrenteJSON) : null;

    if (pagina === LOGIN_URL) {
        let returnURL = sessionStorage.getItem('returnURL');
        RETURN_URL = returnURL || RETURN_URL;

        carregarUsuarios(() => {
            console.log('Usuários carregados...');
        });
    } else {
        sessionStorage.setItem('returnURL', pagina);

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

function logoutUser() {
    sessionStorage.removeItem('usuarioCorrente');
    usuarioCorrente = null;

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

function exigirLogin() {
    if (!usuarioCorrente) {
        alert('Você precisa entrar para usar essa funcionalidade.');
        sessionStorage.setItem('returnURL', window.location.pathname);
        window.location.href = LOGIN_URL;
        return false;
    }
    return true;
}

initLoginApp();
