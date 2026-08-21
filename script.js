const API_URL = 'http://localhost:8080/api/livros';

// 1. VERIFICAÇÃO DE SEGURANÇA E CARREGAMENTO
document.addEventListener('DOMContentLoaded', () => {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    // Se não estiver logado, manda pro login
    if (!usuarioLogado) {
        window.location.href = 'login.html';
        return;
    }

    // Atualiza os dados visuais na barra lateral com as informações do usuário
    atualizarPerfil(usuarioLogado);

    // Inicia o carregamento dos livros na tela
    carregarLivros();
});

// 2. FUNÇÃO SAIR
function sair() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = 'login.html';
}

// 3. ATUALIZAR PERFIL
function atualizarPerfil(usuario) {
    const nomeEl = document.getElementById('user-nome');
    const emailEl = document.getElementById('user-email');
    const fotoEl = document.getElementById('user-foto');
    const metaTotalEl = document.getElementById('meta-total');

    if (nomeEl) nomeEl.textContent = usuario.nome;
    if (emailEl) emailEl.textContent = usuario.email;
    if (fotoEl && usuario.fotoUrl) fotoEl.src = usuario.fotoUrl;
    if (metaTotalEl && usuario.metaLeitura) metaTotalEl.textContent = `/ ${usuario.metaLeitura}`;
}

// 4. CARREGAR LIVROS DO USUÁRIO LOGADO
async function carregarLivros() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    try {
        const resposta = await fetch(`${API_URL}/usuario/${usuarioLogado.id}`);
        
        if (!resposta.ok) throw new Error('Erro ao buscar livros do banco');

        const livros = await resposta.json();
        renderizarLivros(livros);
        atualizarEstatisticas(livros, usuarioLogado.metaLeitura);

    } catch (erro) {
        console.error('Erro de conexão:', erro);
        const container = document.getElementById('estante-container');
        if (container) container.innerHTML = '<p class="text-red-500 text-sm">Erro ao carregar a estante. Verifique se o Backend está rodando.</p>';
    }
}

// 5. RENDERIZAR OS LIVROS NA TELA (Versão correta e única)
function renderizarLivros(livros) {
    const container = document.getElementById('estante-container');
    if (!container) return;

    container.innerHTML = '';

    if (livros.length === 0) {
        container.innerHTML = '<p class="text-slate-500 text-sm">Sua estante está vazia. Adicione um livro!</p>';
        return;
    }

    livros.forEach(livro => {
        const card = document.createElement('div');
        card.className = 'bg-white p-3 rounded-2xl shadow-sm border border-slate-100 min-w-[160px] shrink-0 relative flex flex-col';
        
        const statusCor = livro.statusLeitura === 'LENDO' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700';

        card.innerHTML = `
            <span class="absolute top-5 left-5 ${statusCor} px-2 py-0.5 rounded-full text-[10px] font-bold z-10">${livro.statusLeitura || 'SALVO'}</span>
            <img src="${livro.capaUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300&auto=format&fit=crop'}" class="w-full h-36 object-cover rounded-xl mb-3">
            <h3 class="font-bold text-sm text-slate-800 truncate">${livro.titulo}</h3>
            <p class="text-[11px] text-slate-500 mb-1 truncate">${livro.autor}</p>
            <div class="flex justify-between items-center mt-auto pt-2">
                <div class="text-yellow-400 text-[10px]">★ ${livro.nota || '5.0'}</div>
                <button onclick="deletarLivro(${livro.id})" class="text-red-500 hover:text-red-700 text-[10px] font-bold transition-colors">Excluir</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// 6. ATUALIZAR ESTATÍSTICAS (Meta de Leitura e Badge)
function atualizarEstatisticas(livros, meta) {
    const lidosCount = livros.filter(l => l.statusLeitura === 'LIDO').length;
    const lendoCount = livros.filter(l => l.statusLeitura === 'LENDO').length;
    
    // Atualiza o contador de Lidos
    const spanLidos = document.getElementById('lidos-count');
    if (spanLidos) spanLidos.textContent = lidosCount;

    // Atualiza a notificação (badge) de livros "Lendo" no menu
    const badgeLendo = document.getElementById('badge-lendo');
    if (badgeLendo) badgeLendo.textContent = lendoCount;

    // Atualiza barra de progresso
    const barraProgresso = document.getElementById('barra-progresso'); 
    if (barraProgresso && meta > 0) {
        const porcentagem = Math.min((lidosCount / meta) * 100, 100);
        barraProgresso.style.width = `${porcentagem}%`;
        
        const textoPorcentagem = document.getElementById('texto-porcentagem');
        if (textoPorcentagem) textoPorcentagem.textContent = `${Math.round(porcentagem)}% concluído`;
    }
}

// 7. ADICIONAR NOVO LIVRO
const formLivro = document.getElementById('form-novo-livro');
if (formLivro) {
    formLivro.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

        const novoLivro = {
            titulo: document.getElementById('input-titulo').value,
            autor: document.getElementById('input-autor').value,
            capaUrl: document.getElementById('input-capa').value,
            statusLeitura: document.getElementById('select-status').value, 
            nota: document.getElementById('input-nota') ? parseInt(document.getElementById('input-nota').value) : null,
            usuario: { id: usuarioLogado.id } 
        };

        try {
            const resposta = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoLivro)
            });

            if (resposta.ok) {
                if (typeof fecharModal === 'function') fecharModal();
                formLivro.reset();
                carregarLivros(); // Atualiza estante e barra de progresso
            } else {
                alert('Erro ao salvar o livro.');
            }
        } catch (erro) {
            console.error('Erro ao adicionar livro:', erro);
            alert('Falha na comunicação com o servidor.');
        }
    });
}

// 8. DELETAR LIVRO
async function deletarLivro(id) {
    if (confirm('Tem certeza que deseja excluir este livro?')) {
        try {
            const resposta = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            if (resposta.ok) {
                carregarLivros(); // Recarrega a lista e estatísticas atualizadas
            } else {
                alert('Erro ao excluir livro.');
            }
        } catch (erro) {
            console.error('Erro:', erro);
        }
    }
}