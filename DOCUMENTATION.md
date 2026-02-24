# 📚 Documentación - Chatbot de Clínica Médica

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Características](#características)
3. [Requisitos del Sistema](#requisitos-del-sistema)
4. [Instalación](#instalación)
5. [Configuración](#configuración)
6. [Uso](#uso)
7. [Arquitectura](#arquitectura)
8. [Componentes Principales](#componentes-principales)
9. [APIs Utilizadas](#apis-utilizadas)
10. [Guía de Desarrollo](#guía-de-desarrollo)
11. [Troubleshooting](#troubleshooting)
12. [Deployment](#deployment)

---

## Introducción

**Chatbot de Clínica San José** es una aplicación web moderna desarrollada con **React** que proporciona atención al paciente 24/7 mediante:

- 💬 **Chat de texto** interactivo con IA
- 🎤 **Reconocimiento de voz** (Speech-to-Text)
- 🔊 **Grabación y transcripción de audio** con Groq Whisper API
- 🚑 **Orientación médica** profesional y segura
- 📱 **Interfaz responsive** y accesible

El chatbot utiliza la **Groq API** para generar respuestas inteligentes y mantiene los estándares de seguridad médica en todo momento.

### Objetivo Principal
Proporcionar una primera línea de atención al paciente que:
- Resuelva dudas sobre horarios, servicios y seguros
- Oriente sobre síntomas hacia el especialista correcto
- Derive casos de emergencia a urgencias inmediatamente
- Mejore la experiencia del paciente en la clínica

---

## Características

### ✨ Funcionalidades Principales

| Característica | Descripción |
|---|---|
| **Chat de IA** | Conversación fluida con modelo Groq LLaMA |
| **Reconocimiento de Voz** | Dicta mensajes en tiempo real (Web Speech API) |
| **Grabación de Audio** | Graba y transcribe audio automáticamente |
| **Historial de Chat** | Mantiene conversación en contexto |
| **Acciones Rápidas** | Botones predefinidos para consultas comunes |
| **Manejo de Errores** | Mensajes claros y soluciones sugeridas |
| **Responsive Design** | Funciona en desktop, tablet y móvil |
| **Soporte Multiidioma** | Principalmente español (configurable) |

### 🔒 Características de Seguridad

- ✅ Sistema de prompts que **evita diagnósticos médicos**
- ✅ **Detección de emergencias** con derivación inmediata
- ✅ **Sin almacenamiento** de datos sensibles en cliente
- ✅ **API keys** configuradas en variables de entorno
- ✅ **Validación de entrada** para prevenir inyecciones

---

## Requisitos del Sistema

### 🖥️ Software Requerido
- **Node.js** 14.0 o superior
- **npm** 6.0 o superior
- **Navegador moderno** (Chrome, Edge, Safari, Firefox)

### 📋 Navegadores Soportados
| Navegador | Versión Mínima | Notas |
|---|---|---|
| Chrome | 70+ | Soporte completo (recomendado) |
| Edge | 79+ | Soporte completo |
| Firefox | 75+ | Soporte completo |
| Safari | 14+ | Soporte básico (Speech API limitada) |

### 🔑 Credenciales Necesarias
1. **API Key de Groq** - Para LLM y Whisper
   - Obtén en: https://console.groq.com/
   - Nivel gratuito: 9000 tokens/minuto

2. **Permisos del Navegador**
   - ✅ Acceso a micrófono
   - ✅ Acceso a cámara (opcional)

---

## Instalación

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/clinica-chatbot.git
cd clinica-chatbot
```

### Paso 2: Instalar Dependencias
```bash
npm install
```

**Dependencias principales instaladas:**
- `react` (19.2.4) - Framework UI
- `groq-sdk` (0.37.0) - Cliente de Groq API
- `react-markdown` (10.1.0) - Renderizar markdown en respuestas
- `lucide-react` (0.575.0) - Iconos
- `axios` (1.13.5) - HTTP client

### Paso 3: Verificar Instalación
```bash
npm list groq-sdk react react-dom
```

---

## Configuración

### 📝 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Groq API Configuration
REACT_APP_GROQ_API_KEY=tu_api_key_aqui

# Idioma de reconocimiento de voz (opcional)
REACT_APP_SPEECH_LANG=es-ES

# Modo desarrollo/producción
REACT_APP_ENV=development
```

### 🔐 Obtener API Key de Groq

1. Ve a https://console.groq.com/
2. Regístrate o inicia sesión
3. Navega a **API Keys**
4. Haz clic en **Create API Key**
5. Copia la clave y pégala en `.env`

**⚠️ IMPORTANTE:**
- Nunca commit el archivo `.env` a Git
- Verificar que `.gitignore` contenga `.env`
- En producción, usar variables de entorno del servidor

### ⚙️ Configuración Avanzada

#### Cambiar Idioma de Reconocimiento de Voz
En [useSpeechRecognition.js](src/hooks/useSpeechRecognition.js), línea 35:

```javascript
recognition.lang = 'es-ES'; // Cambiar según necesidad
// Opciones: es-MX, en-US, pt-BR, fr-FR, etc.
```

#### Ajustar Modelo de IA
En [audioService.js](src/hooks/audioService.js), línea 40:

```javascript
const transcription = await groq.audio.transcriptions.create({
  file: audioFile,
  model: "whisper-large-v3-turbo", // Cambiar modelo aquí
  language: language,
  temperature: 0.2, // Baja = más preciso, Alta = más creativo
});
```

---

## Uso

### ▶️ Iniciar la Aplicación en Desarrollo

```bash
npm start
```

La aplicación abrirá en http://localhost:3000

### 📱 Interfaz Principal

```
┌─────────────────────────────────┐
│  🏥 Clínica San José - Chatbot  │
├─────────────────────────────────┤
│                                 │
│  [Chat Messages Area]           │
│                                 │
│  Assistant: ¡Hola! ¿Cómo puedo  │
│  ayudarte?                      │
│                                 │
├─────────────────────────────────┤
│ 📅 Agendar Cita                 │
│ 🩺 Orientación Médica           │
│ 💳 Seguros Aceptados            │
├─────────────────────────────────┤
│ [Entrada de texto]              │
│ 🎤 Grabar Audio   🔊 Reproducir │
│ [Enviar]                        │
└─────────────────────────────────┘
```

### 🎤 Modos de Interacción

#### 1️⃣ Escribir Mensaje (Chat de Texto)
1. Escribe tu pregunta en el campo de entrada
2. Presiona Enter o haz clic en "Enviar"
3. El chatbot responderá con IA

#### 2️⃣ Usar Reconocimiento de Voz
1. Haz clic en el botón 🎤 (micrófono)
2. Habla claramente
3. El texto se capturará automáticamente
4. Presiona Enter para enviar

#### 3️⃣ Grabar Audio y Transcribir
1. Haz clic en 🔴 Grabar Audio
2. Habla en el micrófono
3. Haz clic en Detener cuando termines
4. El audio se transcribe automáticamente
5. Presiona Enter para enviar el mensaje

#### 4️⃣ Usar Acciones Rápidas
- Haz clic en cualquiera de los botones predefinidos:
  - 📅 **Agendar Cita**
  - 🩺 **Orientación Médica**
  - 💳 **Seguros Aceptados**

---

## Arquitectura

### 🏗️ Estructura del Proyecto

```
clinica-chatbot/
├── public/
│   ├── index.html           # HTML principal
│   ├── manifest.json        # PWA manifest
│   └── robots.txt           # SEO
├── src/
│   ├── App.js               # Componente raíz
│   ├── App.css              # Estilos principales
│   ├── index.js             # Punto de entrada
│   ├── chatbot.jsx          # Componente principal del chatbot
│   ├── chatConfig.js        # Configuración de prompts
│   ├── hooks/               # Hooks personalizados
│   │   ├── useSpeechRecognition.js
│   │   ├── useAudioRecording.js
│   │   ├── audioService.js
│   │   └── AUDIO_GUIDE.md
│   └── [... otros archivos ...]
├── package.json             # Dependencias
├── .env                     # Variables de entorno (no commitear)
├── .gitignore              # Archivos ignorados
└── README.md               # Documentación básica
```

### 🔄 Flujo de Datos

```
Usuario escribe/habla
    ↓
[Componente Chatbot]
    ↓
Reconocimiento de voz (opcional)
    ↓
Transcripción con Groq Whisper (opcional)
    ↓
[Hook useAudioRecording / useSpeechRecognition]
    ↓
Envío a Groq LLM API
    ↓
Respuesta con streaming
    ↓
Renderizado en Chat
    ↓
Usuario recibe respuesta
```

### 📊 Diagrama de Componentes

```
App
 └── Chatbot (componente principal)
      ├── useSpeechRecognition (hook)
      ├── useAudioRecording (hook)
      ├── audioService (utilidades)
      ├── Messages Area (historial)
      ├── QuickActions (botones)
      ├── Input Control
      │   ├── Input Text
      │   ├── Voice Recording Button
      │   └── Send Button
      └── Error Messages
```

---

## Componentes Principales

### 📦 Chatbot.jsx
**Componente principal de la aplicación**

```javascript
// Ubicación: src/chatbot.jsx
// Responsable de: Orquestar toda la lógica del chatbot
```

**Funcionalidades:**
- Gestionar historial de mensajes
- Integrar hooks de voz
- Comunicarse con Groq API
- Renderizar UI

**Props:** Ninguna (componente standalone)

**State Principal:**
```javascript
const [messages, setMessages] = useState([
  { role: "system", content: systemPrompt },
  { role: "assistant", content: "Mensaje inicial..." }
]);
```

**Métodos Principales:**
- `sendMessage(text)` - Envía mensaje a la IA
- `handleRecordingSubmit()` - Procesa audio grabado
- `handleQuickAction(text)` - Ejecuta acción rápida

---

### 🎤 useSpeechRecognition.js
**Hook para convertir voz a texto en tiempo real**

**Ubicación:** [src/hooks/useSpeechRecognition.js](src/hooks/useSpeechRecognition.js)

**API Utilizada:** Web Speech API (nativa del navegador)

**Retorna:**
```javascript
{
  isListening,           // boolean - Si está escuchando
  transcript,            // string - Texto capturado (final)
  interimTranscript,     // string - Texto mientras habla
  error,                 // string - Mensaje de error
  isSupported,           // boolean - Navegador soporta API
  startListening,        // function - Iniciar escucha
  stopListening,         // function - Detener escucha
  toggleListening,       // function - Alternar on/off
  clearTranscript        // function - Limpiar texto
}
```

**Ejemplo de Uso:**
```javascript
const { isListening, transcript, startListening, stopListening } 
  = useSpeechRecognition();

return (
  <>
    <button onClick={startListening}>🎤 Hablar</button>
    <p>{transcript}</p>
  </>
);
```

**Lenguajes Soportados:**
- `es-ES` - Español España
- `es-MX` - Español México
- `en-US` - Inglés USA
- `pt-BR` - Portugués Brasil
- Y más...

---

### 🔊 useAudioRecording.js
**Hook para grabar audio del micrófono**

**Ubicación:** [src/hooks/useAudioRecording.js](src/hooks/useAudioRecording.js)

**API Utilizada:** MediaRecorder API

**Retorna:**
```javascript
{
  isRecording,           // boolean - Si está grabando
  audioBlob,             // Blob - Archivo de audio grabado
  error,                 // string - Mensaje de error
  isSupported,           // boolean - Navegador soporta API
  recordingTime,         // number - Segundos grabando
  startRecording,        // function - Comenzar grabación
  stopRecording,         // function - Detener grabación
  toggleRecording,       // function - Alternar on/off
  discardRecording       // function - Descartar grabación
}
```

**Ejemplo de Uso:**
```javascript
const { isRecording, audioBlob, startRecording, stopRecording } 
  = useAudioRecording();

return (
  <>
    <button onClick={startRecording} disabled={isRecording}>
      🔴 Grabar
    </button>
    <button onClick={stopRecording} disabled={!isRecording}>
      ⏹️ Detener
    </button>
    {audioBlob && <p>Audio grabado: {audioBlob.size} bytes</p>}
  </>
);
```

---

### 🎧 audioService.js
**Servicios de utilidad para audio**

**Ubicación:** [src/hooks/audioService.js](src/hooks/audioService.js)

**Funciones Disponibles:**

#### `transcribeAudio(audioBlob, language)`
Convierte audio a texto usando Groq Whisper API

```javascript
import { transcribeAudio } from './hooks/audioService';

const text = await transcribeAudio(audioBlob, 'es');
console.log('Texto transcrito:', text);
```

**Parámetros:**
- `audioBlob` (Blob) - Archivo de audio
- `language` (string) - Código de idioma ('es', 'en', etc.)

**Retorna:** Promise<string> - Texto transcrito

**Errores Comunes:**
- "El archivo de audio está vacío" → Graba más tiempo
- "API key inválida" → Verificar .env
- "Límite de solicitudes alcanzado" → Esperar 60 segundos

#### `createAudioURL(audioBlob)`
Crea URL para reproducción de audio

```javascript
const audioURL = createAudioURL(audioBlob);
<audio src={audioURL} controls />
```

#### `revokeAudioURL(audioURL)`
Libera memoria después de usar el audio

```javascript
revokeAudioURL(audioURL); // Evitar memory leaks
```

#### `formatTime(seconds)`
Formatea segundos a MM:SS

```javascript
formatTime(125); // "2:05"
```

---

## APIs Utilizadas

### 🤖 Groq API

**Endpoints Utilizados:**

#### 1. Chat Completions (LLM)
```
POST https://api.groq.com/openai/v1/chat/completions
```

**Propósito:** Generar respuestas de IA del chatbot

**Parámetros:**
```javascript
{
  model: "mixtral-8x7b-32768",  // Modelo principal
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: "¿Cómo agendo una cita?" }
  ],
  temperature: 0.7,
  max_tokens: 1024,
  stream: true  // Respuesta en tiempo real
}
```

**Límites:**
- Tokens: 9,000/minuto (nivel gratuito)
- Respuesta máxima: 2048 tokens
- Timeout: 60 segundos

#### 2. Audio Transcriptions (Whisper)
```
POST https://api.groq.com/openai/v1/audio/transcriptions
```

**Propósito:** Transcribir audio a texto

**Parámetros:**
```javascript
{
  file: audioFile,
  model: "whisper-large-v3-turbo",
  language: "es",
  temperature: 0.2
}
```

**Formatos Soportados:**
- WebM (opus)
- MP3
- WAV
- FLAC
- M4A

**Máximo:** 25 MB por archivo

### 🎙️ Web Speech API
**Propósito:** Reconocimiento de voz en tiempo real

**Navegadores Soportados:**
- ✅ Chrome 25+
- ✅ Edge 79+
- ✅ Firefox 44+
- ⚠️ Safari (limitado)

**Lenguajes Soportados:** 50+

### 🎧 MediaRecorder API
**Propósito:** Grabar audio del micrófono

**Navegadores Soportados:**
- ✅ Chrome 49+
- ✅ Firefox 25+
- ✅ Edge 79+
- ⚠️ Safari 14+

---

## Guía de Desarrollo

### 🚀 Iniciar Desarrollo

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo .env con API key
echo "REACT_APP_GROQ_API_KEY=tu_clave_aqui" > .env

# 3. Iniciar servidor de desarrollo
npm start

# 4. Abrirá automáticamente http://localhost:3000
```

### 📝 Agregar Nueva Funcionalidad

#### Ejemplo: Agregar nuevo especialista a la base de conocimiento

1. **Editar `chatConfig.js`:**
```javascript
export const systemPrompt = `
...
2. SÍNTOMAS Y ORIENTACIÓN:
   • Alergias: Alergólogo           // ← NUEVA LÍNEA
...
`;
```

2. **Editar `Chatbot.jsx` - QuickActions:**
```javascript
<button onClick={() => onSelect("Tengo alergia, ¿a dónde voy?")}>
  🤧 Alergia
</button>
```

3. **Probar en http://localhost:3000**

#### Agregar un Nuevo Hook

**Estructura base:** [src/hooks/miHook.js](src/hooks/miHook.js)
```javascript
import { useState, useCallback } from 'react';

/**
 * Descripción del hook
 * @returns {Object} Estados y funciones
 */
const useMiHook = () => {
  const [estado, setEstado] = useState(null);

  const miFunction = useCallback(() => {
    // Lógica aquí
  }, []);

  return { estado, miFunction };
};

export default useMiHook;
```

### 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con cobertura
npm test -- --coverage

# Test de un archivo específico
npm test Chatbot.test.js
```

**Archivos de Test:**
```
src/Chatbot.test.js
src/hooks/__tests__/useSpeechRecognition.test.js
src/hooks/__tests__/useAudioRecording.test.js
```

### 🔍 Debugging

**Habilitar Logs Detallados:**

En [audioService.js](src/hooks/audioService.js):
```javascript
console.log('📤 Enviando audio a Groq...', {
  size: `${(audioBlob.size / 1024).toFixed(2)} KB`,
  type: audioBlob.type,
  language
});
```

**Usar Chrome DevTools:**
1. Abre F12 (DevTools)
2. Console tab → Ver logs
3. Network tab → Ver requests a Groq API
4. Sources tab → Debugging paso a paso

---

## Troubleshooting

### ⚠️ Problemas Comunes

#### 1. "API Key Inválida"
```
Error: Error: 401 Unauthorized
```

**Solución:**
- Verificar que `.env` contiene `REACT_APP_GROQ_API_KEY`
- Confirmar que la clave es válida en https://console.groq.com/
- Reiniciar servidor: `npm start`

#### 2. "Micrófono No Funciona"
```
Error: Permission denied
```

**Solución:**
- Permitir acceso al micrófono en navegador
  - Chrome: Settings → Privacy → Microphone
  - Firefox: about:preferences → Privacy → Microphone
- Verificar que el dispositivo tiene micrófono
- Probar en otro navegador

#### 3. "Navegador No Soporta Voz"
```
Error: Tu navegador no soporta reconocimiento de voz
```

**Solución:**
- Usar Chrome, Edge o Firefox (recomendado Chrome)
- Actualizar navegador a versión reciente
- Usar fallback: solo chat de texto

#### 4. "Audio Muy Silencioso"
**Solución:**
- Aumentar volumen del micrófono
- Hablar más cerca del micrófono
- Verificar que no hay ruido de fondo

#### 5. "Groq API Rate Limit"
```
Error: 429 Too Many Requests
```

**Solución:**
- Esperar 60 segundos
- Nivel gratuito límite: 9,000 tokens/minuto
- Considerar plan de pago si es producción

---

## Deployment

### 🌐 Desplegar en Vercel (Recomendado)

**Paso 1: Preparar Repositorio**
```bash
git add .
git commit -m "Versión lista para producción"
git push origin main
```

**Paso 2: Conectar a Vercel**
1. Ve a https://vercel.com/
2. Haz clic en "Import Project"
3. Selecciona tu repositorio GitHub
4. Configura variables de entorno

**Paso 3: Configurar Variables**
En Vercel Dashboard → Settings → Environment Variables:
```
REACT_APP_GROQ_API_KEY = tu_clave_aqui
```

**Paso 4: Desplegar**
- Haz clic en "Deploy"
- Tu sitio estará en vivo en ~2 minutos
- URL: `https://clinica-chatbot.vercel.app`

### 🚀 Desplegar en Netlify

```bash
# Instalar CLI
npm install -g netlify-cli

# Autenticar
netlify login

# Desplegar
npm run build
netlify deploy --prod --dir=build
```

### 🏠 Desplegar en Servidor Propio

```bash
# Crear build optimizado
npm run build

# Enviar carpeta 'build' a tu servidor
scp -r build/ usuario@servidor:/var/www/clinica-chatbot/

# En el servidor, servir con Nginx:
# location / {
#   try_files $uri $uri/ /index.html;
# }
```

### 📋 Checklist Pre-Producción

```
✅ Verificar .env no está en Git
✅ API Key configurada en variables de entorno del servidor
✅ HTTPS habilitado
✅ Tests pasando (npm test)
✅ Build sin errores (npm run build)
✅ Probar chat, voz y grabación
✅ Verificar prompts de seguridad médica
✅ Configurar métricas (Google Analytics)
✅ Backup de base de datos (si aplica)
✅ Plan de soporte definido
```

---

## 📞 Soporte y Contacto

Para soporte técnico:
- 📧 Email: soporte@clinicasanjose.com
- 📞 Teléfono: 555-0123
- 🐛 Reportar bugs: GitHub Issues

---

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver [LICENSE](LICENSE) para detalles.

---

**Última actualización:** Febrero 2026  
**Versión:** 1.0.0  
**Autor:** Tu Nombre / Equipo de Desarrollo
