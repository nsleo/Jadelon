# Retoque Manual do Mapa de Jadelon v0.1

1. Abra `assets/derived/cartography/manual-retouch/v0.1/mapa-retouch-source.png`.
2. Edite somente o que estiver autorizado por `allowed-edit-mask.png` e pelos pacotes em `labels/`.
3. Exporte um PNG com as mesmas dimensoes: `2048 x 1536`.
4. Devolva o arquivo final e valide com:

```bash
npm run validate:manual-map -- /caminho/do/mapa-base-clean-manual.png
```

O retorno nao aprova visualmente o mapa; ele apenas valida integridade tecnica e alteracoes fora da area permitida.
