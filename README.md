# Chico Town Burger — site demonstrativo

Site one-page responsivo, mobile-first, em HTML/CSS/JavaScript puro. Sem carrinho, checkout ou pagamento: todos os CTAs de pedido levam ao iFood.

## Rodar localmente
O site carrega `data/menu.json` via `fetch`, então abra com um servidor local (não diretamente pelo `file://`):

```bash
cd chico-town-site
python3 -m http.server 8000
```
Acesse http://localhost:8000

## Estrutura
- `index.html` — estrutura, SEO e conteúdo das seções
- `styles.css` — identidade visual, responsividade e animações
- `app.js` — renderização do cardápio, status de funcionamento, quiz e navegação
- `data/menu.json` — conteúdo editável do cardápio, unidades, links e informações da marca
- `assets/chico-avatar.jpg` — recorte do avatar enviado pelo cliente para representar o mascote

## Atualização pelo proprietário
Edite `data/menu.json` para mudar preços, descrições, links, endereços ou horários. O campo `price` aceita número ou `null` (ex.: preço ainda não confirmado). Para São Miguel, `hours: null` mantém o status como “Horário a confirmar”.

## Observações
- A seção AuMigos não foi publicada: depende da confirmação de que o local é pet friendly.
- As áreas da grade Instagram são placeholders intencionais, não fotos de comida inventadas.
- O mascote foi recortado do avatar de Instagram enviado. Para uso final, substituir por arquivo original em alta resolução/transparente.
- Os horários de feriados são mostrados conforme a informação recebida, mas a regra automática de status considera os dias da semana; confirmar se o horário de feriados é sempre igual.
- Os mapas são incorporados via pesquisa de endereço do Google Maps; validar os pins antes da publicação.
- O horário automático usa `America/Sao_Paulo`.
