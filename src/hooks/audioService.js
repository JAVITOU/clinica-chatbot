import Groq from "groq-sdk";

/**
 * Configura la instancia de Groq
 * IMPORTANTE: En producción, usa variables de entorno
 */
const groq = new Groq({ 
  apiKey: process.env.REACT_APP_GROQ_API_KEY, 
  dangerouslyAllowBrowser: true 
});

/**
 * Transcribe un archivo de audio usando la API de Groq Whisper
 * 
 * @param {Blob} audioBlob - El blob de audio grabado
 * @param {string} language - Código de idioma (ej: 'es' para español)
 * @returns {Promise<string>} - El texto transcrito
 * @throws {Error} - Si hay error en la transcripción
 */
export const transcribeAudio = async (audioBlob, language = 'es') => {
  try {
    if (!audioBlob || audioBlob.size === 0) {
      throw new Error('El archivo de audio está vacío.');
    }

    // Crear un File del Blob (Groq requiere un File)
    const audioFile = new File([audioBlob], 'audio.webm', { 
      type: 'audio/webm' 
    });

    console.log('📤 Enviando audio a Groq...', {
      size: `${(audioBlob.size / 1024).toFixed(2)} KB`,
      type: audioBlob.type,
      language
    });

    // Llamar a la API de transcripción de Groq
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3-turbo", // Modelo rápido de Groq
      language: language, // Especificar el idioma para mejor precisión
      temperature: 0.2, // Baja temperatura para mejor precisión
    });

    console.log('✅ Transcripción completada:', transcription.text);
    
    return transcription.text;

  } catch (error) {
    console.error('❌ Error en transcripción de audio:', error);
    
    let errorMessage = 'Error al transcribir audio.';

    if (error.message?.includes('empty')) {
      errorMessage = '⚠️ El archivo de audio está vacío. Intenta grabar nuevamente.';
    } else if (error.message?.includes('API')) {
      errorMessage = '🌐 Error de conexión con la API de Groq.';
    } else if (error.status === 429) {
      errorMessage = '⏳ Límite de solicitudes alcanzado. Intenta en unos segundos.';
    } else if (error.status === 401) {
      errorMessage = '❌ API key inválida o expirada.';
    } else if (error.status === 400) {
      errorMessage = '❌ Formato de audio no soportado. Usa WAV, MP3 o WebM.';
    } else if (error.status >= 500) {
      errorMessage = '⚠️ Servidor de Groq no disponible. Intenta más tarde.';
    } else {
      errorMessage = `❌ Error: ${error.message || 'Error desconocido'}`;
    }

    throw new Error(errorMessage);
  }
};

/**
 * Convierte un Blob de audio a una URL para reproducción
 * Útil para preview antes de enviar
 * 
 * @param {Blob} audioBlob - El blob de audio
 * @returns {string} - URL para reproducir el audio
 */
export const createAudioURL = (audioBlob) => {
  return URL.createObjectURL(audioBlob);
};

/**
 * Libera la URL del audio cuando ya no se necesita
 * 
 * @param {string} audioURL - La URL a liberar
 */
export const revokeAudioURL = (audioURL) => {
  if (audioURL) {
    URL.revokeObjectURL(audioURL);
  }
};

/**
 * Convierte segundos a formato MM:SS
 * 
 * @param {number} seconds - Número de segundos
 * @returns {string} - Tiempo formateado
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
