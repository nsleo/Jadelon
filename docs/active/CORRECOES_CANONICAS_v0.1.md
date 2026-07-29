# Jadelon — Correções canônicas ativas
Versão 0.1

Este arquivo registra correções que prevalecem sobre interpretações anteriores.

## 1. Zan-Hau

Os documentos **Eventos Históricos** e **Figuras Históricas** descrevem partes complementares do mesmo arco.

A expressão “anos depois”, em **Figuras Históricas**, significa anos depois do episódio do **Poço da Carnificina**, ainda durante as Guerras/Guerra das Fendas. Não significa que Zan-Hau sobreviveu ao conflito.

### Cânone aprovado

- A campanha final ocorre durante a Guerra das Fendas, contra a Casa Dregarr.
- O confronto culmina em Kurn Valgar e na fortaleza/castelo ligado ao poder de Dregarr.
- Zan-Hau lidera seus soldados numa marcha final.
- Todos os seus soldados morrem durante o avanço.
- Mesmo atingido por flechas, lanças e outros golpes, ele continua avançando.
- Ele invade a fortaleza.
- Diante do rei, zomba dele e ri de sua incapacidade de detê-lo.
- É decapitado por um guarda.
- Sua morte encerra a resistência e fortalece sua lenda como o Imortal das Fendas.

### Estado editorial

```ts
canonStatus: "approved"
recordState: "confirmed"
```

Não tratar como:

- duas mortes;
- contradição;
- boato versus fato;
- morte posterior à Guerra das Fendas.

## 2. Regra de auditoria

Antes de declarar qualquer nova contradição, cruzar todas as ocorrências relevantes no export original e nos documentos ativos.

## 3. Guerra das Fendas

O export original, na página **Cronologia**, confirma que:

- a Guerra das Fendas ocorre dentro da Era Política;
- começa no ano 6.000;
- termina no ano 6.040.

### Cânone aprovado

- `eraIds: ["era-politica"]`
- `yearStart: 6000`
- `yearEnd: 6040`

### Estado editorial

```ts
canonStatus: "approved"
recordState: "confirmed"
```
