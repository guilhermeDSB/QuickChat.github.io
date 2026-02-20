# QuickChat - GitHub Pages

Este repositório contém o site do QuickChat hospedado no GitHub Pages.

## Como está configurado

- **Tipo**: Site informativo estático
- **GitHub Pages Source**: main branch, pasta /docs
- **URL**: https://guilhermeDSB.github.io/QuickChat.github.io/

## Sobre o Projeto

QuickChat é uma aplicação de compartilhamento de arquivos e chat em tempo real que roda em Node.js com Socket.IO. 

Como o GitHub Pages só hospeda sites estáticos e não pode executar código Node.js do lado do servidor, este site serve apenas para fornecer informações sobre o projeto.

## Para Executar Localmente

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure a chave da API do Gemini no `.env`
4. Execute o servidor: `npm start`

## Para Deploy em Produção

Para usar o QuickChat completamente funcional, você precisa implantá-lo em um serviço que suporte Node.js:

- Heroku
- Vercel (com funções serverless)
- Render
- DigitalOcean App Platform
- AWS Elastic Beanstalk

## Notas importantes

- O arquivo .nojekyll garante que o GitHub Pages não processe os arquivos com Jekyll
- O conteúdo real do QuickChat requer um ambiente Node.js para funcionar
