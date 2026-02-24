# 🤝 Guía para Contribuciones

¡Gracias por tu interés en contribuir a Chatbot de Clínica Medical! Este documento explica cómo participar en el proyecto.

## Tabla de Contenidos
1. [Código de Conducta](#código-de-conducta)
2. [¿Cómo Contribuir?](#cómo-contribuir)
3. [Proceso de Desarrollo](#proceso-de-desarrollo)
4. [Estándares de Código](#estándares-de-código)
5. [Testing](#testing)
6. [Documentación](#documentación)
7. [Pull Requests](#pull-requests)

---

## Código de Conducta

### Nuestra Promesa

Nos comprometemos a proporcionar un ambiente acogedor, inclusivo y libre de acoso para todos.

### Comportamiento Esperado
- ✅ Ser respetuoso con diferentes opiniones
- ✅ Aceptar crítica constructiva
- ✅ Enfocarse en lo mejor para la comunidad
- ✅ Mostrar empatía hacia otros miembros

### Comportamiento Inaceptable
- ❌ Lenguaje ofensivo o hostigador
- ❌ Ataques personales
- ❌ Acoso sexual o discriminación
- ❌ Spam o auto-promoción

**Reportar abuso:** soporte@clinicasanjose.com

---

## ¿Cómo Contribuir?

### Opción 1: Reportar Bugs 🐛

Si encuentras un bug:

1. **Verifica** que no esté reportado en [Issues](https://github.com/tu-usuario/clinica-chatbot/issues)
2. **Abre un Issue** con:
   - Título claro y descriptivo
   - Pasos para reproducir
   - Resultado esperado vs actual
   - Entorno (navegador, SO, versión Node)
   - Screenshots/videos si aplica

**Template:**
```markdown
## Descripción
Descripción clara del problema

## Pasos para Reproducir
1. Ir a...
2. Hacer click en...
3. Observar...

## Resultado Esperado
Debería...

## Resultado Actual
Pero sucede...

## Entorno
- Navegador: Chrome 125.0
- SO: Windows 11
- Node: v18.16.0
- npm: 9.6.4
```

### Opción 2: Sugerir Mejoras 💡

Proponer features nuevas:

1. **Antecedentes:** ¿Por qué es útil?
2. **Propuesta:** ¿Cómo funcionaría?
3. **Alternativas:** ¿Existen otras soluciones?
4. **Complejidad:** ¿Fácil, moderada, alta?

**Template:**
```markdown
## Descripción
Descripción de la mejora

## Motivación
Por qué es útil

## Propuesta Detallada
Cómo implementarla

## Ejemplo
```javascript
// Pseudocódigo o ejemplo de uso
```

## Alternativas Consideradas
- Opción 1...
- Opción 2...
```

### Opción 3: Código 💻

Contribuir con código:

1. Fork el repositorio
2. Clona tu fork localmente
3. Crea rama: `git checkout -b feature/descripcion`
4. Haz cambios y commit
5. Abre Pull Request

---

## Proceso de Desarrollo

### Configurar Entorno de Desarrollo

```bash
# 1. Fork en GitHub
# Click en "Fork" en la esquina superior derecha

# 2. Clonar tu fork
git clone https://github.com/TU-USUARIO/clinica-chatbot.git
cd clinica-chatbot

# 3. Agregar upstream (original)
git remote add upstream https://github.com/ORIGINAL-USUARIO/clinica-chatbot.git

# 4. Instalar dependencias
npm install

# 5. Crear rama
git checkout -b feature/mi-feature

# 6. Verificar que funciona
npm start
```

### Crear Rama

**Nombrado de ramas:**
```bash
feature/nombre-feature          # Nueva funcionalidad
bugfix/nombre-bug              # Arreglo de bug
docs/nombre-doc                # Documentación
refactor/nombre-refactor       # Refactorización
test/nombre-test               # Tests
```

**Ejemplos:**
```bash
git checkout -b feature/agregar-persistencia-historial
git checkout -b bugfix/micrófono-chrome
git checkout -b docs/actualizar-api-reference
```

### Sincronizar con Upstream

```bash
# Traer cambios del original
git fetch upstream
git rebase upstream/main

# O si hay conflictos, usar merge
git merge upstream/main
```

---

## Estándares de Código

### Convenciones de Nombres

**Componentes React:**
```javascript
// ✅ CamelCase para componentes
export default Chatbot
export default useAudioRecording
export default AudioService

// ❌ NO hacer
export default chatbot
export default useaudiorecording
```

**Funciones y Variables:**
```javascript
// ✅ camelCase
const sendMessage = () => {}
let isListening = false
const myVariable = 5

// ❌ NO hacer
const send_message = () => {}
let IsListening = false
const MYVARIABLE = 5
```

**Constantes:**
```javascript
// ✅ UPPER_SNAKE_CASE
const MAX_TOKENS = 2048
const API_TIMEOUT = 60000

// ❌ NO hacer
const maxTokens = 2048
const api_timeout = 60000
```

### Formato de Código

**Indentación:**
```javascript
// ✅ 2 espacios
const sendMessage = () => {
  setMessages(prev => [...prev, msg]);
};

// ❌ NO hacer (4 espacios o tabs)
const sendMessage = () => {
    setMessages(prev => [...prev, msg]);
};
```

**Punto y coma:**
```javascript
// ✅ Siempre incluir
const x = 5;
const fn = () => {};

// ❌ NO hacer (sin punto y coma)
const x = 5
const fn = () => {}
```

**Comillas:**
```javascript
// ✅ Comillas dobles por defecto
const msg = "Hola";

// ✅ Template literals para interpolación
const message = `Hola, ${name}`;

// ❌ NO mezclar
const msg = 'Hola';
```

### Comentarios

**Buenos comentarios:**
```javascript
// ✅ Explica el POR QUÉ, no el QUÉ
// Usar timeout para evitar race conditions cuando 
// el usuario hace click múltiples veces rápido
const debounce = (fn, delay) => {
  let timeoutId;
  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(fn, delay);
  };
};

// ✅ JSDoc para funciones públicas
/**
 * Transcribe audio a texto
 * @param {Blob} audioBlob - Archivo de audio
 * @param {string} language - Código de idioma (ej: 'es')
 * @returns {Promise<string>} Texto transcrito
 * @throws {Error} Si el audio está vacío
 */
export const transcribeAudio = async (audioBlob, language = 'es') => {
  // ...
};
```

**Malos comentarios:**
```javascript
// ❌ Obvio, no agrega información
let x = 5;  // x es 5

// ❌ Código comentado sin explicación
// const oldFunction = () => { ... }

// ❌ Comentarios desactualizados que contradicen el código
// Esta función usa REST API (pero en realidad usa GraphQL)
const fetchData = () => { /* ... */ };
```

---

## Testing

### Escribir Tests

```javascript
// __tests__/miComponente.test.js
import { render, screen } from '@testing-library/react';
import MiComponente from '../MiComponente';

describe('MiComponente', () => {
  test('debería renderizar correctamente', () => {
    render(<MiComponente />);
    expect(screen.getByText(/esperado/i)).toBeInTheDocument();
  });

  test('debería manejar click correctamente', () => {
    render(<MiComponente />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText(/resultado/i)).toBeInTheDocument();
  });
});
```

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Solo un archivo
npm test MiComponente.test.js

# Con coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Requerimientos de Coverage

Mínimos esperados:
- **Statements:** 80%
- **Branches:** 75%
- **Functions:** 80%
- **Lines:** 80%

```bash
npm test -- --coverage --watchAll=false
# Revisar coverage/lcov-report/index.html
```

---

## Documentación

### Documentar Cambios

1. **Actualizar README** si es funcionalidad nueva
2. **Actualizar DOCUMENTATION.md** si es arquitectura
3. **Actualizar API_REFERENCE.md** si es API
4. **Agregar ejemplos** si es feature compleja

### Formato de Documentación

**Markdown estándar:**
```markdown
# Encabezado principal

## Subencabezado

Párrafo descriptivo.

### Subsubencabezado

- Punto 1
- Punto 2

\`\`\`javascript
// Ejemplo de código
const example = () => {};
\`\`\`

**Destacado** o \`código inline\`
```

---

## Pull Requests

### Crear un PR

1. **Actualizar rama local:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Hacer push a tu fork:**
   ```bash
   git push origin feature/mi-feature
   ```

3. **Abrir PR en GitHub:**
   - Mira a `ORIGINAL/main`
   - Rama desde: `TU-FORK/feature/mi-feature`

### Title y Description del PR

**Título:**
```
✅ Formato: [Type] Descripción breve (50 caracteres máx)

Ejemplos:
✨ feature: Agregar soporte para darkmode
🐛 bugfix: Corregir crash en Chrome
📚 docs: Actualizar API reference
♻️ refactor: Simplificar lógica de hooks
🧪 test: Agregar tests para audioService
```

**Description:**
```markdown
## Descripción
Qué cambios hace este PR y por qué

## Tipo de Cambio
- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 📚 Documentation
- [ ] ♻️ Refactoring

## Resolves
Closes #123

## Testing
Cómo probaste el cambio:
1. Paso 1...
2. Paso 2...

## Screenshots
[Opcional]

## Checklist
- [x] Código sigue estándares
- [x] Tests agregados/actualizados
- [x] Documentación actualizada
- [x] Sin breaking changes
```

### Requisitos para Merge

- ✅ Título y descripción claros
- ✅ Tests pasando (CI/CD verde)
- ✅ Code review aprobado (mínimo 2 reviewers)
- ✅ Sin conflictos con `main`
- ✅ Coverage no disminuyó
- ✅ Documentación actualizada

### Feedback en PR

**Si reciben feedback:**

1. Leer comentarios con atención
2. Hacer cambios si es necesario
3. Hacer commit con mensaje claro
4. Hacer push (se actualiza automáticamente el PR)
5. Responder al feedback
6. Esperar re-review

```bash
# Después de cambios
git add .
git commit -m "Address feedback from PR review"
git push origin feature/mi-feature
```

---

## Workflow Completo

```
┌─────────────────────────────────────┐
│ 1. FORK REPOSITORIO                 │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ 2. CLONAR FORK LOCALMENTE           │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ 3. CREAR RAMA (feature/bugfix/docs) │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ 4. HACER CAMBIOS                    │
│   • Escribir código                 │
│   • Agregar tests                   │
│   • Documentar                      │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ 5. TESTS LOCALES PASAN              │
│   npm test -- --coverage            │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ 6. COMMIT CON MENSAJE DESCRIPTIVO   │
│   git commit -m "[Type] Mensaje"    │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ 7. PUSH A FORK                      │
│   git push origin rama              │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ 8. ABRIR PULL REQUEST               │
│   Con descripción clara             │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ 9. ESPERAR CODE REVIEW              │
│   Responder feedback si aplica      │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ 10. ¡MERGED! 🎉                     │
│    Cambios agregados a main         │
└─────────────────────────────────────┘
```

---

## Recursos Útiles

- [GitHub Docs - Contributing](https://docs.github.com/en/github/collaborating-with-pull-requests)
- [Git Basics](https://git-scm.com/book/en/v2)
- [React Best Practices](https://react.dev/reference)
- [Testing Library Docs](https://testing-library.com/)

---

## Contactos

- **Lead:** [nombre del mantenedor]
- **Email:** soporte@clinicasanjose.com
- **Slack:** #development (por invitación)

---

**¡Gracias por contribuir! Tu ayuda hace que este proyecto sea mejor para todos.** 🙏

Última actualización: Febrero 2026
