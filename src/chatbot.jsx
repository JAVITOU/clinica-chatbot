import React, { useState, useEffect, useRef } from 'react';
import Groq from "groq-sdk";
import useSpeechRecognition from './hooks/useSpeechRecognition';
import useAudioRecording from './hooks/useAudioRecording';
import { transcribeAudio, createAudioURL, revokeAudioURL, formatTime } from './hooks/audioService';

const groq = new Groq({ 
  apiKey: process.env.REACT_APP_GROQ_API_KEY, 
  dangerouslyAllowBrowser: true 
});

const systemPrompt = `
Eres el Asistente Virtual de la Clínica San José. Tu objetivo es orientar a los pacientes de forma amable, profesional y eficiente. 

REGLAS CRÍTICAS DE SEGURIDAD:
- No eres un médico. Si el paciente describe síntomas de riesgo (dolor de pecho fuerte, asfixia, pérdida de conciencia), indica que debe llamar a EMERGENCIAS o acudir a URGENCIAS inmediatamente.
- Siempre usa un lenguaje empático pero profesional.

FORMATO DE RESPUESTAS - IMPORTANTE:
- Usa <b>texto</b> para enfatizar palabras clave (NO asteriscos)
- Usa <u>texto</u> para títulos de secciones
- Separa puntos con saltos de línea (\n)
- Usa formato limpio sin símbolos innecesarios
- Agrupa información por temas

CONOCIMIENTO DE LA CLÍNICA:
1. SÍNTOMAS Y ORIENTACIÓN:
   • Dolor de cabeza constante: Neurología o Medicina Interna
   • Molestias al respirar: Neumología o Urgencias si es agudo
   • Fiebre alta (+3 días): Medicina General o Pediatría
   • Alergias: Alergólogo
   • Problemas de piel: Dermatología

2. SERVICIOS Y HORARIOS:
   • Horario: Lunes a Viernes 7:00 AM a 8:00 PM. Sábados 8:00 AM a 2:00 PM
   • Urgencias: Disponibles 24/7
   • Citas: clínica.com/citas o 555-0123

3. SALUD MENTAL Y BIENESTAR:
   • Estrés/Ansiedad: Psicología y Psiquiatría disponibles
   • Nutrición: Especialistas en control de peso
   • Chequeos: Check-up Anual Preventivo con analítica completa

4. INFORMACIÓN ADMINISTRATIVA:
   • Registro: Identificación oficial + comprobante de domicilio
   • Seguros: AXA, MetLife, GNP
   • Historial: Solicitar en Archivo Clínico

INSTRUCCIONES DE RESPUESTA:
- Respuestas breves y organizadas
- Resalta conceptos importantes con <b>negritas</b>
- Agrupa por temas con títulos <u>subrayados</u>
- Usa saltos de línea para claridad
- Sin markdown, sin asteriscos, sin símbolos especiales
`;


// Archivo: src/Chatbot.jsx

// 1. Definición del componente de botones rápidos
const QuickActions = ({ onSelect }) => (
  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px', marginBottom: '10px' }}>
    <button onClick={() => onSelect("¿Cómo agendo una cita?")}>📅 Agendar Cita</button>
    <button onClick={() => onSelect("Me duele la cabeza, ¿a dónde voy?")}>🩺 Orientación Médica</button>
    <button onClick={() => onSelect("¿Qué seguros aceptan?")}>💳 Seguros</button>
  </div>
);


const Chatbot = () => {
  const [messages, setMessages] = useState([
  { role: "system", content: systemPrompt },
  { role: "assistant", content: "¡Hola! Soy el asistente de la Clínica San José. ¿Cómo puedo ayudarte con tu salud hoy?" }
]);

  // Hook para reconocimiento de voz
  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
  } = useSpeechRecognition();

  // Hook para grabación de audio
  const {
    isRecording,
    audioBlob,
    error: recordingError,
    isSupported: isRecordingSupported,
    recordingTime,
    startRecording,
    stopRecording,
    toggleRecording,
    discardRecording,
  } = useAudioRecording();

  const [isTranscribing, setIsTranscribing] = useState(false);

  /**
   * Transcribe automáticamente cuando se completa la grabación
   */
  useEffect(() => {
    if (audioBlob && !isTranscribing) {
      const autoTranscribe = async () => {
        setIsTranscribing(true);
        try {
          const transcribedText = await transcribeAudio(audioBlob, 'es');
          setInput(prev => {
            // Agregar el texto solo si hay contenido previo con espacio, o si está vacío
            if (prev.trim()) {
              return prev + ' ' + transcribedText;
            }
            return transcribedText;
          });
          // Descartar el blob de audio después de transcribir exitosamente
          discardRecording();
        } catch (err) {
          setError(err.message);
        } finally {
          setIsTranscribing(false);
        }
      };
      
      autoTranscribe();
    }
  }, [audioBlob, isTranscribing, discardRecording]);

  /**
   * Descarta el audio transcrito
   */
  const handleDiscardTranscription = () => {
    discardRecording();
  };

const resetChat = () => {
  setMessages([
    { role: "system", content: systemPrompt },
    { role: "assistant", content: "Chat reiniciado. ¿En qué más puedo ayudarte?" }
  ]);
};
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;

  /**
   * Maneja errores de la API de Groq con clasificación y reintentos
   */
  const handleApiError = (error, retryCount = 0) => {
    let errorMessage = "Error de conexión. Por favor, intenta nuevamente.";
    let shouldRetry = false;
    let retryDelay = 0;

    // Clasificar el tipo de error
    if (!navigator.onLine) {
      // Error de conexión de red
      errorMessage = "❌ Error de conexión: Verifica tu conexión a internet.";
    } else if (error.status === 401) {
      // Error de autenticación
      errorMessage = "❌ Error de autenticación: Verifica tu API key de Groq.";
    } else if (error.status === 429) {
      // Límite de tasa excedido
      errorMessage = "⏳ Límite de solicitudes alcanzado. Espera unos segundos...";
      shouldRetry = retryCount < MAX_RETRIES;
      retryDelay = Math.pow(2, retryCount) * 1000; // Backoff exponencial
    } else if (error.status === 500 || error.status === 502 || error.status === 503) {
      // Error del servidor
      errorMessage = "⚠️ Servidor de Groq no disponible. Intentando nuevamente...";
      shouldRetry = retryCount < MAX_RETRIES;
      retryDelay = Math.pow(2, retryCount) * 1500;
    } else if (error.code === 'ERR_NETWORK' || error.message?.includes('fetch')) {
      // Error de red
      errorMessage = "🌐 Error de red: No se puede conectar con el servidor.";
      shouldRetry = retryCount < MAX_RETRIES;
      retryDelay = Math.pow(2, retryCount) * 1000;
    } else if (error.message?.includes('timeout')) {
      // Timeout
      errorMessage = "⏱️ La solicitud tardó demasiado. Intentando nuevamente...";
      shouldRetry = retryCount < MAX_RETRIES;
      retryDelay = 2000;
    } else {
      // Error desconocido
      errorMessage = `❌ Error inesperado: ${error.message || 'Intenta de nuevo más tarde.'}`;
    }

    console.error(`[Error ${error.status || 'UNKNOWN'}]`, error);

    return { errorMessage, shouldRetry, retryDelay };
  };

  /**
   * Envía un mensaje con reintentos automáticos
   */
  const sendMessage = async (textOverride, retryCount = 0) => {
    const textToSend = textOverride || input; // Usa el texto del botón o lo que hay en el input
    if (!textToSend.trim()) return;

    // Solo crear el mensaje de usuario en el primer intento
    if (retryCount === 0) {
      const userMessage = { role: "user", content: textToSend };
      setMessages(prev => [...prev, userMessage]);
      setInput("");
      setError("");
    }

    setLoading(true);

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [...messages, { role: "user", content: textToSend }],
        model: "llama-3.3-70b-versatile",
      });

      const botResponse = { 
        role: "assistant", 
        content: chatCompletion.choices[0]?.message?.content 
      };
      setMessages(prev => [...prev, botResponse]);
      retryCountRef.current = 0; // Reset retry counter on success
    } catch (error) {
      const { errorMessage, shouldRetry, retryDelay } = handleApiError(error, retryCount);
      setError(errorMessage);

      // Agregar mensaje de error al chat
      const errorResponse = {
        role: "assistant",
        content: errorMessage,
        isError: true
      };
      setMessages(prev => [...prev, errorResponse]);

      // Reintentar si es necesario
      if (shouldRetry) {
        console.log(`Reintentando en ${retryDelay}ms (intento ${retryCount + 1}/${MAX_RETRIES})...`);
        setTimeout(() => {
          sendMessage(textToSend, retryCount + 1);
        }, retryDelay);
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const messagesEndRef = useRef(null);
  const lastTranscriptRef = useRef('');

  // Efecto para actualizar el input cuando termine el reconocimiento de voz
  useEffect(() => {
    // Solo procesar si:
    // 1. No está escuchando (se detuvo)
    // 2. Hay transcripción y es diferente a la anterior
    if (!isListening && transcript && transcript !== lastTranscriptRef.current) {
      setInput(prev => prev + ' ' + transcript);
      lastTranscriptRef.current = transcript;
    }
  }, [isListening, transcript]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div 
      className="chat-container"
      role="region"
      aria-label="Chat de asistencia médica"
      aria-describedby="chat-description"
    >
      <div id="chat-description" className="sr-only">
        Asistente virtual para consultas médicas. Escribe tu pregunta y presiona Enviar o Enter para obtener recomendaciones.
      </div>
      
      <div 
        className="chat-window"
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-label="Historial de conversación"
        aria-describedby="chat-history-info"
      >
        <div id="chat-history-info" className="sr-only">
          Los mensajes se muestran a continuación, con los tuyos alineados a la derecha y los del asistente a la izquierda.
        </div>
        
        {messages.filter(m => m.role !== 'system').map((m, i) => (
          <div 
            key={i} 
            className={`message ${m.role}${m.isError ? ' error-message' : ''}`}
            role="article"
            aria-label={`Mensaje ${m.role === 'user' ? 'tuyo' : m.isError ? 'de error del asistente' : 'del asistente'}`}
          >
            {m.role === 'assistant' && !m.isError ? (
              <div 
                className="message-content"
                dangerouslySetInnerHTML={{ __html: m.content }}
              />
            ) : (
              m.content
            )}
          </div>
        ))}
        
        {loading && (
          <div 
            className="loading"
            role="status"
            aria-live="polite"
            aria-label="El asistente está escribiendo un mensaje"
          >
            Escribiendo
          </div>
        )}
        
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>
      
      <div className="input-area" role="group" aria-labelledby="input-group-label">
        <label id="input-group-label" className="sr-only">
          Área de entrada de mensajes
        </label>
        
        <input 
          value={input + (isListening ? interimTranscript : '')} 
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
          placeholder="Ej: Me duele la cabeza..."
          disabled={loading}
          aria-label="Campo de entrada de mensaje"
          aria-describedby="input-help"
          role="textbox"
          aria-multiline="false"
        />
        
        <div id="input-help" className="sr-only">
          Escribe tu pregunta y presiona Enter o haz clic en Enviar. También puedes usar el micrófono para dictar. Máximo 1000 caracteres.
        </div>

        {speechError && (
          <div 
            className="speech-error" 
            role="alert"
            aria-live="assertive"
          >
            {speechError}
          </div>
        )}

        {recordingError && (
          <div 
            className="speech-error" 
            role="alert"
            aria-live="assertive"
          >
            {recordingError}
          </div>
        )}


        {/* Botones de grabación de audio (MediaRecorder) */}
        {audioBlob ? (
          <button
            disabled={true}
            title="Transcribiendo audio..."
            style={{
              background: '#51cf66',
              padding: '12px 16px',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'wait',
              fontSize: '14px',
              fontWeight: '600',
              opacity: 0.8,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            ⏳ Transcribiendo audio...
          </button>
        ) : (
          <button
            onClick={toggleRecording}
            disabled={loading || !isRecordingSupported}
            aria-label={isRecording ? 'Detener grabación' : 'Grabar audio'}
            aria-pressed={isRecording}
            title={!isRecordingSupported ? 'Grabación no soportada' : isRecording ? 'Grabando... Haz clic para detener' : 'Grabar audio para enviar a Groq'}
            style={{
              background: isRecording ? 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '12px 24px',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              animation: isRecording ? 'pulse 1.5s infinite' : 'none',
              boxShadow: isRecording ? '0 0 20px rgba(255, 107, 107, 0.6)' : '0 4px 15px rgba(102, 126, 234, 0.3)',
            }}
          >
            {isRecording ? `🔴 ${formatTime(recordingTime)}` : '⏺️ Grabar'}
          </button>
        )}
        
        {input.trim() && !audioBlob && (
          <button 
            onClick={() => setInput('')}
            disabled={loading}
            aria-label="Descartar texto grabado"
            title="Borra el texto grabado del input"
            style={{
              background: '#ff6b6b',
              padding: '12px 16px',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            ❌ Descartar
          </button>
        )}
        
        <button 
          onClick={() => sendMessage()} 
          disabled={loading}
          aria-label={loading ? 'Enviando mensaje, por favor espera' : 'Enviar mensaje'}
          aria-busy={loading}
          title={loading ? 'Esperando respuesta del servidor' : 'Haz clic para enviar tu mensaje'}
        >
          {loading ? 'Enviando...' : 'Enviar'}
        </button>

        <button 
          onClick={resetChat}
          disabled={loading}
          aria-label="Reiniciar la conversación"
          title="Inicia una nueva conversación"
          style={{ backgroundColor: '#ff9500' }}
        >
          🔄 Reiniciar
        </button>
      </div>

      <QuickActions onSelect={(text) => sendMessage(text)} />
    </div>
  );
};

export default Chatbot;