# GestClass

Sistema web para registrar e organizar os **abonos, TREs e atestados dos professores** da Escola Classe 2, escola pública de educação infantil do Distrito Federal.

Projeto de extensão da disciplina *Extensão: Cooperação, Humanismo Solidário, Redes e Comunidades*, do curso de Engenharia de Software da Universidade Católica de Brasília (UCB).

## O problema

Na Escola Classe 2, os registros de abonos, TREs e atestados dos professores ficam espalhados em papéis e planilhas soltas. Isso dificulta a consulta pela direção e o apoio aos processos oficiais junto à SEEDF. A demanda partiu da própria direção da escola.

## A solução

O GestClass reúne esses registros em um só lugar, com acesso restrito à direção e à secretaria. O foco é a **organização interna**: o sistema não tem fluxo de aprovação e não substitui nenhum processo oficial da escola.

### Funcionalidades

- **Lançamentos:** lista de abonos, TREs e atestados, com filtros por professor, mês e tipo.
- **Novo lançamento:** cadastro com professor, tipo, período, protocolo, observação e indicação de documento entregue.
- **Relatórios:** resumo por professor, com exportação em planilha (CSV) e impressão ou salvamento em PDF.
- **Login e cadastro:** acesso por e-mail e senha, com criação de conta e recuperação de senha. Contas novas ficam pendentes até um administrador aprovar.
- **Usuários (administradores):** aprovar, recusar ou bloquear contas e dar ou tirar o papel de administrador.

### Contas e permissões

- A **primeira conta criada** no sistema vira administradora automaticamente.
- As demais contas ficam **pendentes** e só acessam os dados depois de aprovadas na tela **Usuários**.
- Cada conta tem um perfil em `usuarios/{uid}` no Firestore (`nome`, `email`, `papel`, `status`, `criadoEm`).
- Perfis antigos, criados à mão no console sem `status`, continuam valendo como aprovados.
- As regras em `firestore.rules` garantem tudo isso no servidor. Ninguém aprova a si mesmo nem altera a própria conta.

### Fora do escopo desta versão

- Anexo digital do documento (o campo já está reservado no modelo de dados).
- Cadastro próprio de professores.
- Fluxo de aprovação dos pedidos.

## Cuidados com os dados (LGPD)

Atestados médicos são dados sensíveis, e por isso o sistema segue estes princípios:

- **Acesso restrito:** apenas usuários autorizados leem ou gravam dados, o que é garantido pelas regras de segurança do Firestore (`firestore.rules`).
- **Coleta mínima:** o sistema não pede diagnóstico nem CID.
- **Sem dados reais no repositório:** nenhuma informação de professores deve ser enviada ao GitHub.

## Tecnologias

- React com Vite
- Firebase Authentication e Cloud Firestore (plano gratuito)
- GitHub Pages para publicação


## Equipe

- Leonardo Esquivel Couto
- Hugo Ferreira Vasconcelos
- Leonardo Gomes da Silva Nunes
- João Vitor Higino Silva

Engenharia de Software, Universidade Católica de Brasília.

## Como rodar

1. Crie o arquivo `.env` com as chaves do app Web do Firebase:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
2. No Firebase Console, ative **Authentication > Sign-in method > E-mail/senha**.
3. Publique as regras do Firestore: `npx firebase-tools login` e depois `npx firebase-tools deploy --only firestore:rules`.
4. `npm install` e `npm run dev`. No Windows, se o PowerShell bloquear o npm ("execução de scripts foi desabilitada"), use o Prompt de Comando (cmd) ou `npm.cmd run dev`.

Para testar sem mexer nos dados reais, use os emuladores: `npx firebase-tools emulators:start --only auth,firestore` (precisa de Java 11+) e rode o app com `VITE_FIREBASE_EMULADOR=true`.
