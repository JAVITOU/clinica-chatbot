# 🔧 Guía de Troubleshooting y FAQ

## Tabla de Contenidos
1. [Instalación](#instalación)
2. [API Groq](#api-groq)
3. [Micrófono y Voz](#micrófono-y-voz)
4. [Grabación de Audio](#grabación-de-audio)
5. [Performance](#performance)
6. [Errores Comunes](#errores-comunes)
7. [FAQ](#faq)

---

## Instalación

### ❌ Error: "npm: command not found"

**Síntoma:**
```bash
$ npm install
bash: npm: command not found
```

**Causa:** Node.js no está instalado

**Solución:**
1. Descargar Node.js desde https://nodejs.org/
2. Instalar versión LTS (Long Term Support)
3. Verificar instalación:
   ```bash
   node --version
   npm --version
   ```
4. Reiniciar terminal
5. `npm install` nuevamente

---

### ❌ Error: "npm ERR! 404 Not Found"

**Síntoma:**
```bash
npm ERR! 404 Not Found - GET https://registry.npmjs.org/groq-sdk
```

**Causa:** Paquete no existe o conexión a internet

**Solución:**
```bash
# Limpiar cache
npm cache clean --force

# Verificar conexión a internet
ping registry.npmjs.org

# Reintentar instalación
npm install

# Si sigue fallando, especificar versión
npm install groq-sdk@0.37.0
```

---

### ❌ Error: "Module not found: Can't resolve..."

**Síntoma:**
```bash
Module not found: Can't resolve './hooks/useSpeechRecognition'
in '/Users/usuario/clinica-chatbot/src'
```

**Causa:** Archivo no existe o ruta incorrecta

**Solución:**
1. Verificar que el archivo existe:
   ```bash
   ls src/hooks/useSpeechRecognition.js
   ```
2. Verificar sintaxis de importación:
   ```javascript
   // ✅ Correcto
   import useSpeechRecognition from './hooks/useSpeechRecognition';

   // ❌ Incorrecto
   import useSpeechRecognition from './hooks/useSpeechRecognition.js';
   ```
3. Verificar que no hay símbolos raros en la ruta

---

### ❌ Error: "Permission denied"

**Windows (PowerShell):**
```bash
npm : powershell.exe cannot be loaded because running scripts is disabled
```

**Solución:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# Responder: A (Yes to All)
npm install
```

**macOS/Linux:**
```bash
sudo npm install -g npm
```

---

## API Groq

### ❌ Error: "401 Unauthorized - Invalid API Key"

**Síntoma:**
```bash
Error: 401 Unauthorized
Invalid authentication credentials
```

**Causa:** API key inválida, expirada o no configurada

**Solución:**

1. **Verificar que `.env` existe:**
   ```bash
   ls -la .env
   ```

2. **Verificar contenido:**
   ```bash
   cat .env
   ```
   Debe contener:
   ```
   REACT_APP_GROQ_API_KEY=gsk_xxxxx...
   ```

3. **Verificar API key en Groq:**
   - Ve a https://console.groq.com/keys
   - Verifica que la clave no dice "Expired"
   - Si está expirada, generar nueva:
     - Click "Create API Key"
     - Copiar la nueva clave
     - Actualizar `.env`

4. **Reiniciar servidor:**
   ```bash
   npm start
   ```
   (Metro necesita recargar variables de entorno)

**Check rápido:**
```javascript
// En Chatbot.jsx, línea 8
console.log('API Key:', process.env.REACT_APP_GROQ_API_KEY.substring(0, 10) + '...');
```

---

### ❌ Error: "429 Too Many Requests"

**Síntoma:**
```bash
Error: 429 Too Many Requests
Rate limit exceeded
```

**Causa:** Excediste límite de tokens/minuto (9.000 en plan gratuito)

**Soluciones:**

1. **Esperar:** El límite se reinicia cada minuto
   ```javascript
   // Esperar 60 segundos
   setTimeout(() => {
     // Reintentar
   }, 60000);
   ```

2. **Reducir frequency:**
   - No enviar múltiples mensajes simultáneamente
   - Agregar delays entre requests
   ```javascript
   // ❌ NO HACER (demasiado rápido)
   await groq.chat.completions.create({...});
   await groq.chat.completions.create({...});

   // ✅ HACER (con delay)
   await groq.chat.completions.create({...});
   await new Promise(r => setTimeout(r, 500));
   await groq.chat.completions.create({...});
   ```

3. **Reducir tokens:**
   - Limitar `max_tokens` a 512 (no 2048)
   - Hacer prompts más cortos
   ```javascript
   const response = await groq.chat.completions.create({
     model: "mixtral-8x7b-32768",
     messages: [...],
     max_tokens: 512  // ← Reducir
   });
   ```

4. **Cambiar plan:**
   - Si es uso en producción, considerar plan de pago

---

### ❌ Error: "400 Bad Request"

**Síntoma:**
```bash
Error: 400 Bad Request
Invalid request
```

**Posibles causas:**

1. **Formato de audio inválido:**
   ```javascript
   // ❌ NO SOPORTADO
   const file = new File([audioBlob], 'audio.flac', { 
     type: 'audio/flac' 
   });

   // ✅ SOPORTADO
   const file = new File([audioBlob], 'audio.webm', { 
     type: 'audio/webm' 
   });
   ```

2. **Audio vacío o muy pequeño:**
   ```javascript
   if (!audioBlob || audioBlob.size < 1000) {
     throw new Error('Audio muy pequeño. Graba más tiempo.');
   }
   ```

3. **Parámetros inválidos:**
   ```javascript
   // ❌ INCORRECTO
   temperature: 2.5  // Máximo es 1

   // ✅ CORRECTO
   temperature: 0.7  // Entre 0 y 1
   ```

---

### ❌ Error: "Model not found"

**Síntoma:**
```bash
Error: model 'mi-modelo-inventado' not found
```

**Solución:**

Usar modelos válidos de Groq:

```javascript
// ✅ VÁLIDOS
"mixtral-8x7b-32768"      // LLM principal (recomendado)
"llama-2-70b-chat"         // Alternativa
"gemma-7b-it"              // Modelo más rápido

// Para audio transcripción
"whisper-large-v3-turbo"   // Único disponible para audio
```

---

## Micrófono y Voz

### ❌ Error: "Tu navegador no soporta reconocimiento de voz"

**Síntoma:**
```
Error: Tu navegador no soporta reconocimiento de voz
Usa Chrome, Edge o Safari.
```

**Causa:** Navegador no implementa Web Speech API

**Solución:**

1. **Cambiar a navegador soportado:**
   | Navegador | Soporte |
   |---|---|
   | Chrome 25+ | ✅ Completo |
   | Edge 79+ | ✅ Completo |
   | Firefox 44+ | ✅ Completo |
   | Safari 14+ | ⚠️ Limitado |
   | Internet Explorer | ❌ No soporta |

2. **Actualizar navegador:**
   ```bash
   # Chrome
   Chrome Menu → Help → About Google Chrome
   # Si hay actualización disponible, se instala automáticamente
   ```

3. **Fallback a solo texto:**
   ```javascript
   // En useSpeechRecognition.js
   if (!SpeechRecognition) {
     // Deshabilitar botón de micrófono
     return { isSupported: false };
   }
   ```

---

### ❌ Error: "No speech was detected"

**Síntoma:**
```
⏱️ No se detectó sonido. Intenta de nuevo.
```

**Causa:** El micrófono no está grabando audio correctamente

**Soluciones:**

1. **Verificar permiso del navegador:**
   - Chrome: Settings → Privacy and Security → Microphone
   - Firefox: About:preferences → Privacy → Microphone
   - Verificar que el sitio está permitido

2. **Verificar micrófono físico:**
   ```bash
   # macOS/Linux
   arecord --list-devices
   
   # Windows PowerShell
   Get-PnpDevice -Class AudioEndpoint
   ```

3. **Hablar más cerca del micrófono:**
   - Estar a 10-30 cm del micrófono
   - Hablar claramente
   - Evitar ruido de fondo

4. **Aumentar volumen:**
   - Aumentar volumen del sistema operativo
   - En settings del navegador si es posible

5. **Probar otro dispositivo:**
   - Si el micrófono es USB, probarlo en otro puerto
   - Si es integrado, probar un micrófono externo

---

### ❌ Error: "Microphone access denied"

**Síntoma:**
```
🎤 No se detectó micrófono. Verifica los permisos.
Or:
Permission denied - microphone
```

**Causa:** Permiso denegado por usuario

**Solución:**

1. **Permitir nuevamente en el navegador:**

   **Chrome:**
   - Click en icono de micrófono en barra de dirección
   - Cambiar permiso a "Allow"
   - Recargar página
   - Reintentar

   **Firefox:**
   - about:preferences#privacy
   - Buscar "Microphone"
   - Permitir para el sitio

   **Safari:**
   - System Preferences → Security & Privacy → Microphone
   - Permitir Safari

2. **Limpiar permisos de sitio:**
   ```javascript
   // En DevTools console
   navigator.permissions.query({name: 'microphone'}).then(result => {
     console.log(result.state); // 'granted', 'denied', 'prompt'
   });
   ```

3. **Reiniciar navegador:**
   - Cerrar completamente el navegador
   - Reabrirlo
   - Ir al sitio
   - Dar permiso nuevamente

---

## Grabación de Audio

### ❌ Error: "Your browser doesn't support audio recording"

**Síntoma:**
```
Tu navegador no soporta grabación de audio.
Usa Chrome, Edge o Firefox.
```

**Causa:** Navegador no implementa MediaRecorder API

**Solución:**
- Usar navegador soportado (Chrome, Edge, Firefox)
- Actualizar navegador a versión reciente

---

### ❌ Error: "NotAllowedError: Permission denied"

**Síntoma:**
```
NotAllowedError: Permission denied
User did not allow microphone access
```

**Solución:** (Ver sección "Microphone access denied" arriba)

---

### ❌ Error: "NotFoundError: Microphone not found"

**Síntoma:**
```
NotFoundError: Requested device not found
```

**Causa:** No hay micrófono conectado o habilitado

**Solución:**
1. Conectar micrófono USB
2. En Settings del SO, verificar que el micrófono está detectado
3. Si es micrófono integrado, verificar en BIOS que está habilitado

---

### ❌ Audio grabado pero no se transcribe

**Síntoma:**
- Audio graba correctamente ✅
- Botón "Enviar Audio" aparece ✅
- Al hacer click, no pasa nada ❌

**Causa:** Error en API de transcripción (probablemente silencioso)

**Solución:**

1. **Revisar console de DevTools (F12):**
   ```javascript
   // Ver si hay error
   console.error() en la pestaña Console
   ```

2. **Agregar logs:**
   ```javascript
   // En audioService.js
   console.log('📤 Enviando a Groq...');
   const transcription = await groq.audio.transcriptions.create({...});
   console.log('✅ Transcripción:', transcription.text);
   ```

3. **Verificar tamaño del audio:**
   ```javascript
   console.log('Tamaño:', audioBlob.size, 'bytes');
   // Debe ser > 1000 bytes
   ```

4. **Verificar API key:**
   ```javascript
   console.log('API Key existe:', !!process.env.REACT_APP_GROQ_API_KEY);
   ```

---

## Performance

### ❌ Aplicación lenta

**Síntoma:** Demora al escribir, retraso en respuestas

**Soluciones:**

1. **Verificar CPU/RAM:**
   ```bash
   # macOS
   top
   
   # Windows
   Get-Process chrome | % {$_.ProcessName, $_.Handles, $_.Memory}
   ```

2. **Limpiar cache del navegador:**
   - Chrome: Ctrl+Shift+Delete
   - Safari: Develop → Empty Web Storage
   - Firefox: History → Clear Recent History

3. **Desactivar extensiones del navegador:**
   - Pueden ralentizar la ejecución

4. **Reducir historial de chat:**
   - Muchos mensajes → Estado más grande
   - Considerar paginación o archiving

---

### ❌ Streaming muy lento

**Síntoma:** Respuesta del chatbot aparece lentamente palabra por palabra

**Causa:** Internet lento o servidor remoto lento

**Soluciones:**

1. **Verificar conexión a internet:**
   ```bash
   speedtest-cli
   # O usar https://speedtest.net
   ```

2. **Usar modelo más rápido:**
   ```javascript
   // Cambiar en chatbot.jsx
   model: "gemma-7b-it"  // Más rápido pero menos preciso
   ```

3. **Reducir max_tokens:**
   ```javascript
   max_tokens: 256  // Repuestas más cortas
   ```

---

## Errores Comunes

### ❌ "Cannot read property 'role' of undefined"

**Síntoma:**
```
TypeError: Cannot read property 'role' of undefined
```

**Causa:** Array de mensajes vacío o mal inicializado

**Solución:**
```javascript
// ❌ MAL
const [messages, setMessages] = useState();

// ✅ CORRECTO
const [messages, setMessages] = useState([
  { role: "system", content: systemPrompt },
  { role: "assistant", content: "Hola, ¿cómo estás?" }
]);
```

---

### ❌ "asyncio.TimeoutError"

**Síntoma:**
```
asyncio.TimeoutError: Timeout waiting for completion
```

**Causa:** Solicitud tardó más de 60 segundos

**Solución:**

1. **Reducir complejidad:**
   - Prompt más corto
   - max_tokens más bajo

2. **Reintentar:**
   ```javascript
   try {
     const response = await groq.chat.completions.create({...});
   } catch (error) {
     console.log('Reintentando...');
     setTimeout(() => {
       // Reintentar
     }, 3000);
   }
   ```

---

## FAQ

### ¿Dónde guardo la conversación entre sesiones?

**Respuesta:** Actualmente NO se guarda. Las conversaciones se pierden al recargar.

Para guardar, necesitas:
1. Backend (Base de datos)
2. Autenticación de usuarios
3. API para persistencia

Roadmap de futuro.

---

### ¿Puedo usar otros idiomas además de español?

**Respuesta:** Sí, pero requiere cambios:

1. **Para speech recognition:**
   ```javascript
   // En useSpeechRecognition.js, línea 35
   recognition.lang = 'en-US';  // Cambiar
   ```

2. **Para transcripción:**
   ```javascript
   // En audioService.js
   const transcription = await groq.audio.transcriptions.create({
     language: 'en',  // Cambiar
   });
   ```

3. **Para modelo:**
   ```javascript
   // En chatbot.jsx
   const systemPrompt = `
   You are a virtual assistant for San Jose Clinic...
   `;
   ```

---

### ¿Funciona sin internet?

**Respuesta:** NO. Requiere conexión a internet porque:
- Web Speech API necesita servidor de Google
- Groq API requiere conexión
- Whisper es remoto (en Groq)

**Solución parcial:**
- Implementar Service Worker para cache offline
- Pero la IA seguirá requiriendo internet

---

### ¿Puedo cambiar el modelo de IA?

**Respuesta:** Sí, pero con limitaciones.

Modelos disponibles en Groq:
```javascript
"mixtral-8x7b-32768"     // Recomendado (mejor)
"llama-2-70b-chat"       // Alternativa
"llama-3-70b-versatile"  // Más nuevo
"gemma-7b-it"            // Más rápido
```

Para cambiar:
```javascript
// En chatbot.jsx, línea 260
model: "llama-3-70b-versatile"
```

---

### ¿Cuánto cuesta usar Groq?

**Respuesta:**

| Recurso | Precio |
|---|---|
| Chat API | $0.05 / 1M tokens (input) |
| | $0.15 / 1M tokens (output) |
| Audio API | $0.02 / minuto de audio |
| Nivel gratuito | 9.000 tokens/min |

Plan gratuito es suficiente para pruebas.

Calcular costo:
- Mensaje típico: 500 tokens
- 1.000 mensajes/mes: 500.000 tokens = ~$1 USD

---

### ¿Cómo mejoro la precisión del reconocimiento de voz?

**Respuesta:**

1. **Hablar claramente:**
   - Sin acento fuerte
   - Palabras bien pronunciadas

2. **Ambiente quieto:**
   - Minimalizar ruido de fondo
   - Cerrar puertas y ventanas

3. **Micrófono de calidad:**
   - Micrófono USB es mejor que integrado
   - Evitar auriculares baratos

4. **Ejemplificar en prompt:**
   ```javascript
   const systemPrompt = `
   Esperamos input sobre síntomas médicos.
   Ejemplo de entrada esperada:
   - "Me duele la cabeza"
   - "Tengo fiebre"
   - "¿Cómo agendo una cita?"
   `;
   ```

---

### ¿Qué hago si el chatbot da respuestas incorrectas?

**Respuesta:**

1. **Revisar el system prompt:**
   - Base de conocimiento correcta
   - Instrucciones claras

2. **Cambiar modelo a más potente:**
   ```javascript
   model: "mixtral-8x7b-32768"  // Más preciso
   ```

3. **Aumentar temperature para variedad:**
   ```javascript
   temperature: 0.8  // Más creativo
   ```

4. **Fine-tuning (avanzado):**
   - Requiere datos de entrenamiento
   - API especial de Groq
   - Fuera del alcance de esta guía

---

### ¿El chatbot puede hacer diagnósticos?

**Respuesta:** **NO, POR DISEÑO.**

El system prompt está configurado para:
- ✅ Orientar a especialistas
- ❌ NO diagnosticar
- ⚠️ Detectar emergencias

**Razón:** Responsabilidad legal y seguridad médica

Si quieres cambiar esto, requiere:
1. Asesoría legal médica
2. Licencias/certificaciones apropiadas
3. Verificación profesional de respuestas

---

**Última actualización:** Febrero 2026  
**Versión:** 1.0.0
