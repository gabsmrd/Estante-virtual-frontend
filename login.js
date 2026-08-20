const API_URL = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = loginForm.querySelector('input[type="email"]');
            const senhaInput = loginForm.querySelector('input[type="password"]');

            try {
                const response = await fetch(`${API_URL}/usuarios/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: emailInput.value,
                        senha: senhaInput.value
                    })
                });

                if (response.ok) {
                    const usuario = await response.json();
                    
                    // 1. Salva o usuário retornado do MySQL no navegador
                    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
                    
                    // 2. Redireciona do login para o index.html
                    window.location.href = 'index.html';
                } else {
                    alert('E-mail ou senha incorretos!');
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao conectar com o servidor Java!');
            }
        });
    }
});