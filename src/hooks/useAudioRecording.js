import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook personalizado para grabar audio con MediaRecorder
 * Permite grabar audio del micrófono y enviarlo a Groq para transcripción
 * 
 * @returns {Object} Estados y funciones para grabación de audio
 */
const useAudioRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  // Verificar soporte de MediaRecorder
  useEffect(() => {
    const isMediaRecorderSupported = 
      navigator.mediaDevices && 
      navigator.mediaDevices.getUserMedia &&
      window.MediaRecorder;
    
    setIsSupported(isMediaRecorderSupported ? true : false);
    
    if (!isMediaRecorderSupported) {
      setError('Tu navegador no soporta grabación de audio. Usa Chrome, Edge o Firefox.');
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  /**
   * Inicia la grabación de audio
   */
  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('Grabación de audio no soportada en tu navegador.');
      return;
    }

    try {
      setError(null);
      audioChunksRef.current = [];
      setRecordingTime(0);
      setAudioBlob(null);

      // Solicitar acceso al micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      streamRef.current = stream;

      // Crear MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus' // Formato compatible con Groq
      });

      // Guardar chunks de audio
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Cuando termina la grabación
      mediaRecorder.onstop = () => {
        // Crear blob con los chunks grabados
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        
        // Detener el stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.onerror = (event) => {
        let errorMsg = 'Error en la grabación de audio.';
        
        switch (event.error) {
          case 'NotAllowedError':
            errorMsg = '🎤 Permiso denegado para acceder al micrófono.';
            break;
          case 'NotFoundError':
            errorMsg = '🎧 No se encontró un micrófono en tu dispositivo.';
            break;
          case 'NotSupportedError':
            errorMsg = '⚠️ Formato de audio no soportado.';
            break;
          case 'InvalidStateError':
            errorMsg = '⏸️ Error de estado en la grabación.';
            break;
          default:
            errorMsg = `❌ Error: ${event.error}`;
        }
        
        setError(errorMsg);
        setIsRecording(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      // Timer para mostrar tiempo de grabación
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds++;
        setRecordingTime(seconds);
      }, 1000);

    } catch (err) {
      let errorMsg = 'Error al acceder al micrófono.';
      
      if (err.name === 'NotAllowedError') {
        errorMsg = '🔒 Permiso denegado. Permite el acceso al micrófono en tu navegador.';
      } else if (err.name === 'NotFoundError') {
        errorMsg = '🎧 No hay micrófono disponible.';
      } else if (err.name === 'NotReadableError') {
        errorMsg = '❌ El micrófono está siendo usado por otra aplicación.';
      }
      
      setError(errorMsg);
    }
  }, [isSupported]);

  /**
   * Detiene la grabación de audio
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Detener stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  }, [isRecording]);

  /**
   * Descarta la grabación actual
   */
  const discardRecording = useCallback(() => {
    setAudioBlob(null);
    setRecordingTime(0);
    audioChunksRef.current = [];
  }, []);

  /**
   * Alterna entre grabar y detener
   */
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    audioBlob,
    error,
    isSupported,
    recordingTime,
    startRecording,
    stopRecording,
    toggleRecording,
    discardRecording,
  };
};

export default useAudioRecording;
