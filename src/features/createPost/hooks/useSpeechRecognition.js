// NEW: web speech recognition hook — Feature 4
import { useState, useRef, useCallback } from 'react';

/**
 * Wraps the browser Web Speech API.
 * Returns: { supported, listening, transcript, interim, start(lang), stop, error }
 */
export const useSpeechRecognition = () => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const onEndCallbackRef = useRef(null);

  const SpeechRecognition =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  const supported = Boolean(SpeechRecognition);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const start = useCallback(
    (lang = 'hi-IN', onEnd) => {
      if (!SpeechRecognition) return;
      setTranscript('');
      setInterim('');
      setError(null);
      onEndCallbackRef.current = onEnd;

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang;
      recognitionRef.current = recognition;

      recognition.onstart = () => setListening(true);

      recognition.onresult = (e) => {
        let finalText = '';
        let interimText = '';
        for (let i = 0; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) {
            finalText += res[0].transcript;
          } else {
            interimText += res[0].transcript;
          }
        }
        if (finalText) setTranscript((prev) => prev + finalText);
        setInterim(interimText);
      };

      recognition.onerror = (e) => {
        let msg = e.error;
        if (e.error === 'not-allowed') msg = 'Microphone permission denied';
        else if (e.error === 'no-speech') msg = 'No speech detected';
        else if (e.error === 'network') msg = 'Network error during recognition';
        setError(msg);
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
        setInterim('');
        if (onEndCallbackRef.current) onEndCallbackRef.current();
      };

      recognition.start();
    },
    [SpeechRecognition]
  );

  return { supported, listening, transcript, interim, start, stop, error };
};

export default useSpeechRecognition;
