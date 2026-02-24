# Grabación de Audio con MediaRecorder y Transcripción con Groq

Esta guía muestra cómo grabar audio usando `MediaRecorder` y enviarlo a Groq para transcripción.

## 📦 Archivos Relacionados

- `useAudioRecording.js` - Hook para grabar audio
- `audioService.js` - Funciones para transcribir con Groq
- Integración en `chatbot.jsx`

## 🎯 Características

✅ **Grabación de audio** con MediaRecorder  
✅ **Transcripción automática** con Groq Whisper  
✅ **Visualización del tiempo** de grabación  
✅ **Preview y descarte** de grabaciones  
✅ **Manejo de errores** completo  
✅ **Soporte multi-navegador** (Chrome, Edge, Firefox)

## 🔧 ¿Cómo Funciona?

### 1. Grabar Audio
```jsx
import useAudioRecording from './hooks/useAudioRecording';

function MyComponent() {
  const {
    isRecording,
    audioBlob,
    recordingTime,
    toggleRecording,
    discardRecording,
  } = useAudioRecording();

  return (
    <>
      <button onClick={toggleRecording}>
        {isRecording ? '⏹️ Detener' : '⏺️ Grabar'}
      </button>
      {isRecording && <span>Tiempo: {recordingTime}s</span>}
    </>
  );
}
```

### 2. Transcribir con Groq
```jsx
import { transcribeAudio } from './hooks/audioService';

async function handleTranscribe() {
  try {
    const text = await transcribeAudio(audioBlob, 'es');
    console.log('Transcripción:', text);
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

### 3. Flujo Completo in Chatbot
```jsx
const [audioBlob, setAudioBlob] = useState(null);
const [isTranscribing, setIsTranscribing] = useState(false);

const handleTranscribeAudio = async () => {
  if (!audioBlob) return;
  
  setIsTranscribing(true);
  try {
    const transcribedText = await transcribeAudio(audioBlob, 'es');
    setInput(prev => prev + ' ' + transcribedText);
    setAudioBlob(null);
  } catch (err) {
    setError(err.message);
  } finally {
    setIsTranscribing(false);
  }
};
```

## 📊 Hook useAudioRecording

### Estados Devueltos

```javascript
{
  isRecording,           // boolean - ¿Está grabando?
  audioBlob,            // Blob - Archivo de audio grabado
  error,                // string | null - Mensaje de error
  isSupported,          // boolean - ¿Soportado el navegador?
  recordingTime,        // number - Segundos de grabación
  startRecording,       // () => Promise<void>
  stopRecording,        // () => void
  toggleRecording,      // () => void - Alterna grabar/detener
  discardRecording,     // () => void - Descarta el audio
}
```

### Ejemplo Completo

```jsx
import useAudioRecording from './hooks/useAudioRecording';
import { transcribeAudio, formatTime } from './hooks/audioService';

function AudioRecorder() {
  const {
    isRecording,
    audioBlob,
    error,
    isSupported,
    recordingTime,
    toggleRecording,
    discardRecording,
  } = useAudioRecording();

  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  const handleTranscribe = async () => {
    setIsTranscribing(true);
    try {
      const text = await transcribeAudio(audioBlob, 'es');
      setTranscript(text);
    } catch (err) {
      console.error('Error:', err.message);
    } finally {
      setIsTranscribing(false);
    }
  };

  if (!isSupported) {
    return <p>Tu navegador no soporta grabación de audio.</p>;
  }

  return (
    <div>
      {!audioBlob ? (
        <>
          <button onClick={toggleRecording}>
            {isRecording ? `⏹️ ${formatTime(recordingTime)}` : '⏺️ Grabar'}
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </>
      ) : (
        <>
          <button onClick={handleTranscribe} disabled={isTranscribing}>
            {isTranscribing ? '⏳ Transcribiendo...' : '✅ Transcribir'}
          </button>
          <button onClick={discardRecording}>❌ Descartar</button>
        </>
      )}
      
      {transcript && <p>Texto: {transcript}</p>}
    </div>
  );
}
```

## 🎙️ Servicio de Audio (audioService.js)

### Funciones Disponibles

#### `transcribeAudio(audioBlob, language)`
Transcribe un archivo de audio usando Groq Whisper.

```javascript
try {
  const text = await transcribeAudio(audioBlob, 'es');
  console.log('Transcripción:', text);
} catch (error) {
  console.error('Error:', error.message);
}
```

**Parámetros:**
- `audioBlob` (Blob) - Archivo de audio grabado
- `language` (string, default: `'es'`) - Código de idioma ISO

**Retorna:**
- `Promise<string>` - Texto transcrito

**Errores Manejados:**
- Audio vacío
- API key inválida
- Formato no soportado
- Limites de solicitudes
- Problemas de conectividad

#### `createAudioURL(audioBlob)`
Crea una URL para reproducir el audio.

```javascript
const audioURL = createAudioURL(audioBlob);
const audio = new Audio(audioURL);
audio.play();
```

#### `revokeAudioURL(audioURL)`
Libera la memoria de una URL de audio.

```javascript
revokeAudioURL(audioURL);
```

#### `formatTime(seconds)`
Convierte segundos a formato MM:SS.

```javascript
formatTime(65); // "1:05"
formatTime(5);  // "0:05"
```

## 🌍 Idiomas Soportados

Groq Whisper soporta muchos idiomas. Ejemplos comunes:

| Idioma | Código |
|--------|--------|
| Español | `es` o `es-ES` |
| Inglés | `en` o `en-US` |
| Francés | `fr` o `fr-FR` |
| Alemán | `de` o `de-DE` |
| Italiano | `it` o `it-IT` |
| Portugués | `pt` o `pt-BR` |
| Chino | `zh` o `zh-CN` |
| Japonés | `ja` o `ja-JP` |

## 🔐 Notas de Seguridad

⚠️ **API Key en el Cliente**  
Actualmente la API key está en el código. En producción, debes:

1. **Mover a variable de entorno:**
```bash
REACT_APP_GROQ_API_KEY=tu_api_key
```

2. **Crear un backend proxy:**
```javascript
// En tu servidor Node/Express
app.post('/api/transcribe', async (req, res) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  // Procesar la transcripción
});
```

3. **Usar en el frontend:**
```javascript
const response = await fetch('/api/transcribe', {
  method: 'POST',
  body: audioBlob,
});
const { text } = await response.json();
```

## 📋 Permisos Requeridos

El navegador solicitará permiso para acceder al micrófono:

1. **Chrome/Edge**: Permite automáticamente si confía en el sitio
2. **Firefox**: Requiere click para permitir
3. **Safari**: Requiere permiso en Configuración

## 🐛 Troubleshooting

### "El micrófono se desactiva rápido"
→ Usa `continuous: true` en la configuración de MediaRecorder

### "No reconoce mi idioma"
→ Especifica el código de idioma correcto en `transcribeAudio(blob, 'es')`

### "Error de permisos"
→ Verifica los permisos del micrófono en tu navegador

### "Error de API key"
→ Verifica que la API key sea válida y tenga créditos disponibles

### "Archivo de audio muy grande"
→ Groq tiene límites de tamaño. Reduce la duración de la grabación

## 📚 Ejemplos Avanzados

### Con Vista Previa de Audio

```jsx
const [audioURL, setAudioURL] = useState(null);

const handleAudioStop = () => {
  if (audioBlob) {
    const url = createAudioURL(audioBlob);
    setAudioURL(url);
  }
};

return (
  <>
    {audioURL && (
      <audio controls src={audioURL} />
    )}
  </>
);
```

### Con Indicador de Volumen

```jsx
// Necesitarías usar AudioContext para analizar el audio en vivo
const analyzeAudio = (stream) => {
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);
  
  // Obtener datos de frecuencia
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);
  
  return dataArray;
};
```

### Con Indicador de Volumen en Tiempo Real

```jsx
const [volume, setVolume] = useState(0);

useEffect(() => {
  if (isRecording && streamRef.current) {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(streamRef.current);
    source.connect(analyser);
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const updateVolume = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setVolume(average);
      requestAnimationFrame(updateVolume);
    };
    
    updateVolume();
  }
}, [isRecording]);
```

## 📞 Soporte

Si encuentras problemas, revisa:
1. La consola del navegador para errores específicos
2. Los documentos de [Groq API](https://console.groq.com/docs)
3. Los permisos del micrófono en tu navegador
4. La disponibilidad del servicio de Whisper en Groq
