# 🏗️ Arquitectura del Chatbot de Clínica Medical

## Descripción General

Este documento describe la arquitectura técnica del chatbot, flujos de datos, patrones de diseño y decisiones arquitectónicas.

---

## 1. Diagrama de Capas

```
┌─────────────────────────────────────────┐
│        CAPA DE PRESENTACIÓN             │
│  ┌─────────────────────────────────┐   │
│  │   Componentes React             │   │
│  │  ├─ Chatbot.jsx (Principal)     │   │
│  │  ├─ QuickActions                │   │
│  │  └─ Message List                │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│        CAPA DE LÓGICA                   │
│  ┌─────────────────────────────────┐   │
│  │   Hooks Personalizados          │   │
│  │  ├─ useSpeechRecognition()      │   │
│  │  ├─ useAudioRecording()         │   │
│  │  └─ [Otros hooks]              │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│        CAPA DE SERVICIOS                │
│  ┌─────────────────────────────────┐   │
│  │   Servicios                     │   │
│  │  ├─ audioService.js             │   │
│  │  ├─ chatConfig.js               │   │
│  │  └─ Utilidades                  │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│        CAPA DE DATOS / APIs             │
│  ┌─────────────────────────────────┐   │
│  │   APIs Externas                 │   │
│  │  ├─ Groq Chat API               │   │
│  │  ├─ Groq Whisper API            │   │
│  │  ├─ Web Speech API              │   │
│  │  └─ MediaRecorder API           │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 2. Flujo de Datos

### 2.1 Flujo de Chat (Texto)

```
Usuario digita mensaje
          ↓
    [Input Control]
          ↓
    sendMessage(text)
          ↓
    Agregar a estado messages []
          ↓
    Groq.chat.completions.create()
          ↓
    Respuesta con streaming
          ↓
    Actualizar messages en tiempo real
          ↓
    Renderizar en UI
          ↓
    Usuario ve respuesta
```

**Código:**
```javascript
// En chatbot.jsx
const sendMessage = async (text) => {
  // 1. Agregar mensaje del usuario
  const userMsg = { role: "user", content: text };
  setMessages(prev => [...prev, userMsg]);

  try {
    // 2. Preparar contexto (historial + nuevo mensaje)
    const requestMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
      userMsg
    ];

    // 3. Enviar a Groq
    const response = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: requestMessages,
      stream: true
    });

    // 4. Procesar respuesta con streaming
    let assistantMsg = "";
    for await (const chunk of response) {
      const delta = chunk.choices[0]?.delta?.content || "";
      assistantMsg += delta;
      
      // 5. Actualizar UI en tiempo real
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: assistantMsg
        };
        return updated;
      });
    }
  } catch (error) {
    // Manejar error
  }
};
```

---

### 2.2 Flujo de Reconocimiento de Voz

```
Usuario hace clic en 🎤 (Hablar)
          ↓
    startListening()
          ↓
    Navegador solicita permiso micrófono
          ↓
    Web Speech API comienza a escuchar
          ↓
    Usuario habla
          ↓
    En tiempo real: interimTranscript
          ↓
    Usuario deja de hablar (silencio detectado)
          ↓
    onend(): isListening = false
          ↓
    transcript contiene texto final
          ↓
    Usuario presiona Enter para enviar
          ↓
    sendMessage(transcript)
          ↓
    Continúa flujo de chat
```

**Estado del Hook:**
```javascript
// useSpeechRecognition.js

const recognition = new SpeechRecognition();

recognition.onstart = () => {
  setIsListening(true);
  setTranscript('');  // Limpiar previos
  setInterimTranscript('');
};

recognition.onresult = (event) => {
  let interim = '';
  let final = '';

  for (let i = event.resultIndex; i < event.results.length; i++) {
    const text = event.results[i][0].transcript;
    
    if (event.results[i].isFinal) {
      final += text + ' ';
    } else {
      interim += text;
    }
  }

  setInterimTranscript(interim);
  setTranscript(prev => prev + final);  // Acumular finales
};

recognition.onend = () => {
  setIsListening(false);  // Final
};
```

---

### 2.3 Flujo de Grabación y Transcripción de Audio

```
Usuario hace clic en 🔴 Grabar
          ↓
    startRecording()
          ↓
    Solicita permiso de micrófono
          ↓
    Inicia MediaRecorder
          ↓
    Usuario habla (recordingTime incrementa)
          ↓
    Usuario hace clic en ⏹️ Detener
          ↓
    stopRecording()
          ↓
    MediaRecorder.onstop() → audioBlob creado
          ↓
    Usuario ve botón de reproducción y "Enviar Audio"
          ↓
    Usuario hace clic en "Enviar"
          ↓
    transcribeAudio(audioBlob, 'es')
          ↓
    Groq Whisper API procesa audio
          ↓
    Retorna texto transcrito
          ↓
    sendMessage(transcribedText)
          ↓
    Chat continúa normalmente
```

**Código en audioService.js:**
```javascript
export const transcribeAudio = async (audioBlob, language = 'es') => {
  try {
    // Validar
    if (!audioBlob || audioBlob.size === 0) {
      throw new Error('El archivo de audio está vacío.');
    }

    // Convertir Blob a File
    const audioFile = new File([audioBlob], 'audio.webm', {
      type: 'audio/webm'
    });

    console.log('📤 Enviando a Groq...', { size: audioBlob.size });

    // Groq Whisper API
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3-turbo",
      language: language,
      temperature: 0.2
    });

    console.log('✅ Transcripción:', transcription.text);
    return transcription.text;

  } catch (error) {
    // Manejo de errores específicos
    const errorMsg = mapErrorToMessage(error);
    throw new Error(errorMsg);
  }
};
```

---

## 3. Patrones de Diseño

### 3.1 React Hooks Pattern

**Ventajas:**
- ✅ Lógica reutilizable
- ✅ Fácil de testear
- ✅ Composición sobre herencia
- ✅ Hooks como "custom hooks"

**Ejemplo:**
```javascript
// useSpeechRecognition es un hook personalizado
function Chatbot() {
  const speechApi = useSpeechRecognition();    // Hook 1
  const audioApi = useAudioRecording();        // Hook 2
  
  // Ambos pueden usarse en otro componente
  return (
    <VoiceButton {...speechApi} />
    <AudioRecorder {...audioApi} />
  );
}
```

### 3.2 Compound Components Pattern

Componente principal orquesta subcomponentes:

```javascript
// Chatbot.jsx es el componente compuesto
export default Chatbot
  ├── Renderiza <QuickActions>
  ├── Renderiza <MessageList>
  ├── Renderiza <VoiceRecognitionControl>
  ├── Renderiza <AudioRecordingControl>
  └── Renderiza <TextInput>
```

### 3.3 API Wrapper Pattern

`audioService.js` encapsula lógica de API:

```javascript
// Abstracción limpia
export const transcribeAudio = async (blob, lang) => {
  // Detalles de implementación escondidos
  // Usuario solo llama: transcribeAudio(blob, 'es')
}

export const createAudioURL = (blob) => {
  // Abstracción de createObjectURL
}

export const formatTime = (seconds) => {
  // Utilidad pura
}
```

### 3.4 State Management Pattern

**Micro-state en hooks:**
```javascript
// En lugar de Redux, cada hook gestiona su propio estado
const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  // ... más estado
}
```

**Ventajas:**
- ✅ Simple para apps medianas
- ✅ Sin boilerplate de Redux
- ✅ Fácil de entender
- ⚠️ Escalabilidad limitada (si crece mucho → considerar Redux)

---

## 4. Flujos de Manejo de Errores

### 4.1 Errores de API Groq

```
Groq Error
    ↓
┌─── 401 ─────────────────┐
│  "API key inválida"      │
│  → Verificar .env        │
└──────────────────────────┘
┌─── 429 ─────────────────┐
│  "Rate limit"            │
│  → Esperar 60s           │
└──────────────────────────┘
┌─── 400 ─────────────────┐
│  "Formato inválido"      │
│  → Validar input         │
└──────────────────────────┘
┌─── 500+ ────────────────┐
│  "Error servidor"        │
│  → Reintentar o avisar   │
└──────────────────────────┘
```

**Implementación:**
```javascript
catch (error) {
  let errorMsg = 'Error desconocido';
  
  switch(error.status) {
    case 401:
      errorMsg = '❌ API key inválida o expirada';
      break;
    case 429:
      errorMsg = '⏳ Límite alcanzado. Espera 60s';
      break;
    case 400:
      errorMsg = '❌ Formato de audio no soportado';
      break;
    default:
      errorMsg = `❌ Error: ${error.message}`;
  }
  
  throw new Error(errorMsg);
}
```

### 4.2 Errores de Web APIs (Micrófono)

```
Solicitud de Micrófono
    ↓
┌─── NotAllowedError ──────────────┐
│  Permiso denegado por usuario     │
│  → Mostrar instrucciones          │
└──────────────────────────────────┘
┌─── NotFoundError ────────────────┐
│  No hay micrófono físico          │
│  → Usar solo chat de texto        │
└──────────────────────────────────┘
┌─── NotSupportedError ────────────┐
│  Navegador no soporta API        │
│  → Sugerir actualización          │
└──────────────────────────────────┘
```

---

## 5. Seguridad y Privacidad

### 5.1 Seguridad Médica (System Prompt)

```
┌─────────────────────────────────────────┐
│     REGLAS CRÍTICAS DE SEGURIDAD        │
├─────────────────────────────────────────┤
│ ✅ Orientar a especialistas             │
│ ❌ NO diagnosticar                      │
│ ❌ NO recetar medicamentos              │
│ ⚠️ DETECTAR EMERGENCIAS                 │
│    → Derivas a urgencias                │
│ ✅ Lenguaje empático                    │
│ ❌ NO proporcionar garantías             │
└─────────────────────────────────────────┘
```

**Ejemplos en Prompt:**
```javascript
// ✅ CORRECTO
"Si el paciente indica dolor fuerte en pecho, 
indica que debe llamar a EMERGENCIAS inmediatamente"

// ❌ INCORRECTO (NO PERMITIDO)
"Basándome en tus síntomas, tienes diabetes"
"Toma ibuprofeno cada 8 horas"
```

### 5.2 Privacidad de Datos

**En el Cliente:**
- ✅ Conversaciones en state (RAM)
- ✅ Sin localStorage para datos sensibles
- ✅ Limpieza automática al cerrar sesión

**En Transmisión:**
- ✅ HTTPS obligatorio en producción
- ✅ API keys en variables de entorno
- ✅ .env NO se commitea a Git

**En Servidor (Groq):**
- ✅ Groq no guarda historial (stateless)
- ✅ API keys valen solo 24 horas
- ⚠️ Revisar términos de servicio de Groq

### 5.3 Validación de Input

```javascript
// Validar antes de enviar a API
const validateMessage = (text) => {
  if (!text.trim()) {
    return { valid: false, error: "Mensaje vacío" };
  }
  if (text.length > 4096) {
    return { valid: false, error: "Texto muy largo" };
  }
  return { valid: true };
};
```

---

## 6. Performance y Optimización

### 6.1 Streaming de Respuestas

**Sin streaming (bloquea UI):**
```javascript
// ❌ Espera respuesta completa
const response = await groq.chat.completions.create({...});
setMessages([...response]); // Todo de una vez
```

**Con streaming (fluido):**
```javascript
// ✅ Actualiza incrementalmente
const response = await groq.chat.completions.create({
  stream: true  // ← Habilitado
});

for await (const chunk of response) {
  const text = chunk.choices[0].delta.content;
  setMessages(prev => updateLastMessage(prev, text));
}
```

**Beneficios:**
- ✅ Sensación de respuesta inmediata
- ✅ UI no se congela
- ✅ Mejor UX percibido

### 6.2 Memoización

Para evitar renders innecesarios:

```javascript
const handleQuickAction = useCallback((text) => {
  // Función estable (no se recrea en cada render)
  sendMessage(text);
}, [sendMessage]);  // Dependencias
```

### 6.3 Lazy Loading de Hooks

Inicializar APIs solo cuando sea necesario:

```javascript
// En Chatbot.jsx
const [showVoiceFeatures, setShowVoiceFeatures] = useState(false);

const speechApi = showVoiceFeatures 
  ? useSpeechRecognition()
  : null;  // No se inicializa si no se necesita
```

---

## 7. Testing

### 7.1 Estructura de Tests

```
src/
├── hooks/
│   ├── useSpeechRecognition.js
│   └── __tests__/
│       └── useSpeechRecognition.test.js
├── Chatbot.jsx
└── Chatbot.test.js
```

### 7.2 Tests Unitarios (Hooks)

```javascript
// useSpeechRecognition.test.js
describe('useSpeechRecognition', () => {
  test('debe inicializar con isListening=false', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    expect(result.current.isListening).toBe(false);
  });

  test('debe capturar texto cuando habla el usuario', async () => {
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => {
      result.current.startListening();
    });
    // Simular evento de voz...
  });
});
```

### 7.3 Tests de Integración

```javascript
// Chatbot.test.js
describe('Chatbot', () => {
  test('debe enviar mensaje y recibir respuesta', async () => {
    render(<Chatbot />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'Hola' } });
    fireEvent.submit(input.form);
    
    // Esperar respuesta
    await waitFor(() => {
      expect(screen.getByText(/respuesta/i)).toBeInTheDocument();
    });
  });
});
```

---

## 8. Escalabilidad Futura

### 8.1 Si Crecimiento es Pequeño (A-B Testing)

```javascript
// Agregar más hooks sin cambiar arquitectura
const usePredefinedResponses = () => { /* ... */ };
const useAnalytics = () => { /* ... */ };
```

### 8.2 Si Crecimiento es Moderado (Más Usuarios)

```
CONSIDERAR:
- Agregar backend (Node.js/Express)
- Guardar historial en BD
- Agregar autenticación
- Rate limiting en servidor
- Caché de respuestas frecuentes
```

### 8.3 Si Crecimiento es Grande (Empresa Grande)

```
CONSIDERAR:
- Migrar a TypeScript
- Agregar Redux/Zustand para estado global
- Microservicios
- Multi-idioma (i18n)
- Analytics avanzado
- Dashboard de admin
- ML para mejora de prompts
```

---

## 9. Diagrama Completo de Interacción

```
┌─────────────────────────────────────────────────────────────────┐
│                          USUARIO                                 │
├────────────┬──────────────┬─────────────────┬──────────────────┤
│   Chat     │   Micrófono  │   Grab Audio    │  Click Botones   │
└────┬───────┴───────┬──────┴────────┬────────┴─────────┬────────┘
     │               │               │                  │
     ↓               ↓               ↓                  ↓
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐
│  INPUT   │  │   SPEECH │  │  RECORD  │  │  QUICK ACTIONS   │
│ CONTROL  │  │   API    │  │   API    │  │   (Predefinido)  │
└────┬─────┘  └─────┬────┘  └────┬─────┘  └────┬─────────────┘
     │              │             │             │
     └──────────────┴─────────────┴─────────────┘
                    │
                    ↓
           ┌─────────────────┐
           │  CHATBOT.JSX    │
           │  (Orquestador)  │
           └────────┬────────┘
                    │
        ┌───────────┼───────────┐
        ↓           ↓           ↓
   ┌────────┐ ┌────────┐ ┌────────┐
   │ SPEECH │ │ AUDIO  │ │ AUDIO  │
   │ RECOG  │ │RECORD  │ │SERVICE │
   │ HOOK   │ │ HOOK   │ │(UTILS) │
   └────────┘ └────────┘ └────┬───┘
                              │
                    ┌─────────┴─────────┐
                    ↓                   ↓
            ┌──────────────┐   ┌──────────────┐
            │  GROQ CHAT   │   │  GROQ AUDIO  │
            │  API (LLM)   │   │  API(WHISPER)│
            └──────────────┘   └──────────────┘
                    │                   │
                    └─────────┬─────────┘
                              ↓
                   ┌──────────────────┐
                   │  RESPUESTA       │
                   │  (streaming)     │
                   └────────┬─────────┘
                            ↓
                   ┌──────────────────┐
                   │  ACTUALIZAR      │
                   │  ESTADO (state)  │
                   └────────┬─────────┘
                            ↓
                   ┌──────────────────┐
                   │  RENDERIZAR      │
                   │  EN UI           │
                   └────────┬─────────┘
                            ↓
                        ┌───────┐
                        │ USUARIO│
                        │  VE    │
                        │ RESP   │
                        └───────┘
```

---

**Última actualización:** Febrero 2026  
**Versión:** 1.0.0  
**Mantenedor:** Equipo de Desarrollo
