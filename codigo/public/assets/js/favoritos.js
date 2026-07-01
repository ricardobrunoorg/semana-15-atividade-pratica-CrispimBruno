
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
