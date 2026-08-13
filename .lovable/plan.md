# Plano de Importação: EleganceSalon

Este plano descreve as etapas para importar fielmente o projeto [EleganceSalon](https://github.com/hassanwaheedali/EleganceSalon) para este ambiente, preservando sua stack original (React 18+, Vite 7, Tailwind 4, GSAP, Three.js).

## Passos de Implementação

### 1. Preparação do Ambiente
- Remover arquivos da estrutura padrão do Lovable (TanStack Router) que conflitam com a estrutura do projeto original (React Router DOM).
- Instalar as dependências exatas do repositório original.

### 2. Migração de Arquivos
- Copiar todo o conteúdo de `/src`, `/public`, `index.html`, `vite.config.js` e `package.json` do repositório clonado para a raiz do projeto.
- Garantir que a estrutura de diretórios seja mantida identicamente.

### 3. Ajustes de Configuração e Compatibilidade
- Manter o `vite.config.js` original com seus aliases para evitar duplicação do React.
- Configurar o Tailwind 4 conforme definido no projeto original (usando `@tailwindcss/vite`).

### 4. Validação e Testes
- Verificar se todas as rotas (Home, Login, Admin, Staff, etc.) estão operacionais.
- Validar as animações (GSAP, Lenis, Framer Motion) e o Hero Canvas (Three.js).
- Testar o sistema de agendamento e o uso de `localStorage`.
- Executar `npm run build` para garantir a integridade do projeto.

## Detalhes Técnicos
- **Stack:** React 18.3, Vite 7, Tailwind CSS 4, GSAP, Three.js, React Router DOM 7.
- **Roteamento:** O projeto usa `createBrowserRouter` (React Router DOM), portanto a estrutura `src/routes` do TanStack será substituída pelo roteamento original em `src/App.jsx` e `src/main.jsx`.
- **Persistência:** Baseada exclusivamente em `localStorage` (allUsers, EleganceStaff, Appointments, currentUser).
