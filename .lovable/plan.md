# Plano de Implementação: Links Únicos, Gestão de Comissões e Notificações

Este plano detalha a implementação de links de agendamento únicos por funcionário, melhorias no painel de administração (filtros e cálculos de comissão), restrições no painel do funcionário (apenas dados próprios) e ativação do sistema de notificações.

## 1. Links de Agendamento Únicos

*   **Objetivo:** Permitir que cada funcionário tenha um link direto (ex: `/book?staff=ID`) que pré-seleciona o profissional no formulário de agendamento.
*   **Ações:**
    *   Modificar `src/Components/AppointmentForm.jsx` para capturar o parâmetro `staff` da URL usando `useSearchParams`.
    *   Se o parâmetro estiver presente, filtrar os funcionários disponíveis para garantir que apenas o profissional do link seja selecionado para os serviços.
    *   Atualizar o componente `StaffRow.jsx` ou `StaffDetailsModal.jsx` para exibir/copiar o link único do funcionário.

## 2. Melhorias no Painel Administrativo

*   **Objetivo:** Visibilidade total, filtros por funcionário e cálculo de faturamento/comissão.
*   **Ações:**
    *   **Filtros:** Aprimorar o filtro de "Stylist" em `src/Pages/Admin/Appointments.jsx` para ser mais proeminente.
    *   **Cálculos em Reports:** Atualizar `src/Pages/Admin/Reports.jsx` para calcular:
        *   Faturamento Total Bruto.
        *   Valor devido a cada funcionário (baseado no campo `commission` de cada um).
        *   Lucro líquido da barbearia.
    *   **Dashboard:** Garantir que o `Dashboard.jsx` administrativo reflita esses números consolidados.

## 3. Restrições no Painel do Funcionário

*   **Objetivo:** Garantir privacidade e foco nos dados do próprio profissional.
*   **Ações:**
    *   Revisar `src/Pages/Staff/StaffDashboard.jsx` e `src/Pages/Staff/StaffAppointments.jsx`.
    *   Implementar filtros forçados para que o `currentUser.id` (do tipo staff) limite todos os resultados exibidos.
    *   Adicionar visualização de produtos vendidos e faturamento individual (comissões realizadas).

## 4. Ativação do Sistema de Notificações

*   **Objetivo:** Alertas visuais e sonoros para novos agendamentos.
*   **Ações:**
    *   Integrar a configuração de "Alert Sounds" em `Configuration.jsx` com o `AppointmentContext`.
    *   No `AppointmentContext.jsx`, disparar uma notificação (via `MessageContext` e opcionalmente um som HTML5) sempre que a lista de agendamentos aumentar.
    *   Implementar uma central de notificações (Toast ou Bell icon) que liste eventos recentes.

## Detalhes Técnicos

*   **Persistência:** Continuaremos usando `localStorage` conforme o padrão atual do projeto.
*   **Cálculo de Comissão:** `Faturamento_Item * staff.commission`.
*   **Roteamento:** Uso de `URLSearchParams` para os links de agendamento.
*   **Internacionalização:** Todas as novas labels e mensagens serão adicionadas ao `pt-BR.json`.
