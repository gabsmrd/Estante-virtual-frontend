const API_URL = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. LÓGICA DE CADASTRO
    const formCadastro = document.getElementById('form-cadastro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', async (e) => {
            e.preventDefault();

            const novoUsuario = {
                nome: document.getElementById('nome-cadastro').value,
                email: document.getElementById('email-cadastro').value,
                senha: document.getElementById('senha-cadastro').value,
                metaLeitura: 20, // Meta inicial padrão
                fotoUrl: "https://i.pravatar.cc/150?img=5" // Foto padrão
            };

            try {
                const response = await fetch(`${API_URL}/usuarios/cadastrar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(novoUsuario)
                });

                if (response.ok) {
                    const usuarioCriado = await response.json();
                    alert(`Conta criada com sucesso, ${usuarioCriado.nome}! Faça seu login.`);
                    trocarAba('login'); // Alterna para a aba de login
                } else {
                    alert('Erro ao criar conta. Tente outro e-mail!');
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Não foi possível conectar ao servidor Java!');
            }
        });
    }

    // 2. LÓGICA DE LOGIN
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();

            const dadosLogin = {
                email: document.getElementById('email-login').value,
                senha: document.getElementById('senha-login').value
            };

            try {
                const response = await fetch(`${API_URL}/usuarios/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosLogin)
                });

                if (response.ok) {
                    const usuario = await response.json();
                    
                    // Salva os dados do usuário logado no navegador
                    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
                    
                    // Redireciona para o Dashboard
                    window.location.href = 'index.html';
                } else {
                    alert('E-mail ou senha incorretos!');
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao conectar ao servidor Java!');
            }
        });
    }
});