# Plano de Integração: Barbearia "Tactile Obsidian"

Este plano detalha a implementação das funcionalidades de gestão de equipe, serviços e configurações baseadas nas referências visuais do "Barber's Center", mantendo a estética "Tactile Obsidian" e a localização em Português (BR).

## 1. Gestão de Equipe (Staff)
*   **Modais de Adição/Edição:** Atualizar `AddStaffModal.jsx` e `EditStaffModal.jsx` para incluir o campo "Comissão (%)" visível nas imagens, garantindo que o valor seja persistido no `StaffContext`.
*   **Listagem de Equipe:** Refinar `Staffs.jsx` para exibir a comissão e o status de forma mais proeminente, seguindo o layout mobile das imagens.
*   **Tradução:** Garantir que todos os campos nos modais (Nome completo, Email, Telefone, Comissão) estejam traduzidos no `pt-BR.json`.

## 2. Gestão de Serviços
*   **Página de Serviços:** Implementar `src/Pages/Admin/Services.jsx` (que estava ausente) para listar os serviços com Preço (R$) e Duração (minutos).
*   **Modal de Novo Serviço:** Criar `src/Components/AdminPanel Components/AddServiceModal.jsx` com os campos: Nome do Serviço, Preço (R$) e Duração (minutos), conforme a referência.

## 3. Painel do Cliente e Configurações
*   **Minha Conta:** Atualizar `Account.jsx` e seu componente `Profile.jsx` para incluir a seção de "Segurança" (Alterar Senha) conforme a imagem de preferências.
*   **Configurações do Sistema:** Implementar campos de "Identidade da Barbearia" e "Regras de Negócio" (Horário de funcionamento, Intervalos) em `Configuration.jsx`.

## 4. Funcionalidades Avançadas (Fase 2)
*   **Modo Feriado:** Adicionar funcionalidade de bloqueio de datas no calendário em `Configuration.jsx`.
*   **Link de Agendamento:** Exibir o link personalizado do barbeiro no painel do staff.
*   **Webhooks e Assinaturas:** Preparar a estrutura para integração de gateways de pagamento futuros.

## Detalhes Técnicos
*   **Design Tokens:** Uso estrito de `text-champberry`, `bg-obsidian-surface` e `border-white/5`.
*   **Persistência:** `localStorage` via `StaffContext` e `AuthContext`.
*   **I18n:** Uso centralizado de `pt-BR.json`.
