# 🔌 API Reference - Chatbot Clínica Medical

## Tabla de Contenidos
1. [Groq API](#groq-api)
2. [Hooks Personalizados](#hooks-personalizados)
3. [Servicios de Audio](#servicios-de-audio)
4. [Componentes](#componentes)
5. [Prompts y Configuración](#prompts-y-configuración)

---

## Groq API

### Inicialización

```javascript
import Groq from "groq-sdk";

const groq = new Groq({ 
  apiKey: process.env.REACT_APP_GROQ_API_KEY, 
  dangerouslyAllowBrowser: true  // Necesario para cliente web
});
```

### Chat Completions

#### `groq.chat.completions.create()`

Genera respuestas de IA basadas en el historial de conversación.

**Sintaxis:**
```javascript
const response = await groq.chat.completions.create({
  model: "mixtral-8x7b-32768",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: "¿Horarios de atención?" },
    { role: "assistant", content: "Lunes a viernes..." }
  ],
  temperature: 0.7,
  max_tokens: 1024,
  stream: true
});
```

**Parámetros:**

| Parámetro | Tipo | Default | Descripción |
|---|---|---|---|
| `model` | string | - | ID del modelo LLM |
| `messages` | Array | - | Historial de conversación |
| `temperature` | number | 0.7 | 0=preciso, 1=creativo |
| `max_tokens` | number | 2048 | Máximo de tokens en respuesta |
| `stream` | boolean | false | Respuesta en tiempo real |
| `top_p` | number | 1 | Sampling (0-1) |
| `frequency_penalty` | number | 0 | Penaliza repetición (-2 a 2) |
| `presence_penalty` | number | 0 | Penaliza nuevos tópicos (-2 a 2) |

**Modelos Disponibles:**

```javascript
// Recomendado para médico (balance velocidad/calidad)
"mixtral-8x7b-32768"

// Alternativas
"llama-2-70b-chat"
"llama-3-70b-versatile"
"gemma-7b-it"
```

**Estructura de Mensajes:**

```javascript
[
  {
    role: "system",        // Configuración del asistente
    content: "Eres..."
  },
  {
    role: "user",          // Mensaje del paciente
    content: "¿Dolor de cabeza?"
  },
  {
    role: "assistant",     // Respuesta anterior del bot
    content: "Recomiendo ir a..."
  }
]
```

**Respuesta con Streaming:**

```javascript
let fullResponse = "";

for await (const chunk of response) {
  const delta = chunk.choices[0]?.delta?.content || "";
  fullResponse += delta;
  // Renderizar en tiempo real
  setMessages(prev => [...prev, { 
    role: "assistant", 
    content: fullResponse 
  }]);
}
```

**Manejo de Errores:**

```javascript
try {
  const response = await groq.chat.completions.create({...});
} catch (error) {
  if (error.status === 401) {
    console.error("API key inválida");
  } else if (error.status === 429) {
    console.error("Límite de rate exceeded");
  } else if (error.status === 400) {
    console.error("Request inválido:", error.message);
  }
}
```

---

### Audio Transcriptions

#### `groq.audio.transcriptions.create()`

Convierte archivos de audio a texto usando Whisper.

**Sintaxis:**
```javascript
const transcription = await groq.audio.transcriptions.create({
  file: audioFile,
  model: "whisper-large-v3-turbo",
  language: "es",
  temperature: 0.2,
  prompt: "Contexto médico"
});

console.log(transcription.text); // Texto transcrito
```

**Parámetros:**

| Parámetro | Tipo | Required | Descripción |
|---|---|---|---|
| `file` | File | ✅ | Archivo de audio |
| `model` | string | ✅ | Siempre "whisper-large-v3-turbo" |
| `language` | string | - | Código ISO 639-1 (es, en, pt, etc.) |
| `temperature` | number | - | 0-1 (0=preciso, 1=creativo) |
| `prompt` | string | - | Contexto para mejorar precisión |

**Códigos de Idioma:**

```javascript
"es"    // Español (general)
"es-ES" // Español España
"es-MX" // Español México
"en"    // Inglés
"pt"    // Portugués
"pt-BR" // Portugués Brasil
"fr"    // Francés
"de"    // Alemán
"it"    // Italiano
```

**Formatos de Audio Soportados:**

```
✅ WebM (opus codec)     - Recomendado
✅ MP3
✅ WAV
✅ FLAC
✅ M4A
❌ Otros formatos
```

**Ejemplo Completo:**

```javascript
import { transcribeAudio } from './hooks/audioService';

try {
  // Grabar audio (audioBlob viene de useAudioRecording)
  const audioFile = new File([audioBlob], 'audio.webm', { 
    type: 'audio/webm' 
  });

  // Transcribir
  const transcription = await groq.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-large-v3-turbo",
    language: "es",
    temperature: 0.2
  });

  console.log("Texto:", transcription.text);

  // Enviar como mensaje
  setMessages(prev => [...prev, {
    role: "user",
    content: transcription.text
  }]);

} catch (error) {
  console.error("Error:", error.message);
}
```

---

## Hooks Personalizados

### useSpeechRecognition

Hook para reconocimiento de voz en tiempo real usando Web Speech API.

**Ubicación:** [src/hooks/useSpeechRecognition.js](src/hooks/useSpeechRecognition.js)

**Importación:**
```javascript
import useSpeechRecognition from './hooks/useSpeechRecognition';
```

**API de Retorno:**

```javascript
const {
  isListening,        // boolean: Si está escuchando activamente
  transcript,         // string: Texto final capturado
  interimTranscript,  // string: Texto mientras habla (temporal)
  error,              // string | null: Mensaje de error
  isSupported,        // boolean: Navegador soporta API
  startListening,     // function: Iniciar grabación de voz
  stopListening,      // function: Detener grabación de voz
  toggleListening,    // function: Alternar on/off
  clearTranscript     // function: Limpiar el texto capturado
} = useSpeechRecognition();
```

**Ejemplo de Uso:**

```javascript
import React, { useState } from 'react';
import useSpeechRecognition from './hooks/useSpeechRecognition';

function MiComponente() {
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening 
  } = useSpeechRecognition();

  return (
    <div>
      <button onClick={startListening} disabled={isListening}>
        🎤 Hablar
      </button>
      <button onClick={stopListening} disabled={!isListening}>
        ⏹️ Detener
      </button>
      <p>Texto: {transcript}</p>
      <p>Escribiendo: {isListening && "Escuchando..."}</p>
    </div>
  );
}

export default MiComponente;
```

**Estados:**

```javascript
// Ciclo de vida del reconocimiento:

isListening: false  // Inicial
↓ Usuario hace click en "Hablar"
isListening: true
↓ API detecta voz
interimTranscript: "Buenas..." (actualiza en tiempo real)
↓ Usuario deja de hablar (silencio detectado)
transcript: "Buenas tardes" (resultado final)
isListening: false  // Vuelve a false después de 5 segundos de silencio
```

**Manejo de Errores:**

```javascript
const { error, isListening } = useSpeechRecognition();

// En el componente:
{error && <div className="error">{error}</div>}

// Errores posibles:
"Tu navegador no soporta reconocimiento de voz"
"⏱️ No se detectó sonido. Intenta de nuevo."
"🎤 No se detectó micrófono. Verifica los permisos."
"🌐 Error de red. Intenta de nuevo."
"❌ Error: [error code]"
```

**Configuración Personalizada:**

En el hook, puedes cambiar:
```javascript
recognition.lang = 'es-ES';          // Idioma
recognition.continuous = true;        // Continuar escuchando
recognition.interimResults = true;    // Mostrar resultados temporales
recognition.maxAlternatives = 1;      // Mejores opciones
```

---

### useAudioRecording

Hook para grabar audio del micrófono.

**Ubicación:** [src/hooks/useAudioRecording.js](src/hooks/useAudioRecording.js)

**Importación:**
```javascript
import useAudioRecording from './hooks/useAudioRecording';
```

**API de Retorno:**

```javascript
const {
  isRecording,      // boolean: Si está grabando
  audioBlob,        // Blob | null: Archivo de audio grabado
  error,            // string | null: Mensaje de error
  isSupported,      // boolean: Navegador soporta grabación
  recordingTime,    // number: Segundos grabados
  startRecording,   // async function: Iniciar grabación
  stopRecording,    // function: Detener grabación
  toggleRecording,  // async function: Alternar on/off
  discardRecording  // function: Descartar audio
} = useAudioRecording();
```

**Ejemplo de Uso:**

```javascript
import useAudioRecording from './hooks/useAudioRecording';

function GrabadorAudio() {
  const {
    isRecording,
    recordingTime,
    audioBlob,
    startRecording,
    stopRecording,
    discardRecording
  } = useAudioRecording();

  return (
    <div>
      <button 
        onClick={startRecording} 
        disabled={isRecording}
      >
        🔴 Grabar ({recordingTime}s)
      </button>

      <button 
        onClick={stopRecording} 
        disabled={!isRecording}
      >
        ⏹️ Detener
      </button>

      {audioBlob && (
        <>
          <p>✅ Audio grabado ({audioBlob.size} bytes)</p>
          <audio src={URL.createObjectURL(audioBlob)} controls />
          <button onClick={discardRecording}>🗑️ Descartar</button>
        </>
      )}
    </div>
  );
}
```

**Estados Detallados:**

```javascript
// Ciclo de vida de grabación:

isRecording: false    // Inicial
audioBlob: null
recordingTime: 0

↓ Usuario hace click en "Grabar"
↓ Solicita permiso de micrófono (si es primera vez)

isRecording: true     // Grabando activo
recordingTime: 1, 2, 3, ... (incrementa cada segundo)

↓ Usuario hace click en "Detener"

isRecording: false    // Grabación pausada
audioBlob: Blob       // Archivo disponible
recordingTime: 15     // Tiempo final guardado
```

**Propiedades del Blob:**

```javascript
// audioBlob es un objeto Blob estándar:
{
  size: 45230,                        // Bytes
  type: "audio/webm;codecs=opus",     // MIME type
  lastModified: 1708615234000,        // Timestamp
  // ... métodos estándar de Blob
}
```

---

## Servicios de Audio

### audioService.js

Utilidades para trabajar con audio.

**Ubicación:** [src/hooks/audioService.js](src/hooks/audioService.js)

#### `transcribeAudio(audioBlob, language)`

Transcribe audio a texto usando Groq Whisper.

**Firma:**
```javascript
export const transcribeAudio = async (audioBlob, language = 'es') => {
  // Retorna: Promise<string>
}
```

**Parámetros:**

| Parámetro | Tipo | Default | Descripción |
|---|---|---|---|
| `audioBlob` | Blob | - | Archivo de audio grabado |
| `language` | string | 'es' | Código de idioma ISO 639-1 |

**Ejemplo:**

```javascript
import { transcribeAudio } from './hooks/audioService';

try {
  const texto = await transcribeAudio(audioBlob, 'es');
  console.log("Transcripción:", texto);
  // Enviar a chat
  setMessages(prev => [...prev, {
    role: "user",
    content: texto
  }]);
} catch (error) {
  console.error("Error de transcripción:", error.message);
}
```

**Errores Posibles:**

```javascript
// Validación
"El archivo de audio está vacío."

// API
"🌐 Error de conexión con la API de Groq."
"❌ API key inválida o expirada."
"❌ Formato de audio no soportado."

// Rate Limiting
"⏳ Límite de solicitudes alcanzado."

// Servidor
"⚠️ Servidor de Groq no disponible."
```

#### `createAudioURL(audioBlob)`

Crea una URL reproducible para el audio.

**Firma:**
```javascript
export const createAudioURL = (audioBlob) => {
  // Retorna: string (URL)
}
```

**Ejemplo:**

```javascript
import { createAudioURL } from './hooks/audioService';

const audioURL = createAudioURL(audioBlob);

return (
  <audio src={audioURL} controls>
    Tu navegador no soporta audio.
  </audio>
);
```

⚠️ **IMPORTANTE:** Liberar URL cuando no se necesite:
```javascript
// Después de usar:
URL.revokeObjectURL(audioURL);
```

#### `revokeAudioURL(audioURL)`

Libera memoria de una URL de audio.

**Firma:**
```javascript
export const revokeAudioURL = (audioURL) => {
  // void
}
```

**Ejemplo:**

```javascript
import { revokeAudioURL } from './hooks/audioService';

useEffect(() => {
  return () => {
    if (audioURL) {
      revokeAudioURL(audioURL);
    }
  };
}, [audioURL]);
```

#### `formatTime(seconds)`

Formatea segundos a formato MM:SS.

**Firma:**
```javascript
export const formatTime = (seconds) => {
  // Retorna: string "MM:SS"
}
```

**Ejemplo:**

```javascript
import { formatTime } from './hooks/audioService';

formatTime(0)     // "0:00"
formatTime(30)    // "0:30"
formatTime(125)   // "2:05"
formatTime(3661)  // "61:01"
```

---

## Componentes

### Chatbot (Principal)

**Ubicación:** [src/chatbot.jsx](src/chatbot.jsx)

**Props:** Ninguna (componente standalone)

**Estructura Interna:**

```javascript
export default Chatbot
  ├── Estado
  │   ├── messages: Array<Message>
  │   ├── inputValue: string
  │   └── isLoading: boolean
  ├── Hooks
  │   ├── useSpeechRecognition()
  │   ├── useAudioRecording()
  │   └── useEffect (manejo de cambios)
  ├── Funciones
  │   ├── sendMessage(text)
  │   ├── handleRecordingSubmit()
  │   ├── handleQuickAction(text)
  │   └── handleError()
  └── Rendering
      ├── Messages Area
      ├── QuickActions
      ├── Input Control
      └── Error Display
```

**Interfaz de Mensaje:**

```typescript
interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}
```

**Métodos Principales:**

#### `sendMessage(text)`
Envía un mensaje al chatbot.

```javascript
// Uso interno (no exportado)
const sendMessage = async (text) => {
  // 1. Agregar mensaje del usuario
  setMessages(prev => [...prev, { role: "user", content: text }]);
  
  // 2. Enviar a Groq API
  // 3. Renderizar respuesta en tiempo real
  // 4. Manejar errores
};
```

#### `handleRecordingSubmit()`
Procesa audio grabado.

```javascript
const handleRecordingSubmit = async () => {
  // 1. Validar audioBlob
  // 2. Llamar a transcribeAudio()
  // 3. Enviar transcripción como mensaje
  // 4. Limpiar estado de grabación
};
```

---

### QuickActions

Componente de botones predefinidos.

**Props:**

```javascript
QuickActions.propTypes = {
  onSelect: PropTypes.func.isRequired  // Callback al hacer click
}

// Uso
<QuickActions onSelect={(text) => sendMessage(text)} />
```

**Botones Predefinidos:**

1. 📅 "¿Cómo agendo una cita?"
2. 🩺 "Me duele la cabeza, ¿a dónde voy?"
3. 💳 "¿Qué seguros aceptan?"

**Agregar Nuevo Botón:**

```javascript
const QuickActions = ({ onSelect }) => (
  <div style={{ display: 'flex', gap: '10px' }}>
    {/* Botones existentes */}
    <button onClick={() => onSelect("Tengo alergia")}>
      🤧 Alergia
    </button>
  </div>
);
```

---

## Prompts y Configuración

### System Prompt

**Sistema de Instrucciones para el Modelo de IA**

**Ubicación:** [src/chatbot.jsx](src/chatbot.jsx) y [src/chatConfig.js](src/chatConfig.js)

**Estructura:**

```
┌─ IDENTIDAD ─────────────────────┐
│ "Eres el Asistente de Clínica..." │
├─ REGLAS CRÍTICAS ──────────────┤
│ • No diagnostiques             │
│ • Detecta emergencias          │
│ • Sé empático                  │
├─ FORMATO DE RESPUESTAS ────────┤
│ • Usa <b> para énfasis        │
│ • Usa <u> para títulos        │
│ • Saltos de línea (\n)        │
├─ CONOCIMIENTO CLÍNICO ─────────┤
│ • Síntomas → Especialistas    │
│ • Horarios y servicios        │
│ • Información administrativa  │
└─────────────────────────────────┘
```

**Editar Prompt:**

```javascript
// En src/chatbot.jsx, línea 12:
const systemPrompt = `
Eres el Asistente Virtual de la Clínica San José. Tu objetivo es orientar...

[Editar información aquí]
`;
```

**Secciones Importantes:**

1. **Reglas de Seguridad Médica** (CRÍTICA)
   ```
   - No eres un médico
   - No diagnostiques síntomas
   - Detecta emergencias (dolor de pecho, asfixia, etc.)
   - Indica que llamen a emergencias
   ```

2. **Formato de Respuestas**
   ```
   - <b>palabra clave</b> en lugar de **palabra**
   - <u>Sección</u> en lugar de # Sección
   - Separa con \n (saltos de línea)
   ```

3. **Base de Conocimiento**
   ```
   - Síntomas → Especialista correcto
   - Horarios de atención
   - Servicios disponibles
   - Seguros aceptados
   ```

**Mejores Prácticas:**

✅ **HACER:**
```javascript
"Recomienda Neurología para dolores de cabeza persistentes"
"Indica que debe ir a Urgencias si es agudo"
"Sé amable y empático en todo momento"
```

❌ **NO HACER:**
```javascript
"Presunta enfermedad X"
"Toma este medicamento"
"Te curaré en X días"
"Uso de asteriscos **text**"
"Markdown avanzado"
```

---

## Variables de Entorno

```bash
# .env
REACT_APP_GROQ_API_KEY=gsk_xxxxx...
REACT_APP_SPEECH_LANG=es-ES
REACT_APP_ENV=development
```

**En Producción:**
```bash
REACT_APP_GROQ_API_KEY=gsk_xxxxx...
REACT_APP_SPEECH_LANG=es-ES
REACT_APP_ENV=production
```

---

## Limites y Cuotas

### Groq API (Plan Gratuito)

| Recurso | Límite |
|---|---|
| Tokens por minuto | 9,000 |
| Bytes de entrada | Ilimitado |
| Solicitudes concurrentes | 1 |
| Timeout | 60 segundos |
| Audio máximo | 25 MB |

### Web APIs (Navegador)

| API | Límite | Nota |
|---|---|---|
| Speech Recognition | Sin límite | Offline posible |
| MediaRecorder | Sin límite | RAM dependiente |
| localStorage | 5-10 MB | Per origin |

---

**Última actualización:** Febrero 2026  
**Versión:** 1.0.0
