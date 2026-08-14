// --- CONFIGURAÇÃO DAS URLS ---
const API_GOOGLE = 'https://www.googleapis.com/books/v1/volumes?q=';
const API_BACKEND = 'http://localhost:8080/api/livros'; // Endereço do seu Spring Boot

// --- ELEMENTOS DO DOM ---
const inputPesquisa = document.getElementById('inputPesquisa');
const btnPesquisar = document.getElementById('btnPesquisar');
const secaoPesquisa = document.getElementById('secaoPesquisa');
const resultadosPesquisa = document.getElementById('resultadosPesquisa');
const minhaEstanteGrid = document.getElementById('minhaEstanteGrid');

// Modal Elements
const modalReview = document.getElementById('modalReview');
const btnFecharModal = document.getElementById('btnFecharModal');
const formReview = document.getElementById('formReview');

// --- EVENTOS ---
btnPesquisar.addEventListener('click', buscarGoogleBooks);
inputPesquisa.addEventListener('keypress', (e) => { if (e.key === 'Enter') buscarGoogleBooks(); });
btnFecharModal.addEventListener('click', () => modalReview.classList.add('hidden'));
formReview.addEventListener('submit', salvarReviewModal);

// Carrega os livros do banco ao iniciar a página
document.addEventListener('DOMContentLoaded', carregarEstanteDoBanco);

// ==========================================
// 1. BUSCA NA API PÚBLICA (GOOGLE BOOKS)
// ==========================================
async function buscarGoogleBooks() {
    const termo = inputPesquisa.value.trim();
    if (!termo) return alert('Digite o nome de um livro ou autor.');

    try {
        resultadosPesquisa.innerHTML = '<p>Buscando na biblioteca do Google...</p>';
        secaoPesquisa.classList.remove('hidden');

        const res = await fetch(`${API_GOOGLE}${encodeURIComponent(termo)}`);
        const data = await res.json();

        if (!data.items) {
            resultadosPesquisa.innerHTML = '<p>Nenhum livro encontrado.</p>';
            return;
        }

        renderizarResultadosGoogle(data.items);
    } catch (err) {
        console.error('Erro ao buscar no Google Books:', err);
        resultadosPesquisa.innerHTML = '<p>Erro ao conectar com a API do Google.</p>';
    }
}

function renderizarResultadosGoogle(items) {
    resultadosPesquisa.innerHTML = '';

    items.forEach(item => {
        const info = item.volumeInfo;
        const titulo = info.title || 'Título Desconhecido';
        const autor = info.authors ? info.authors.join(', ') : 'Autor Desconhecido';
        const capa = info.imageLinks?.thumbnail || 'https://via.placeholder.com/150x220?text=Sem+Capa';
        const paginas = info.pageCount || 0;

        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <div>
                <img src="${capa}" alt="${titulo}" class="book-cover">
                <div class="book-details">
                    <h3>${titulo}</h3>
                    <p class="book-author">${autor}</p>
                    <p style="font-size: 0.8rem;"><i class="fas fa-file-alt"></i> ${paginas} págs.</p>
                </div>
            </div>
            <button class="btn-primary" style="margin-top: 15px;" 
                onclick="salvarLivroNoBanco('${escaparTexto(titulo)}', '${escaparTexto(autor)}', '${capa}', ${paginas})">
                <i class="fas fa-plus"></i> Salvar na Estante
            </button>
        `;
        resultadosPesquisa.appendChild(card);
    });
}

// ==========================================
// 2. INTEGRAÇÃO COM BACKEND SPRING BOOT (CRUD)
// ==========================================

// [GET] Listar livros do MySQL
async function carregarEstanteDoBanco() {
    try {
        const res = await fetch(API_BACKEND);
        if (!res.ok) throw new Error('Não foi possível carregar a estante.');
        
        const livros = await res.json();
        renderizarMinhaEstante(livros);
    } catch (err) {
        console.warn('Backend ainda não rodando ou sem registros:', err);
        minhaEstanteGrid.innerHTML = `
            <p style="grid-column: 1/-1; opacity: 0.7;">
                Sua estante está vazia ou aguardando conexão com a API Spring Boot.
            </p>`;
    }
}

// [POST] Salvar livro no MySQL
async function salvarLivroNoBanco(titulo, autor, capaUrl, totalPaginas) {
    const novoLivro = {
        titulo,
        autor,
        capaUrl,
        totalPaginas,
        statusLeitura: 'QUERO_LER',
        review: '',
        nota: 0
    };

    try {
        const res = await fetch(API_BACKEND, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoLivro)
        });

        if (res.ok) {
            alert(`"${titulo}" foi adicionado à sua Estante Virtual!`);
            carregarEstanteDoBanco();
        } else {
            alert('Erro ao salvar no banco de dados.');
        }
    } catch (err) {
        console.error('Erro POST:', err);
        alert('O Backend Spring Boot não está respondendo. Verifique se a API está no ar.');
    }
}

// [PUT] Abrir Modal e Atualizar Review/Nota no MySQL
function abrirModalReview(id, titulo, status, nota, review) {
    document.getElementById('modalLivroId').value = id;
    document.getElementById('modalTituloLivro').textContent = titulo;
    document.getElementById('modalStatus').value = status || 'QUERO_LER';
    document.getElementById('modalNota').value = nota || 5;
    document.getElementById('modalTextoReview').value = review || '';

    modalReview.classList.remove('hidden');
}

async function salvarReviewModal(e) {
    e.preventDefault();

    const id = document.getElementById('modalLivroId').value;
    const dadosAtualizados = {
        statusLeitura: document.getElementById('modalStatus').value,
        nota: parseInt(document.getElementById('modalNota').value),
        review: document.getElementById('modalTextoReview').value
    };

    try {
        const res = await fetch(`${API_BACKEND}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAtualizados)
        });

        if (res.ok) {
            modalReview.classList.add('hidden');
            carregarEstanteDoBanco();
        } else {
            alert('Erro ao atualizar a resenha.');
        }
    } catch (err) {
        console.error('Erro PUT:', err);
    }
}

// [DELETE] Remover livro do MySQL
async function deletarLivro(id, titulo) {
    if (!confirm(`Tem certeza que deseja remover "${titulo}" da sua estante?`)) return;

    try {
        const res = await fetch(`${API_BACKEND}/${id}`, { method: 'DELETE' });

        if (res.ok) {
            carregarEstanteDoBanco();
        } else {
            alert('Erro ao excluir do banco.');
        }
    } catch (err) {
        console.error('Erro DELETE:', err);
    }
}

// Renderiza a lista vinda do banco MySQL
function renderizarMinhaEstante(livros) {
    minhaEstanteGrid.innerHTML = '';

    if (livros.length === 0) {
        minhaEstanteGrid.innerHTML = '<p style="grid-column: 1/-1;">Nenhum livro salvo ainda. Pesquise acima para adicionar!</p>';
        return;
    }

    livros.forEach(livro => {
        const card = document.createElement('div');
        card.className = 'book-card';
        
        const estrelas = '⭐'.repeat(livro.nota || 0);
        const reviewHtml = livro.review ? `<div class="review-box">"${livro.review}"</div>` : '';

        card.innerHTML = `
            <div>
                <img src="${livro.capaUrl}" alt="${livro.titulo}" class="book-cover">
                <div class="book-details">
                    <span class="badge-status badge-${livro.statusLeitura}">${formatarStatus(livro.statusLeitura)}</span>
                    <h3>${livro.titulo}</h3>
                    <p class="book-author">${livro.autor}</p>
                    <p style="font-size: 0.85rem;">${estrelas}</p>
                    ${reviewHtml}
                </div>
            </div>
            <div class="card-actions">
                <button class="btn-icon" title="Editar Review" 
                    onclick="abrirModalReview(${livro.id}, '${escaparTexto(livro.titulo)}', '${livro.statusLeitura}', ${livro.nota}, '${escaparTexto(livro.review)}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-danger" title="Excluir" onclick="deletarLivro(${livro.id}, '${escaparTexto(livro.titulo)}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        minhaEstanteGrid.appendChild(card);
    });
}

// Utilitários
function formatarStatus(status) {
    switch (status) {
        case 'QUERO_LER': return 'Quero Ler';
        case 'LENDO': return 'Lendo';
        case 'LIDO': return 'Lido';
        default: return status;
    }
}

function escaparTexto(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}