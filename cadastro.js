const API_URL = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', () => {
    const formCadastro = document.getElementById('formCadastro');

    if (formCadastro) {
        formCadastro.addEventListener('submit', async (e) => {
            // Impede a página de atualizar automaticamente ao clicar
            e.preventDefault(); 

            console.log('Botão clicado! Coletando dados...');

            // Captura os valores digitados usando os IDs dos inputs
            const nome = document.getElementById('nomeCadastro').value;
            const email = document.getElementById('emailCadastro').value;
            const senha = document.getElementById('senhaCadastro').value;

            const novoUsuario = {
                nome: nome,
                email: email,
                senha: senha,
                metaLeitura: 30, // Valor padrão
                fotoUrl: "https://i.pravatar.cc/150?img=5" // Foto padrão
            };

            try {
                // Envia para o Spring Boot no Java
                const response = await fetch(`${API_URL}/usuarios/cadastrar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(novoUsuario)
                });

                if (response.ok) {
                    const usuarioCriado = await response.json();
                    alert(`Conta criada com sucesso para ${usuarioCriado.nome}! Faça seu login.`);
                    window.location.href = 'login.html'; // Vai para a tela de login
                } else {
                    alert('Erro ao cadastrar! Verifique os dados informados.');
                }
            } catch (error) {
                console.error('Erro de conexão:', error);
                alert('Servidor Java offline. Verifique se a aplicação Spring Boot está rodando!');
            }
        });
    } else {
        console.error('Formulário de cadastro com o ID "formCadastro" não foi encontrado no HTML.');
    }
});