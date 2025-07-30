# Estrutura de Testes - Rider Finance Frontend

## ✅ Status Atual

### Dashboard Component
- **18/18 testes passando** 
- **Cobertura**: 100% Statements, 91.17% Branch, 100% Functions, 100% Lines
- **Status**: ✅ **COMPLETO**

### Próximos Componentes
- **Sidebar**: 🔄 **PENDENTE**
- **Header**: 🔄 **PENDENTE**
- **LoginPage**: 🔄 **PENDENTE**
- **ThemeProvider**: 🔄 **PENDENTE**
- **AuthGuard**: 🔄 **PENDENTE**

## 🏗️ Arquitetura de Testes

### Estrutura de Diretórios
```
src/
├── components/
│   ├── dashboard/
│   │   ├── Dashboard.tsx
│   │   └── __tests__/
│   │       ├── Dashboard.test.tsx
│   │       ├── __mocks__/
│   │       │   └── dashboardMockData.ts
│   │       └── COVERAGE.md
│   ├── sidebar/
│   │   ├── Sidebar.tsx
│   │   └── __tests__/          # TODO
│   ├── header/
│   │   ├── Header.tsx
│   │   └── __tests__/          # TODO
│   └── auth/
│       ├── LoginPage.tsx
│       ├── AuthGuard.tsx
│       └── __tests__/          # TODO
├── store/
│   ├── context.tsx
│   ├── reducer.ts
│   └── __tests__/              # TODO
└── services/
    ├── api.ts
    └── __tests__/              # TODO
```

### Padrões Estabelecidos

#### 1. **Naming Convention**
- Arquivos de teste: `*.test.tsx`
- Mocks: `__mocks__/componentMockData.ts`
- Coverage: `COVERAGE.md`

#### 2. **Test Organization**
```typescript
describe('ComponentName', () => {
  describe('Renderização Básica', () => {
    // Testes de renderização sem erros
  })
  
  describe('Exibição de Dados', () => {
    // Testes de dados e formatação
  })
  
  describe('Interações do Usuário', () => {
    // Testes de clicks, forms, etc
  })
  
  describe('Estados de Erro', () => {
    // Testes de fallbacks e edge cases
  })
})
```

#### 3. **Mock Pattern**
```typescript
// Mock do contexto global
const mockContextValue = {
  state: mockAppState,
  dispatch: jest.fn(),
  actions: mockActions,
  // ...
}

// Wrapper para providers
const TestWrapper = ({ children }) => (
  <ThemeProvider theme={darkTheme}>
    <AppContext.Provider value={mockContextValue}>
      {children}
    </AppContext.Provider>
  </ThemeProvider>
)
```

#### 4. **Assertion Patterns**
```typescript
// Presença de elementos
expect(screen.getByText('Texto')).toBeInTheDocument()

// Múltiplas ocorrências
const elements = screen.getAllByText('Valor')
expect(elements.length).toBeGreaterThan(0)

// Interações
fireEvent.click(screen.getByText('Botão'))
expect(screen.getByText('Novo Estado')).toBeInTheDocument()
```

## 🛠️ Tecnologias de Teste

### Core Testing
- **Jest**: Framework de testes principal
- **@testing-library/react**: Utilitários para testes de componentes
- **@testing-library/jest-dom**: Matchers customizados para DOM
- **@testing-library/user-event**: Simulação de eventos do usuário

### Mocking & Utilities
- **Jest Mocks**: Para funções e módulos
- **Custom Hooks Mocking**: Para useApp, useRouter, etc
- **Provider Mocking**: Para Context API, Theme Provider

### Coverage & Reporting
- **Jest Coverage**: Relatórios de cobertura de código
- **HTML Reports**: Para análise visual de cobertura
- **LCOV**: Para integração com ferramentas externas

## 📋 Scripts de Teste

```bash
# Executar todos os testes
npm test

# Executar testes específicos
npm test -- --testPathPatterns=Dashboard.test.tsx

# Modo watch para desenvolvimento
npm test -- --watch

# Cobertura completa
npm test -- --coverage

# Testes sem watch (CI/CD)
npm test -- --watchAll=false

# Testes com mais detalhes
npm test -- --verbose
```

## 🎯 Metas de Cobertura

### Targets por Componente
- **Statements**: >95%
- **Branches**: >85%
- **Functions**: >95%
- **Lines**: >95%

### Targets Globais (quando todos componentes testados)
- **Statements**: >90%
- **Branches**: >80%
- **Functions**: >90%
- **Lines**: >90%

## 📝 Checklist para Novos Componentes

### 1. Setup
- [ ] Criar diretório `__tests__`
- [ ] Criar arquivo `Component.test.tsx`
- [ ] Criar `__mocks__/componentMockData.ts`
- [ ] Setup do TestWrapper com providers necessários

### 2. Testes Básicos
- [ ] Renderização sem erros
- [ ] Props obrigatórias
- [ ] Renderização condicional
- [ ] Estados iniciais

### 3. Testes de Dados
- [ ] Formatação de valores
- [ ] Exibição de listas
- [ ] Estados vazios
- [ ] Loading states

### 4. Testes de Interação
- [ ] Clicks em botões
- [ ] Formulários
- [ ] Navegação
- [ ] Estados ativos/inativos

### 5. Testes de Edge Cases
- [ ] Dados inválidos
- [ ] Estados de erro
- [ ] Fallbacks
- [ ] Responsividade (se aplicável)

### 6. Coverage & Documentation
- [ ] Executar cobertura
- [ ] Verificar >95% statements
- [ ] Documentar no COVERAGE.md
- [ ] Atualizar este README

## 🚀 Próximos Passos

### Imediatos
1. **Sidebar Tests**: Navegação, responsividade, estado aberto/fechado
2. **Header Tests**: Dropdown de usuário, logout, notificações
3. **LoginPage Tests**: Formulário, validação, autenticação

### Integração
1. **Context Tests**: Store global, actions, reducers
2. **API Tests**: Mocking de requests, error handling
3. **Navigation Tests**: Fluxos completos entre páginas

### E2E (Futuro)
1. **Cypress/Playwright**: Testes end-to-end
2. **Visual Testing**: Screenshot comparison
3. **Performance Testing**: Lighthouse CI

---

**Mantido por**: GitHub Copilot  
**Última atualização**: ${new Date().toLocaleDateString('pt-BR')}  
**Status**: 🔄 Em desenvolvimento ativo
