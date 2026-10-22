# GestClass

Sistema web para registrar e organizar abonos, TREs e atestados dos professores da Escola Classe 2.
React + Vite + Firebase (Authentication e Firestore). Hospedagem: GitHub Pages.

## 1. Rodar localmente
```bash
npm install
cp .env.example .env   # preencha com os dados do app web do Firebase
npm run dev
```

## 2. Configurar o Firebase (plano gratuito Spark)
1. Console do Firebase > criar projeto > adicionar app **Web** e copiar as chaves para o `.env`.
2. **Authentication** > ativar "E-mail/senha" > criar os usuários da direção e da secretaria.
3. **Firestore Database** > criar banco na região **southamerica-east1 (São Paulo)**.
4. Colar o conteúdo de `firestore.rules` em Firestore > Regras > Publicar.
5. Para autorizar um usuário: em Firestore, criar o documento `usuarios/{UID do usuário}` (pode ter o campo `papel: "direcao"`). Sem esse documento, o usuário entra mas não lê nem grava dados.

## 3. Publicar no GitHub Pages
1. Repositório > Settings > Pages > Source: **GitHub Actions**.
2. Settings > Secrets and variables > Actions: criar os secrets `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`.
3. Firebase > Authentication > Configurações > Domínios autorizados: adicionar `SEU-USUARIO.github.io`.
4. A cada push na branch `main`, o workflow publica o site.

## Modelo de dados (Firestore)
- `lancamentos/{id}`: `professorNome`, `tipo` (abono | tre | atestado), `dataInicio`, `dataFim`, `observacao`, `documentoEntregue`, `protocolo`, `anexo` (reservado, nulo por enquanto), `criadoEm`, `criadoPor`.
- `usuarios/{uid}`: libera o acesso ao sistema.

## Cuidados (LGPD)
- Não registrar diagnóstico ou CID. Nunca subir dados reais ao repositório.
- Testar as regras do Firestore antes de usar dados reais (aba "Regras" > Simulador).
