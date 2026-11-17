# Pipeline de segurança com SAST e DAST

![Pipeline](https://github.com/0RafaelLucas/Pipeline-Dev_ops-/actions/workflows/pipeline.yml/badge.svg)

Projeto da atividade de pipeline com GitHub Actions e gitflow. Ele tem duas partes independentes: a esteira de segurança e a página web.

Autor: SEU NOME

## 1. Esteira (Segurança)

Fica em `.github/workflows/pipeline.yml`. A cada push ou Pull Request, o GitHub executa:

1. **SAST (Semgrep):** analisa o código da página sem executá-lo e falha se achar algo de severidade ERROR. Usa as regras padrão do Semgrep e as regras próprias de `.semgrep/regras.yml`.
2. **DAST (OWASP ZAP):** sobe a página e a escaneia como um invasor faria. Falha se a página não responder ou se houver alerta de risco alto, conferido por `scripts/verificar_zap.py`. O relatório fica salvo na execução.
3. **Deploy:** publica a página no GitHub Pages. Só roda na branch `main`, depois que o SAST e o DAST passarem.

A esteira analisa tudo o que estiver na pasta `pagina/`, sem depender do conteúdo dela.

## 2. Página (Desenvolvimento Web)

Fica na pasta `pagina/`, feita com HTML, CSS e JavaScript. O arquivo inicial é o `pagina/index.html`.

Página publicada: https://0rafaellucas.github.io/Pipeline-Dev_ops-/

## Estrutura

```
.
├── pagina/                       # página web (HTML, CSS, JS)
│   └── index.html
├── scripts/
│   └── verificar_zap.py          # validação do DAST
├── .semgrep/
│   └── regras.yml                # regras próprias do SAST
└── .github/workflows/
    └── pipeline.yml              # esteira de segurança
```

## Gitflow

O fluxo é: `feature/*` → `develop` → `main`.

- `main`: versão final, a que fica publicada.
- `develop`: integração das novidades.
- `feature/*`: onde cada alteração é feita.

## Como usar

1. Envie os arquivos para o repositório no GitHub.
2. Em **Settings → Pages → Source**, escolha **GitHub Actions**.
3. Acompanhe a execução na aba **Actions**.

## Demonstração

- **SAST funcionando:** acrescentar `<script>eval("1+1")</script>` ao `pagina/index.html` faz o SAST falhar. O DAST e o deploy não rodam.
- **Alteração de texto:** mudar o texto do `pagina/index.html` e fazer o merge na `main` faz a esteira rodar e publicar a nova versão em 1 a 2 minutos.
