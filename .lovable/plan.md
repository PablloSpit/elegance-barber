# Plano de Integração: Barber's Center -> Elegance Salon

Este plano detalha a implementação das funcionalidades extraídas das 23 imagens de referência, consolidando o sistema com tradução completa para Português (BR), moeda em Reais (R$) e novas funcionalidades administrativas.

## 🎨 UI/UX & Design System
- **Tema:** Manter o "Tactile Obsidian" (Dark, elegante, acentos em dourado/champberry).
- **Responsividade:** Garantir que todos os novos modais e tabelas sejam mobile-first.
- **Feedback Visual:** Implementar Toast notifications para todas as ações (sucesso/erro).

## 🛠️ Funcionalidades Admin (Barber's Center)

### 1. Gestão de Equipe (Staff)
- **Campos Adicionais:** Adicionar campo de "Comissão (%)" nos modais de Criar/Editar Barbeiro.
- **Persistência:** Atualizar `StaffContext.jsx` para suportar comissões e persistir no `localStorage`.

### 2. Gestão de Serviços
- **Nova Página:** Criar `src/Pages/Admin/Services.jsx`.
- **CRUD:** Listagem, criação e edição de serviços (Nome, Preço R$, Duração min).
- **Modal:** Criar `AddServiceModal.jsx` e `EditServiceModal.jsx`.

### 3. Agenda Avançada
- **Visualização:** Implementar a visualização diária com status (Pendente, Finalizado, Cancelado, Em andamento, Faltou).
- **Agendamento Manual:** Modal para o administrador agendar horários diretamente.

### 4. Configurações de Negócio
- **Página de Perfil:** Adicionar campos de bio, telefone e link de agendamento ("Meu Link").
- **Regras de Negócio:** Configurar horários de abertura, intervalos e modo feriado (bloqueio de datas).

### 5. Estoque & Relatórios
- **Estoque:** Refinar a listagem de produtos com busca e alertas de estoque baixo.
- **Relatórios:** Dashboard financeiro com Receita Total, Ticket Médio e Ranking de Barbeiros.

## 🌎 Internacionalização (i18n)
- **Tradução 100%:** Mapear todos os textos restantes em inglês para o `src/i18n/pt-BR.json`.
- **Moeda:** Garantir que todos os valores usem `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.

## 🛡️ Segurança & Proteção
- **Senhas:** Implementar a troca de senha na página de Configurações.
- **Privacidade:** Garantir que apenas administradores vejam relatórios financeiros.

## 📐 Detalhes Técnicos
- **Stack:** React 18, Tailwind 4, Lucide Icons, Recharts (para relatórios).
- **Estado:** Context API + localStorage (estratégia atual do projeto).
