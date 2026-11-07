# Telão

Sala de voz com compartilhamento de tela, estilo Discord. Funciona só com Node.js e a biblioteca `ws`.

## Testar no seu computador
1. Instale o Node.js (nodejs.org, versão 18 ou mais nova).
2. Na pasta do projeto: `npm install` e depois `npm start`.
3. Abra http://localhost:3000 em duas abas para testar.

## Colocar na internet (Render, plano gratuito)
1. Crie uma conta no GitHub e um repositório novo. Envie estes arquivos para ele.
2. Crie uma conta em render.com e escolha New > Web Service. Conecte o repositório.
3. Preencha: Runtime = Node, Build Command = `npm install`, Start Command = `npm start`, Instance Type = Free.
4. Quando terminar, o Render mostra um endereço `https://...onrender.com`. Mande esse link para os amigos.

## Observações
- O plano gratuito do Render hiberna sem uso. O primeiro acesso depois disso pode levar cerca de 1 minuto.
- A conexão entre os amigos usa servidores STUN públicos. Em redes muito restritas pode ser necessário um servidor TURN.
- Compartilhar tela só funciona em navegador de computador e em página com https (ou localhost).
