# Landing page – Nicole Paula | Lash designer

Site estático (HTML + CSS + JS puro) para o GitHub Pages.

## Publicar
1. Envie **todo o conteúdo desta pasta** para um repositório no GitHub.
2. Em *Settings → Pages*, escolha a branch `main` e a pasta `/ (root)`.

## Onde editar (arquivo `script.js`, no topo)
- `WHATSAPP_NUMBER` e `WHATSAPP_MESSAGE`
- `INSTAGRAM_URL`
- `galleryTitles` (nome de cada pasta/coleção; pasta sem nome aparece como "Trabalhos")

## Adicionar ou remover fotos e vídeos
Coloque os arquivos em `assets/01` … `assets/07` (ou crie `assets/08`, `assets/09`…), com nomes numéricos (`01.webp`, `02.mp4`…).
A lista (`galleries.js`) é recriada sozinha pelo GitHub (workflow em `.github/workflows`) a cada envio.
Para gerar localmente: `python3 scripts/gerar_galerias.py`.

## Identidade
`assets/00/00.webp` é a imagem do hero (não vira carrossel).
Depois de publicar, troque o caminho de `og-image` no `index.html` pela URL completa do site.
