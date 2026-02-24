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
Eres el Asistente Virtual de la Clínica UDB. Tu objetivo es orientar a los pacientes de forma amable, profesional y eficiente. 

REGLAS CRÍTICAS DE SEGURIDAD:
- No eres un médico. Si el paciente describe síntomas de riesgo (dolor de pecho fuerte, asfixia, pérdida de conciencia), indica que debe llamar a EMERGENCIAS o acudir a URGENCIAS inmediatamente.
- Siempre usa un lenguaje empático pero profesional.

FORMATO DE RESPUESTAS - CRÍTICO:
- ¡¡¡ NUNCA BAJO NINGUNA CIRCUNSTANCIA USES ASTERISCOS *, **, O SÍMBOLOS * !!!
- ¡¡¡ NUNCA USES VIÑETAS CON *, •, -, O SÍMBOLOS !!!
- Solo usa <b>texto</b> para enfatizar palabras clave
- Usa <u>texto</u> para títulos de secciones
- Para listas, usa: <ul><li>elemento 1</li><li>elemento 2</li></ul>
- NUNCA hagas saltos de línea en medio de líneas o frases
- NUNCA separes palabras con saltos (no escribas "en la\nNeurología", escribe "en la Neurología")
- Escribe TODO el contenido continuo sin saltos raros
- NO hagas saltos de línea antes de: o, y, la, el, los, las, un, una, unos, unas, de, a, que, etc.
- Estructura: 1 párrafo de empatía + recomendación, luego lista HTML de acciones si es necesario

ESTILO DE RESPUESTA:
- Respuestas CONCISAS pero completas (2-3 párrafos máximo)
- Usa LISTAS HTML abundantemente para hacer el texto más organizado
- Separa con títulos <u>subrayados</u> las secciones principales
- Un párrafo de empatía/contexto
- Un párrafo de recomendación principal
- Luego una lista HTML con: "Qué hacer:", "Consejos:", "Síntomas de alarma:", etc.
- NUNCA escribas mucho texto corrido, divide siempre en listas y secciones
- Resalta SOLO los hechos clave que el paciente necesita saber
- Estructura clara y fácil de leer
- Evita información redundante o abrumadora
- Agrupa la información por categorías claras
- Que sea accionable: qué hacer ahora, qué especialista, cuándo ir

CONOCIMIENTO DE LA CLÍNICA:
1. SÍNTOMAS Y ORIENTACIÓN:
   <ul><li>Dolor de cabeza constante: Neurología o Medicina Interna</li><li>Molestias al respirar: Neumología o Urgencias si es agudo</li><li>Fiebre alta (+3 días): Medicina General o Pediatría</li><li>Diarrea: Medicina General o Gastroenterología</li><li>Alergias: Alergólogo</li><li>Problemas de piel: Dermatología</li></ul>

2. SERVICIOS Y HORARIOS:
   <ul><li>Horario: Lunes a Viernes 7:00 AM a 8:00 PM. Sábados 8:00 AM a 2:00 PM</li><li>Urgencias: Disponibles 24/7</li><li>Citas: clínica.com/citas o 2200-1000</li></ul>

3. SALUD MENTAL Y BIENESTAR:
   <ul><li>Estrés/Ansiedad: Psicología y Psiquiatría disponibles</li><li>Nutrición: Especialistas en control de peso</li><li>Chequeos: Check-up Anual Preventivo con analítica completa</li></ul>

4. INFORMACIÓN ADMINISTRATIVA:
   <ul><li>Registro: Identificación oficial + comprobante de domicilio</li><li>Seguros: ISSS, Autofiscal, Seguros Cuscatlán</li><li>Historial: Solicitar en Archivo Clínico</li></ul>

INSTRUCCIONES FINALES:
- Dá respuestas CONCISAS y bien estructuradas
- SIEMPRE usa este formato:
  1. Primer párrafo: Empatía + especialista recomendado
  2. Segundo párrafo: Cómo hacer una cita
  3. Sección: <u>Qué hacer:</u> con <ul><li>items</li></ul>
  4. Opcional: <u>Consejos:</u> o <u>Síntomas de alarma:</u> con listas
- Resalta conceptos importantes con <b>negritas</b>
- NUNCA escribas párrafos largos corridos
- Divide SIEMPRE con títulos e listas HTML
- Usa listas HTML para hacer el texto visual y organizado
- CERO asteriscos, CERO viñetas con símbolos
- Que el usuario entienda de inmediato qué hacer
`;


// Componente de menú desplegable para Orientación Médica
const MedicalOrientationMenu = ({ onSelect, isOpen, onToggle }) => {
  const symptoms = [
    "Me duele la cabeza",
    "Tengo diarrea",
    "Tengo fiebre",
    "Tengo problemas respiratorios",
    "Tengo alergias",
    "Tengo problemas de piel",
    "Tengo dolor abdominal"
  ];

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        onClick={onToggle}
        style={{
          padding: '10px 16px',
          backgroundColor: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
        }}
      >
        🩺 Orientación Médica {isOpen ? '▲' : '▼'}
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: 0,
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          marginBottom: '8px',
          minWidth: '240px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 100,
          maxHeight: '300px',
          overflowY: 'auto',
        }}>
          {symptoms.map((symptom, index) => (
            <button
              key={index}
              onClick={() => {
                onSelect(symptom);
                onToggle();
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                backgroundColor: index === 0 ? '#f5f5f5' : 'white',
                color: '#333',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                borderBottom: index < symptoms.length - 1 ? '1px solid #f0f0f0' : 'none',
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9f9f9'}
              onMouseLeave={(e) => e.target.style.backgroundColor = index === 0 ? '#f5f5f5' : 'white'}
            >
              {symptom}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Componente de botones rápidos mejorado
const QuickActions = ({ onSelect, onMedicalMenuToggle, isMedicalMenuOpen }) => (
  <div style={{ 
    display: 'flex', 
    gap: '10px', 
    flexWrap: 'wrap', 
    marginTop: '15px', 
    marginBottom: '15px',
    justifyContent: 'center',
  }}>
    <button 
      onClick={() => onSelect("¿Cómo agendo una cita?")}
      style={{
        padding: '10px 16px',
        backgroundColor: '#51cf66',
        color: 'white',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(81, 207, 102, 0.3)',
      }}
      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
    >
      📅 Agendar Cita
    </button>
    
    <MedicalOrientationMenu 
      onSelect={onSelect} 
      isOpen={isMedicalMenuOpen}
      onToggle={onMedicalMenuToggle}
    />
    
    <button 
      onClick={() => onSelect("¿Qué seguros aceptan?")}
      style={{
        padding: '10px 16px',
        backgroundColor: '#ff9500',
        color: 'white',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(255, 149, 0, 0.3)',
      }}
      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
    >
      💳 Seguros
    </button>
  </div>
);


const Chatbot = () => {
  const [messages, setMessages] = useState([
  { role: "system", content: systemPrompt },
  { role: "assistant", content: "¡Hola! Soy el asistente de la Clínica UDB. ¿Cómo puedo ayudarte con tu salud hoy?" }
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
  const [isMedicalMenuOpen, setIsMedicalMenuOpen] = useState(false);

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
      // Filtrar mensajes de error para evitar contaminar la conversación con Groq
      const messagesForAPI = messages.filter(m => !m.isError);
      
      const chatCompletion = await groq.chat.completions.create({
        messages: [...messagesForAPI, { role: "user", content: textToSend }],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 1024,
      });

      const rawContent = chatCompletion.choices[0]?.message?.content;
      // Limpiar y formatear el contenido - ELIMINAR ASTERISCOS AGRESIVAMENTE
      let formattedContent = rawContent
        .trim()
        .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')  // Convertir ** a <b>
        .replace(/\*(.+?)\*/g, '<b>$1</b>')      // Convertir * a <b>
        .replace(/^\s*\*\s+/gm, '')  // Eliminar * al inicio de línea (viñetas)
        .replace(/\n\s*\*\s+/g, '\n')  // Eliminar * en líneas nuevas
        .replace(/([^\w\s])\s*\*\s+([A-Za-z])/g, '$1 $2')  // Asteriscos sueltos
        .replace(/\*+/g, '')  // Eliminar cualquier asterisco restante
        // Arreglar títulos separados de dos puntos
        .replace(/([A-Za-z\s]+)\s*\n\s*:\s*/g, '$1: ')  // "Línea de citas\n:" → "Línea de citas: "
        // Arreglar saltos de línea después de palabras pequeñas (o, y, la, el, etc.)
        .replace(/\s+(o|y|la|el|los|las|un|una|unos|unas|de|a|que|en|con|por|para|su)\s*\n\s*/gi, ' $1 ')
        .replace(/([.,:;!?])\s*\n+\s*([a-z])/gi, '$1 $2')  // Arreglar puntuación seguida de salto
        // Arreglar números seguidos de saltos de línea
        .replace(/(\d+\.)\s*\n\s*/g, '$1 ')  // "1.\n" → "1. "
        .replace(/\n\n+/g, '<br><br>')  // Saltos múltiples a doble <br>
        .replace(/\n/g, ' ')  // Saltos individuales a espacio
        .replace(/\s{2,}/g, ' ');  // Colapsar espacios múltiples a uno solo
      
      const botResponse = { 
        role: "assistant", 
        content: formattedContent 
      };
      
      // Remover el último mensaje de error si existe (no fue un error definitivo)
      setMessages(prev => {
        const withoutLastError = prev[prev.length - 1]?.isError ? prev.slice(0, -1) : prev;
        return [...withoutLastError, botResponse];
      });
      
      retryCountRef.current = 0; // Reset retry counter on success
    } catch (error) {
      const { errorMessage, shouldRetry, retryDelay } = handleApiError(error, retryCount);
      setError(errorMessage);

      // Agregar mensaje de error al chat solo si NO va a reintentarse
      if (!shouldRetry) {
        const errorResponse = {
          role: "assistant",
          content: errorMessage,
          isError: true
        };
        setMessages(prev => [...prev, errorResponse]);
      }

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
        
        <div className="input-row">
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
          
          <button 
            onClick={() => sendMessage()} 
            disabled={loading}
            aria-label={loading ? 'Enviando mensaje, por favor espera' : 'Enviar mensaje'}
            aria-busy={loading}
            title={loading ? 'Esperando respuesta del servidor' : 'Haz clic para enviar tu mensaje'}
          >
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
        </div>

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

        <div className="button-row">
          {/* Botones de grabación de audio (MediaRecorder) */}
          {audioBlob ? (
            <button
              disabled={true}
              title="Transcribiendo audio..."
              style={{
                background: '#51cf66',
                padding: '10px 14px',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: 'wait',
                fontSize: '12px',
                fontWeight: '600',
                opacity: 0.8,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              ⏳ Grabando...
            </button>
          ) : (
            <button
              onClick={toggleRecording}
              disabled={loading || !isRecordingSupported}
              aria-label={isRecording ? 'Detener grabación' : 'Grabar audio'}
              aria-pressed={isRecording}
              title={!isRecordingSupported ? 'Grabación no soportada' : isRecording ? 'Grabando... Haz clic para detener' : 'Grabar audio'}
              style={{
                background: isRecording ? 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '10px 14px',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '12px',
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
              aria-label="Descartar texto"
              title="Borra el texto del input"
              style={{
                background: '#ff6b6b',
                padding: '10px 14px',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              ❌ Descartar
            </button>
          )}

          <button 
            onClick={resetChat}
            disabled={loading}
            aria-label="Reiniciar la conversación"
            title="Inicia una nueva conversación"
            style={{ 
              backgroundColor: '#ff9500',
              padding: '10px 14px',
              fontSize: '12px',
            }}
          >
            🔄 Reiniciar
          </button>
        </div>
      </div>

      <QuickActions 
        onSelect={(text) => {
          sendMessage(text);
          setIsMedicalMenuOpen(false);
        }} 
        onMedicalMenuToggle={() => setIsMedicalMenuOpen(!isMedicalMenuOpen)}
        isMedicalMenuOpen={isMedicalMenuOpen}
      />
    </div>
  );
};

export default Chatbot;