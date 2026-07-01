// Mesa Aberta - Módulo de Favoritos
//
// Guarda, por usuário, a lista de ids de jogos favoritados.
// Chave: favoritos_<idDoUsuario>  ->  valor: array de ids, ex.: [3, 7, 12]

function chaveFavoritos() {
    return usuarioCorrente ? `favoritos_${usuarioCorrente.id}` : null;
}

function getFavoritos() {
    let chave = chaveFavoritos();
    if (!chave) return [];

    let dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : [];
}

function isFavorito(idJogo) {
    return getFavoritos().includes(idJogo);
}

// Alterna o estado de favorito de um jogo para o usuário logado.
// Exige login: se ninguém estiver logado, redireciona para a tela de login.
function toggleFavorito(idJogo) {
    if (!exigirLogin()) return false;

    let chave = chaveFavoritos();
    let favoritos = getFavoritos();
    let posicao = favoritos.indexOf(idJogo);

    if (posicao === -1) {
        favoritos.push(idJogo);
    } else {
        favoritos.splice(posicao, 1);
    }

    localStorage.setItem(chave, JSON.stringify(favoritos));
    return true;
}
