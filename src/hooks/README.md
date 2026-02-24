# useSpeechRecognition Hook

Hook personalizado de React para utilizar la API de reconocimiento de voz del navegador (Web Speech API).

## Características

✅ **Reconocimiento de voz en tiempo real**  
✅ **Soporte multi-navegador** (Chrome, Edge, Safari, Firefox)  
✅ **Manejo inteligente de errores**  
✅ **Idioma configurable**  
✅ **Resultados provisionales e intermedios**  
✅ **Totalmente accesible (ARIA)**

## Instalación

El hook ya está integrado en la carpeta `src/hooks/`. Solo importalo donde lo necesites.

```jsx
import useSpeechRecognition from './hooks/useSpeechRecognition';
```

## Uso Básico

```jsx
import React, { useState } from 'react';
import useSpeechRecognition from './hooks/useSpeechRecognition';

function MyComponent() {
  const [text, setText] = useState('');
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
    setLanguage,
  } = useSpeechRecognition();

  // Agregar el transcript al texto cuando termine
  React.useEffect(() => {
    if (!isListening && transcript) {
      setText(prev => prev + transcript);
      clearTranscript();
    }
  }, [isListening, transcript, clearTranscript]);

  if (!isSupported) {
    return <p>Tu navegador no soporta reconocimiento de voz.</p>;
  }

  return (
    <div>
      {/* Input con preview del texto en vivo */}
      <textarea 
        value={text + (isListening ? interimTranscript : '')} 
        onChange={(e) => setText(e.target.value)}
        placeholder="Escribe o habla..."
      />

      {/* Mostrar errores */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Botones */}
      <button onClick={toggleListening}>
        {isListening ? '⏹️ Detener' : '🎤 Escuchar'}
      </button>

      <button onClick={() => setLanguage('en-US')}>English</button>
      <button onClick={() => setLanguage('es-ES')}>Español</button>
      <button onClick={clearTranscript}>Limpiar</button>
    </div>
  );
}
```

## API

### Hook Hook return value

```typescript
{
  isListening: boolean,        // Si está escuchando en este momento
  transcript: string,          // Texto final reconocido
  interimTranscript: string,   // Texto provisional mientras habla
  error: string | null,        // Mensaje de error (si existe)
  isSupported: boolean,        // Si el navegador soporta la función
  startListening: () => void,  // Inicia la escucha
  stopListening: () => void,   // Detiene la escucha
  toggleListening: () => void, // Alterna entre iniciar/detener
  clearTranscript: () => void, // Limpia el transcript
  setLanguage: (lang: string) => void, // Cambia el idioma (ej: 'es-ES', 'en-US')
}
```

## Códigos de Idioma

Algunos ejemplos comunes:

| Idioma | Código |
|--------|--------|
| Español | `es-ES` |
| Español (Latino) | `es-MX` |
| Inglés | `en-US` |
| Inglés (UK) | `en-GB` |
| Francés | `fr-FR` |
| Alemán | `de-DE` |
| Italiano | `it-IT` |
| Portugués | `pt-BR` |
| Chino Simplificado | `zh-CN` |
| Japonés | `ja-JP` |

## Mensajes de Error Manejados

El hook detecta automáticamente y proporciona mensajes claros para:

- 🎤 **No se detectó micrófono**: Verifica los permisos del navegador
- ⏱️ **No se detectó sonido**: Intenta hablar más fuerte
- 🌐 **Error de red**: Sin conexión a internet
- ⚠️ **Servicio no disponible**: El servidor de reconocimiento está caído
- ⏸️ **Cancelado**: El usuario canceló la operación

## Integración en el Chatbot

En `chatbot.jsx`, el hook se integra de la siguiente manera:

```jsx
// Usar el hook
const {
  isListening,
  transcript,
  interimTranscript,
  error: speechError,
  isSupported,
  toggleListening,
  clearTranscript,
} = useSpeechRecognition();

// Cuando termine de escuchar, agregar el texto al input
useEffect(() => {
  if (!isListening && transcript) {
    setInput(prev => prev + transcript);
    clearTranscript();
  }
}, [isListening, transcript, clearTranscript]);

// Botón del micrófono en la interfaz
<button 
  onClick={toggleListening}
  className={`mic-button ${isListening ? 'listening' : ''}`}
>
  {isListening ? '🎙️ 🔴' : '🎤'}
</button>
```

## Soporte de Navegadores

| Navegador | Versión | Soporte |
|-----------|---------|---------|
| Chrome | 25+ | ✅ Completo |
| Edge | 79+ | ✅ Completo |
| Safari | 14.1+ | ✅ Completo |
| Firefox | 77+ | ✅ Completo (con permisos) |
| Opera | 27+ | ✅ Completo |
| IE | Cualquiera | ❌ No soportado |

## Consideraciones de Privacidad

⚠️ **Importante**: El reconocimiento de voz requiere permiso del usuario.

Al usar por primera vez:
1. El navegador pedirá permiso para acceder al micrófono
2. El usuario debe aceptar
3. La grabación se envía al servidor de reconocimiento
4. Los datos se procesan y LUEGO se descartan

## Ejemplo Avanzado: Chat interactivo

```jsx
import useSpeechRecognition from './hooks/useSpeechRecognition';

function AdvancedChat() {
  const [input, setInput] = useState('');
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    toggleListening,
    clearTranscript,
    setLanguage,
  } = useSpeechRecognition();

  const handleSendMessage = () => {
    // Usar input o el texto reconocido
    const messageToSend = input || transcript;
    console.log('Enviando:', messageToSend);
    setInput('');
    clearTranscript();
  };

  // Enviar automáticamente cuando se detecte final
  useEffect(() => {
    // Detección automática: si hay transcripción final y se detiene
    if (!isListening && transcript && !input) {
      setInput(transcript);
    }
  }, [isListening, transcript]);

  return (
    <div>
      <input 
        value={input + (isListening ? interimTranscript : '')}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Escribe o habla..."
      />

      {error && <div className="error">{error}</div>}

      <button onClick={toggleListening}>
        {isListening ? 'Detener' : 'Escuchar'}
      </button>

      <button onClick={handleSendMessage}>Enviar</button>

      {/* Selector de idioma */}
      <select onChange={(e) => setLanguage(e.target.value)}>
        <option value="es-ES">Español</option>
        <option value="en-US">English</option>
        <option value="fr-FR">Français</option>
      </select>
    </div>
  );
}
```

## Debugging

Si tienes problemas con el reconocimiento de voz:

1. **Verifica los permisos del navegador**
   - Chrome: ⚙️ Configuración → Privacidad → Micrófono
   
2. **Verifica la consola**
   ```javascript
   // El hook registra errores en la consola con [Error X]
   console.log('Error detallado:', error);
   ```

3. **Usa el navegador indicado**
   - Chrome, Edge o Safari tienen mejor soporte
   - Firefox requiere configuración adicional

4. **Internet conectado**
   - La API requiere conexión a internet

## Contribuciones

Si encuentras un bug o quieres mejorar el hook, edita [useSpeechRecognition.js](./useSpeechRecognition.js).
