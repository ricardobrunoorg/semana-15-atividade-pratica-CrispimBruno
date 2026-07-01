// Mesa Aberta - Catálogo de jogos
//
// Busca os jogos na API do JSON Server e renderiza os cards,
// incluindo o botão de favoritar (apenas para usuários logados).

const JOGOS_API = '/jogos';
let listaJogos = [];

function carregarJogos(callback) {
    fetch(JOGOS_API)
        .then(response => response.json())
        .then(data => {
            listaJogos = data;
            if (callback) callback();
        })
        .catch(error => {
            console.error('Erro ao ler jogos via API JSONServer:', error);
        });
}

function cardJogoHTML(jogo) {
    const favorito = isFavorito(jogo.id);
    return `
    <article class="card-jogo${favorito ? ' favoritado' : ''}" style="--cor-jogo: ${jogo.cor}">
      <button type="button" class="dado-favorito" data-id="${jogo.id}" aria-pressed="${favorito}"
        aria-label="${favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
        <span class="dado-face">${jogo.icone}</span>
      </button>
      <div class="card-faixa"></div>
      <div class="card-corpo">
        <span class="card-genero">${jogo.genero}</span>
        <h3>${jogo.titulo}</h3>
        <p class="card-descricao">${jogo.descricao}</p>
        <dl class="card-meta">
          <div><dt>Jogadores</dt><dd>${jogo.jogadores}</dd></div>
          <div><dt>Duração</dt><dd>${jogo.duracao}</dd></div>
          <div><dt>Dificuldade</dt><dd>${jogo.dificuldade}</dd></div>
        </dl>
      </div>
    </article>`;
}

function renderCards(jogos, containerId, mensagemVazio) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!jogos || jogos.length === 0) {
        container.innerHTML = `<p class="estado-vazio">${mensagemVazio || 'Nenhum jogo encontrado.'}</p>`;
        return;
    }

    container.innerHTML = jogos.map(cardJogoHTML).join('');

    container.querySelectorAll('.dado-favorito').forEach(botao => {
        botao.addEventListener('click', () => {
            const id = Number(botao.dataset.id);
            const alterou = toggleFavorito(id);
            if (alterou) {
                // Re-renderiza apenas a coleção atual exibida nesta página
                onListaAtualizada();
            }
        });
    });
}

// Sobrescrita por cada página (home ou favoritos) para saber como re-renderizar
let onListaAtualizada = function () {};

function atualizarContador(elementId, quantidade, rotulo) {
    const elem = document.getElementById(elementId);
    if (elem) elem.textContent = `${quantidade} ${rotulo}`;
}

function initHomePage() {
    carregarJogos(() => {
        onListaAtualizada = () => {
            renderCards(listaJogos, 'lista-jogos');
            atualizarContador('contador-jogos', listaJogos.length, 'jogos');
        };
        onListaAtualizada();
    });
}

function initFavoritosPage() {
    carregarJogos(() => {
        onListaAtualizada = () => {
            const idsFavoritos = getFavoritos();
            const jogosFavoritos = listaJogos.filter(j => idsFavoritos.includes(j.id));
            renderCards(
                jogosFavoritos,
                'lista-favoritos',
                usuarioCorrente
                    ? 'Você ainda não favoritou nenhum jogo. Volte para a home e clique no dado de um jogo para favoritá-lo.'
                    : 'Você precisa entrar para ver seus favoritos.'
            );
            atualizarContador('contador-favoritos', jogosFavoritos.length, 'jogos favoritados');
        };
        onListaAtualizada();
    });
}
