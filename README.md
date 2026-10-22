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
- **Login:** acesso por e-mail e senha, liberado apenas para usuários autorizados.

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
