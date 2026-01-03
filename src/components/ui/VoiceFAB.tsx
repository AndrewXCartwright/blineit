import { useState, useRef, useEffect } from 'react';
import { Mic, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type FABState = 'idle' | 'listening' | 'processing' | 'response';

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const VoiceFAB = () => {
  const [state, setState] = useState<FABState>('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [showPulse, setShowPulse] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
    }
    
    // Stop pulse after first interaction
    const hasInteracted = localStorage.getItem('voiceFabInteracted');
    if (hasInteracted) {
      setShowPulse(false);
    }
  }, []);

  const startListening = () => {
    setState('listening');
    setShowPulse(false);
    localStorage.setItem('voiceFabInteracted', 'true');
    
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setState('idle');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setTranscript(transcriptText);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setResponse('Microphone access denied. Please enable microphone permissions in your browser settings.');
        setState('response');
      } else {
        setState('idle');
      }
    };

    recognition.onend = () => {
      // Only process if we have a transcript and we're still in listening state
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    if (transcript) {
      processQuery(transcript);
    } else {
      setState('idle');
    }
  };

  const processQuery = async (query: string) => {
    setState('processing');
    
    // TODO: Connect to your AI backend
    // For now, simulate a response
    setTimeout(() => {
      setResponse(`You asked about "${query}". This is where the AI response will appear. Connect to your AI backend to get real answers about properties, investments, predictions, and more.`);
      setState('response');
    }, 1500);
  };

  const reset = () => {
    recognitionRef.current?.stop();
    setState('idle');
    setTranscript('');
    setResponse('');
  };

  const askAnother = () => {
    setTranscript('');
    setResponse('');
    startListening();
  };

  if (!isSupported && state === 'idle') {
    return (
      <button
        onClick={() => {
          setResponse('Voice input is not supported in this browser. Please try Chrome, Safari, or Edge.');
          setState('response');
        }}
        className={cn(
          "fixed bottom-[calc(10rem+env(safe-area-inset-bottom))] right-5 z-50",
          "w-14 h-14 rounded-full",
          "bg-muted text-muted-foreground",
          "flex items-center justify-center",
          "shadow-lg",
          "transition-transform duration-200",
          "hover:scale-110"
        )}
        aria-label="Voice assistant (not supported)"
      >
        <Mic className="w-6 h-6" />
      </button>
    );
  }

  if (state === 'idle') {
    return (
      <button
        onClick={startListening}
        className={cn(
          "fixed bottom-[calc(10rem+env(safe-area-inset-bottom))] right-5 z-50",
          "w-14 h-14 rounded-full",
          "bg-[#00d4aa] text-white",
          "flex items-center justify-center",
          "shadow-[0_4px_12px_rgba(0,212,170,0.4)]",
          "transition-all duration-200",
          "hover:scale-110 hover:shadow-[0_6px_16px_rgba(0,212,170,0.5)]",
          "active:scale-95",
          showPulse && "voice-fab-pulse"
        )}
        aria-label="Start voice assistant"
      >
        <Mic className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-[calc(10rem+env(safe-area-inset-bottom))] right-5 z-50 w-[280px] max-w-[calc(100vw-40px)]">
      <div className="bg-card border border-border rounded-3xl p-4 shadow-xl animate-scale-in">
        {/* Close button */}
        <button
          onClick={reset}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors"
          aria-label="Close voice assistant"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {state === 'listening' && (
          <div className="flex flex-col items-center pt-2">
            {/* Waveform animation */}
            <div className="flex items-center justify-center gap-1 h-12 mb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-[#00d4aa] rounded-full voice-wave"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    height: '20px'
                  }}
                />
              ))}
            </div>

            <p className="text-sm text-muted-foreground mb-2">Listening...</p>
            
            {transcript && (
              <p className="text-sm text-foreground text-center mb-3 px-2 max-h-20 overflow-y-auto">
                {transcript}
              </p>
            )}
            
            <button
              onClick={stopListening}
              className="px-6 py-2 bg-[#00d4aa] text-black rounded-full text-sm font-semibold hover:bg-[#00d4aa]/90 transition-colors"
            >
              Done
            </button>
          </div>
        )}

        {state === 'processing' && (
          <div className="flex flex-col items-center py-6">
            <Loader2 className="w-8 h-8 text-[#00d4aa] animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">Thinking...</p>
          </div>
        )}

        {state === 'response' && (
          <div className="flex flex-col pt-2">
            {transcript && (
              <>
                <p className="text-xs text-muted-foreground mb-1">You asked:</p>
                <p className="text-sm text-foreground mb-3 italic">"{transcript}"</p>
              </>
            )}
            
            <div className="max-h-40 overflow-y-auto mb-4 pr-1">
              <p className="text-sm text-foreground leading-relaxed">{response}</p>
            </div>
            
            {isSupported && (
              <button
                onClick={askAnother}
                className="w-full px-4 py-2.5 bg-[#00d4aa] text-black rounded-full text-sm font-semibold hover:bg-[#00d4aa]/90 transition-colors flex items-center justify-center gap-2"
              >
                <Mic className="w-4 h-4" />
                Ask Another
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceFAB;
