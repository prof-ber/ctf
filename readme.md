# Exercício Blue Team - Aplicação Web Vulnerável

## Objetivo

Esta aplicação contém múltiplas vulnerabilidades de segurança. Sua missão é identificar e corrigir todas as vulnerabilidades antes que o Red Team consiga roubar a flag do banco de dados.

## Vulnerabilidades Conhecidas

1. **SQL Injection** no endpoint de login
2. **SQL Injection** no endpoint de busca de mensagens
3. **XSS (Cross-Site Scripting)** no chat em tempo real
4. **XSS** nos resultados de busca e login
5. Credenciais hardcoded no código
6. Senha fraca para acesso à flag

## Como Executar

1. Instale as dependências: `npm install`
2. Configure o banco MySQL executando o script `database.sql`
3. Inicie o servidor: `npm start`
4. Acesse: http://localhost:3000

## Tarefas do Blue Team

- [ ] Identificar todos os pontos de SQL Injection
- [ ] Identificar todos os pontos de XSS
- [ ] Implementar prepared statements para SQL
- [ ] Implementar sanitização de inputs/outputs
- [ ] Remover credenciais hardcoded
- [ ] Implementar autenticação segura
- [ ] Adicionar CSP (Content Security Policy)

Boa sorte!
