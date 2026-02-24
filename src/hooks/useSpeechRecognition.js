import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook personalizado para usar la API de Speech Recognition del navegador
 * Permite convertir voz a texto para interactuar con el chatbot
 * 
 * @returns {Object} Objeto con estados y funciones para el reconocimiento de voz
 */
const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);

  // Inicializar la API de reconocimiento de voz
  useEffect(() => {
    // Verificar soporte del navegador
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Tu navegador no soporta reconocimiento de voz. Usa Chrome, Edge o Safari.');
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition();

    // Configurar propiedades del reconocimiento
    recognition.continuous = true; // Continuar escuchando incluso con pausas
    recognition.interimResults = true; // Mostrar resultados mientras habla
    recognition.lang = 'es-ES'; // Español de España (cambiar según necesidad)
    recognition.maxAlternatives = 1; // Solo la mejor opción

    // Event: Cuando se detecta sonido
    recognition.onstart = () => {
      isListeningRef.current = true;
      setIsListening(true);
      setError(null);
      setTranscript('');
      setInterimTranscript('');
    };

    // Event: Resultados del reconocimiento
    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          // Resultado final (con mayor confianza)
          final += transcript + ' ';
        } else {
          // Resultado provisional (mientras el usuario está hablando)
          interim += transcript;
        }
      }

      setInterimTranscript(interim);
      setTranscript(prev => prev + final);
    };

    // Event: Error de reconocimiento
    recognition.onerror = (event) => {
      let errorMessage = 'Error en el reconocimiento de voz.';

      switch (event.error) {
        case 'no-speech':
          errorMessage = '⏱️ No se detectó sonido. Intenta de nuevo.';
          break;
        case 'audio-capture':
          errorMessage = '🎤 No se detectó micrófono. Verifica los permisos.';
          break;
        case 'network':
          errorMessage = '🌐 Error de red. Intenta de nuevo.';
          break;
        case 'aborted':
          errorMessage = '⏸️ Reconocimiento cancelado.';
          break;
        case 'service-not-available':
          errorMessage = '⚠️ El servicio de reconocimiento no está disponible.';
          break;
        default:
          errorMessage = `❌ Error: ${event.error}`;
      }

      setError(errorMessage);
      isListeningRef.current = false;
      setIsListening(false);
    };

    // Event: Fin del reconocimiento
    recognition.onend = () => {
      isListeningRef.current = false;
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  /**
   * Inicia el reconocimiento de voz
   */
  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('El reconocimiento de voz no está soportado en tu navegador.');
      return;
    }

    if (recognitionRef.current) {
      try {
        setTranscript('');
        setInterimTranscript('');
        setError(null);
        recognitionRef.current.start();
      } catch (err) {
        // Si ya está escuchando, el error es normal
        console.log('Reconocimiento ya iniciado');
      }
    }
  }, [isSupported]);

  /**
   * Detiene el reconocimiento de voz
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Si ya se detuvo, el error es normal
        console.log('Reconocimiento ya detenido');
      }
    }
  }, []);

  /**
   * Alterna entre iniciar y detener
   */
  const toggleListening = useCallback(() => {
    if (isListeningRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }, [startListening, stopListening]);

  /**
   * Limpia el transcript
   */
  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  /**
   * Cambia el idioma del reconocimiento
   */
  const setLanguage = useCallback((lang) => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang;
    }
  }, []);

  return {
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
  };
};

export default useSpeechRecognition;
