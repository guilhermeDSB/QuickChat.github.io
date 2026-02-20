# QuickChat - GitHub Pages

Este repositório contém o site do QuickChat hospedado no GitHub Pages.

## Como está configurado

- **Build**: Feito com Vite + React
- **Build Output**: Pasta docs/
- **GitHub Pages Source**: main branch, pasta /docs
- **URL**: https://guilhermeDSB.github.io/QuickChat.github.io/

## Para fazer alterações

1. Edite os arquivos no diretório src/
2. Execute 
pm install e 
pm run build
3. Faça commit e push dos arquivos da pasta docs/

## Configuração no GitHub

Certifique-se de que no repositório, em **Settings > Pages**:
- Source está configurado como Deploy from a branch
- Branch está configurado como main
- Folder está configurado como / (root) ou /docs dependendo da configuração

## Notas importantes

- O arquivo .nojekyll garante que o GitHub Pages não processa os arquivos com Jekyll
- A configuração ase: '/QuickChat.github.io/' no ite.config.ts é necessária para que os caminhos das assets funcionem corretamente
