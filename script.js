// O endereço do seu Java (ajuste se a porta for diferente)
const API_URL = 'http://localhost:8080/livros';

async function carregarEstanteDoJava() {
    const container = document.getElementById('estante-container');

    try {
        const resposta = await fetch(API_URL);
        const livros = await resposta.json();

        // Limpa os cards de teste para colocar os reais
        container.innerHTML = '';

        // Percorre cada livro que veio do banco de dados
        livros.forEach(livro => {
            
            // 1. Define a cor da tag baseado no status
            let tagStatus = '';
            if (livro.statusLeitura === 'LIDO') {
                tagStatus = `<span class="absolute top-5 left-5 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-bold z-10">Lido</span>`;
            } else if (livro.statusLeitura === 'LENDO') {
                tagStatus = `<span class="absolute top-5 left-5 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold z-10">Lendo</span>`;
            }

            // 2. Monta as estrelinhas amarelas
            let estrelas = '';
            const nota = livro.nota || 0;
            for (let i = 1; i <= 5; i++) {
                if (i <= nota) {
                    estrelas += '★'; // Estrela preenchida
                } else {
                    estrelas += '<span class="text-slate-200">★</span>'; // Estrela cinza vazia
                }
            }

            // 3. Verifica a capa (se não tiver, coloca uma padrão)
            const capa = livro.capaUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300&auto=format&fit=crop';

            // 4. Cria o HTML do card perfeitamente estilizado
            const cardHTML = `
                <div class="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 min-w-[160px] shrink-0 relative transition-transform hover:scale-105">
                    ${tagStatus}
                    <img src="${capa}" class="w-full h-36 object-cover rounded-xl mb-3">
                    <h3 class="font-bold text-sm text-slate-800 truncate" title="${livro.titulo}">${livro.titulo}</h3>
                    <p class="text-[11px] text-slate-500 mb-1 truncate">${livro.autor}</p>
                    <div class="text-yellow-400 text-[10px]">${estrelas}</div>
                </div>
            `;
            
            container.innerHTML += cardHTML;
        });

        // 5. Por fim, recoloca o card vazio de "Adicionar" no final da lista
        container.innerHTML += `
            <div class="border-2 border-dashed border-slate-200 rounded-2xl min-w-[160px] shrink-0 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-500 transition-colors cursor-pointer min-h-[220px]">
                <i class="ph ph-plus text-2xl mb-2"></i>
                <span class="text-xs font-medium">Adicionar livro</span>
            </div>
        `;

    } catch (erro) {
        console.error("Erro ao buscar livros do Java:", erro);
        container.innerHTML = '<p class="text-red-500 text-sm">Erro ao conectar com o servidor.</p>';
    }
}

// Inicia a função assim que o arquivo for lido
carregarEstanteDoJava();