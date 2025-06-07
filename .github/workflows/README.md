# GitHub Actions Workflows

Este directorio contiene los workflows de CI/CD para el proyecto.

## Workflows

### `test.yml`
- **Propósito**: Ejecuta tests básicos en múltiples versiones de Node.js
- **Trigger**: Push y PRs a main/develop
- **Acciones**: 
  - Tests
  - Linting  
  - Build de producción

### `ci.yml`
- **Propósito**: Pipeline completo de CI/CD
- **Trigger**: Push y PRs a main/develop
- **Acciones**:
  - Quality checks (tests, lint, build)
  - TypeScript type checking

## Comandos de Test Locales

```bash
npm run test              # Ejecutar tests
npm run test:watch        # Tests en modo watch
npm run test:coverage     # Tests con reporte de cobertura
npm run lint              # ESLint
npm run build             # Build de producción
npm run build:test        # Tests + build
```