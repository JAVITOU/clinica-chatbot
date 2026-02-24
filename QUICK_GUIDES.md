# ⚡ Quick Guides - Ejemplos Prácticos

Guías rápidas y ejemplos para tareas comunes.

## Tabla de Contenidos
1. [Primeros 30 minutos](#primeros-30-minutos)
2. [Tareas Comunes](#tareas-comunes)
3. [Ejemplos de Código](#ejemplos-de-código)
4. [Comandos Útiles](#comandos-útiles)

---

## Primeros 30 Minutos

### Minutos 0-5: Instalación

```bash
# 1. Clonar
git clone https://github.com/tu-usuario/clinica-chatbot.git
cd clinica-chatbot

# 2. Instalar
npm install

# 3. Variables de entorno
echo "REACT_APP_GROQ_API_KEY=gsk_xxxxx..." > .env

# 4. Verificar
npm start
```

**Resultado esperado:** Navegador abre http://localhost:3000

### Minutos 5-15: Explorar la Aplicación

1. **Chat de Texto:**
   - Escribe: "¿Horarios de atención?"
   - Observa la respuesta

2. **Acciones Rápidas:**
   - Haz clic en "📅 Agendar Cita"
   - Observa la pregunta pre-llenada

3. **Reconocimiento de Voz:**
   - Haz clic en el botón 🎤
   - Habla: "¿A dónde voy si me duele la espalda?"
   - Observa el texto reconocido

4. **Grabación de Audio:**
   - Haz clic en "🔴 Grabar"
   - Habla durante 3 segundos
   - Click "⏹️ Detener"
   - Audio se transcribe automáticamente

### Minutos 15-20: Revisar Código

Abre `src/chatbot.jsx`:
- Línea 1-10: Importaciones
- Línea 12-100: System prompt (instrucciones de IA)
- Línea 200+: Lógica del componente

### Minutos 20-30: Hacer Cambio Simple

**Agregar nuevo botón de acción rápida:**

1. Abre `src/chatbot.jsx`
2. Busca la función `QuickActions` (línea ~90)
3. Agregue esto dentro del `<div>`:

```jsx
<button onClick={() => onSelect("Tengo una alergia")}>
  🤧 Alergia
</button>
```

4. Guarda (Ctrl+S)
5. Vuelve al navegador - verás el nuevo botón automáticamente

**¡Hiciste tu primer cambio!** 🎉

---

## Tareas Comunes

### Cambiar la Respuesta Inicial

**Archivo:** `src/chatbot.jsx`, línea 72

**Antes:**
```javascript
content: "¡Hola! Soy el asistente de la Clínica San José. ¿Cómo puedo ayudarte con tu salud hoy?"
```

**Después:**
```javascript
content: "¡Bienvenido a la Clínica Medical! 🏥 Estoy aquí para orientarte. ¿Cómo te puedo ayudar?"
```

### Agregar Nuevo Especialista

**Archivo:** `src/chatbot.jsx`, línea 30-50

**Busca:**
```javascript
• Alergias: Alergólogo
```

**Agrega debajo:**
```javascript
• Problemas de visión: Oftalmología
```

### Cambiar Idioma

**Para reconocimiento de voz:**

File: `src/hooks/useSpeechRecognition.js`, línea 35

```javascript
// Cambiar de
recognition.lang = 'es-ES';

// A
recognition.lang = 'en-US';  // English USA
// O
recognition.lang = 'es-MX';  // Español México
// O
recognition.lang = 'pt-BR';  // Portugués Brasil
```

**Para modelo de IA:**

File: `src/chatbot.jsx`, modifica el system prompt:

```javascript
const systemPrompt = `
You are a virtual assistant for San Jose Clinic...  // Inglés
`;
```

### Cambiar Colores / Estilo

**Archivo:** `src/App.css`

```css
/* Cambiar color del fondo */
body {
  background-color: #f5f5f5;  /* Cambiar aquí */
}

/* Cambiar color de botones */
button {
  background-color: #007bff;  /* Azul por defecto */
  /* Cambiar a: #28a745 (verde), #dc3545 (rojo), etc. */
}
```

### Limitar el Tamaño del Mensaje

**Archivo:** `src/chatbot.jsx`

**Encontrar y cambiar:**
```javascript
max_tokens: 1024  // ← Cambiar este número

// Valores populares:
// 256 = respuestas muy cortas
// 512 = respuestas moderadas (recomendado)
// 1024 = respuestas largas
// 2048 = respuestas muy largas
```

### Desactivar una Característica

**Desactivar reconocimiento de voz:**

En `src/chatbot.jsx`, comenta estas líneas:

```javascript
{/* <button onClick={toggleListening}>
  🎤 {isListening ? 'Escuchando...' : 'Hablar'}
</button> */}
```

**Desactivar grabación de audio:**

```javascript
{/* <button onClick={toggleRecording}>
  {isRecording ? '⏹️ Detener' : '🔴 Grabar'}
</button> */}
```

---

## Ejemplos de Código

### Ejemplo 1: Enviar Mensaje Programáticamente

```javascript
// Importar
import { useRef, useState } from 'react';

function MiComponente() {
  const [messages, setMessages] = useState([]);
  
  const sendMessage = async (text) => {
    // Agregar mensaje del usuario
    setMessages(prev => [...prev, { 
      role: "user", 
      content: text 
    }]);
    
    // Aquí iría la lógica para enviar a Groq
    // (ver chatbot.jsx para detalles)
  };
  
  return (
    <button onClick={() => sendMessage("Hola")}>
      Enviar
    </button>
  );
}
```

### Ejemplo 2: Usar Hook de Voz

```javascript
import useSpeechRecognition from './hooks/useSpeechRecognition';

function DictarMensaje() {
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening 
  } = useSpeechRecognition();
  
  return (
    <div>
      <button 
        onClick={startListening}
        disabled={isListening}
      >
        🎤 Iniciar
      </button>
      
      <button 
        onClick={stopListening}
        disabled={!isListening}
      >
        ⏹️ Detener
      </button>
      
      <p>Dijiste: {transcript}</p>
    </div>
  );
}

export default DictarMensaje;
```

### Ejemplo 3: Grabar y Transcribir Audio

```javascript
import useAudioRecording from './hooks/useAudioRecording';
import { transcribeAudio } from './hooks/audioService';

function GrabadorAudio() {
  const { 
    audioBlob, 
    startRecording, 
    stopRecording 
  } = useAudioRecording();
  
  const handleTranscribe = async () => {
    if (!audioBlob) return;
    
    try {
      const texto = await transcribeAudio(audioBlob, 'es');
      console.log("Texto:", texto);
      // Hacer algo con el texto transcrito
    } catch (error) {
      console.error("Error:", error.message);
    }
  };
  
  return (
    <div>
      <button onClick={startRecording}>🔴 Grabar</button>
      <button onClick={stopRecording}>⏹️ Detener</button>
      
      {audioBlob && (
        <button onClick={handleTranscribe}>
          ✨ Transcribir
        </button>
      )}
    </div>
  );
}

export default GrabadorAudio;
```

### Ejemplo 4: Agregar Validación de Input

```javascript
// En chatbot.jsx, antes de sendMessage():

const validateMessage = (text) => {
  // No vacío
  if (!text.trim()) {
    setError("El mensaje no puede estar vacío");
    return false;
  }
  
  // No muy largo
  if (text.length > 2000) {
    setError("El mensaje es muy largo (máx 2000 caracteres)");
    return false;
  }
  
  return true;
};

// Uso:
const handleSend = async (text) => {
  if (!validateMessage(text)) return;
  
  await sendMessage(text);
};
```

### Ejemplo 5: Formatear Respuesta del Bot

```javascript
// En chatbot.jsx, función sendMessage()

// Groq retorna texto plano, pero nosotros usamos
// <b> para bold y <u> para subrayado

const formatResponse = (text) => {
  return (
    <div dangerouslySetInnerHTML={{ 
      __html: text 
    }} />
  );
};

// Luego en el renderizado:
{messages.map((msg, idx) => (
  <div key={idx}>
    {msg.role === 'assistant' 
      ? formatResponse(msg.content)
      : <p>{msg.content}</p>
    }
  </div>
))}
```

---

## Comandos Útiles

### NPM Commands

```bash
# Instalar
npm install                    # Instala todas las dependencias
npm install nuevo-paquete      # Instala un paquete nuevo
npm update                     # Actualiza a versiones menores

# Desarrollo
npm start                      # Inicia servidor en puerto 3000
npm run build                  # Crea build para producción
npm test                       # Ejecuta tests
npm test -- --watch           # Tests en modo watch

# Limpieza
npm cache clean --force        # Limpia cache de npm
rm -rf node_modules            # Elimina directorio de dependencias
npm install                    # Reinstala desde package.json

# Info
npm list                       # Lista dependencias instaladas
npm outdated                   # Muestra paquetes desactualizados
npm audit                      # Revisa vulnerabilidades de seguridad
```

### Git Commands

```bash
# Setup inicial
git clone <url>                # Clona repositorio
git remote -v                  # Muestra repositorios remotos

# Cambios
git status                     # Estado de cambios
git add .                      # Agrega todos los cambios
git commit -m "Mensaje"        # Commit con mensaje
git push origin main           # Push a rama main

# Ramas
git checkout -b feature/x      # Crea nueva rama
git branch -a                  # Lista todas las ramas
git switch main                # Cambia de rama

# Historial
git log --oneline              # Historial de commits
git diff                       # Diferencias no commiteadas
git revert <commit>            # Revertir commit
```

### Terminal Utilities

```bash
# Navegación
cd <directorio>                # Cambiar directorio
ls -la                         # Listar archivos (con hidden)
pwd                            # Mostrar directorio actual

# Archivos
cat archivo.txt                # Mostrar contenido de archivo
grep "texto" archivo           # Buscar texto en archivo
find . -name "archivo"         # Buscar archivo

# Desarrollo
clear                          # Limpiar pantalla
echo "Hola" > archivo.txt      # Crear archivo con contenido
code .                         # Abre VS Code en carpeta actual
```

---

## Troubleshooting Rápido

### La app no inicia

```bash
# 1. Elimina node_modules
rm -rf node_modules package-lock.json

# 2. Reinstala
npm install

# 3. Verifica .env
cat .env
# Debe contener: REACT_APP_GROQ_API_KEY=gsk_...

# 4. Inicia nuevamente
npm start
```

### Error de API Key

```bash
# 1. Verifica que .env existe
ls -la .env

# 2. Verifica contenido
cat .env

# 3. Si falta, créalo
echo "REACT_APP_GROQ_API_KEY=tu_clave_aqui" > .env

# 4. Reinicia servidor
npm start
```

### Micrófono no funciona

```bash
# 1. Abre DevTools (F12)
# 2. Consola → ve si hay error
# 3. Verifica permisos de navegador
# Chrome: Settings → Privacy → Microphone
# 4. Recarga página
```

### Tests no pasan

```bash
# 1. Ver qué falló
npm test

# 2. Corregir código según error

# 3. Reintentar
npm test
```

---

## Cheatsheet Visual

### Flujo de Chat

```
Usuario escribe   → [Input Box]
       ↓
  Presiona Enter  → [sendMessage()]
       ↓
  Agregar a state → messages = [..., user_msg]
       ↓
  Llamar a Groq   → groq.chat.completions.create()
       ↓
  Streaming       → for await (chunk of response)
       ↓
  Actualizar UI   → setMessages(...)
       ↓
  Mostrar al usuario ← [Assistant message]
```

### Flujo de Voz

```
Click 🎤        → [startListening()]
  ↓
Escuchar       → Web Speech API
  ↓
Mientras habla → interimTranscript
  ↓
Deja de hablar → transcript (final)
  ↓
Click Enter    → [sendMessage(transcript)]
  ↓
Continúa como chat normal
```

### Flujo de Grabación

```
Click 🔴 Grabar    → [startRecording()]
  ↓
Grabar audio       → MediaRecorder
  ↓
Click ⏹️ Detener    → [stopRecording()]
  ↓
Mostrar audio      → <audio> player
  ↓
Click Enviar       → [transcribeAudio()]
  ↓
Transcripción      → Groq Whisper
  ↓
Sent como mensaje  → [sendMessage(text)]
  ↓
Continúa como chat normal
```

---

## Links RÁPIDOS

| Recurso | URL |
|---|---|
| Documentación Completa | [DOCUMENTATION.md](DOCUMENTATION.md) |
| Referencia API | [API_REFERENCE.md](API_REFERENCE.md) |
| Arquitectura | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Deployment | [DEPLOYMENT.md](DEPLOYMENT.md) |
| Troubleshooting | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |
| Índice | [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) |

---

**Última actualización:** Febrero 2026  
**Versión:** 1.0.0
