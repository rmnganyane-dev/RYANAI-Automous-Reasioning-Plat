import { useState, useRef, useCallback, useEffect } from 'react';

export type VoiceState = 'idle' | 'listening' | 'error' | 'unsupported';

export interface UseVoiceOptions {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onCommand?: (command: string, args: string) => void;
  lang?: string;
}

export const VOICE_COMMANDS: Record<string, { keywords: string[]; description: string }> = {
  new_thread: { keywords: ['new thread', 'new conversation', 'start new'], description: 'Create a new conversation thread' },
  send: { keywords: ['send message', 'send', 'submit'], description: 'Send the current message' },
  clear: { keywords: ['clear input', 'clear', 'reset'], description: 'Clear the input field' },
  export: { keywords: ['export thread', 'export', 'download'], description: 'Export the current thread as Markdown' },
  switch_gemini: { keywords: ['switch to gemini', 'use gemini', 'switch gemini'], description: 'Switch to Gemini 3.1 Pro' },
  switch_claude: { keywords: ['switch to claude', 'use claude', 'switch claude'], description: 'Switch to Claude Sonnet 4.6' },
  switch_gpt: { keywords: ['switch to gpt', 'use gpt', 'switch gpt'], description: 'Switch to GPT-5.4' },
  open_memory: { keywords: ['open memory', 'memory vault', 'show memory'], description: 'Open the Memory Vault' },
  open_about: { keywords: ['open about', 'about ryanai', 'show about'], description: 'Open the About panel' },
  open_github: { keywords: ['open github', 'github', 'connect github'], description: 'Open GitHub integration' },
  stop: { keywords: ['stop listening', 'stop voice', 'cancel voice'], description: 'Stop voice recognition' },
};

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEventData {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorData {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventData) => void) | null;
  onerror: ((event: SpeechRecognitionErrorData) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export function useVoiceRecognition({ onTranscript, onCommand, lang = 'en-US' }: UseVoiceOptions = {}) {
  const [state, setState] = useState<VoiceState>('idle');
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const shouldRestartRef = useRef(false);

  const getConstructor = () => {
    if (typeof window === 'undefined') return null;
    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    return win.SpeechRecognition || win.webkitSpeechRecognition || null;
  };

  const isSupported = typeof window !== 'undefined' && !!getConstructor();

  const detectCommand = useCallback((text: string): { command: string; args: string } | null => {
    const lower = text.toLowerCase().trim();
    for (const [cmd, def] of Object.entries(VOICE_COMMANDS)) {
      for (const kw of def.keywords) {
        if (lower.startsWith(kw)) {
          const args = lower.slice(kw.length).trim();
          return { command: cmd, args };
        }
      }
    }
    return null;
  }, []);

  const initRecognition = useCallback(() => {
    const Ctor = getConstructor();
    if (!Ctor) {
      setState('unsupported');
      return null;
    }
    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => setState('listening');

    rec.onresult = (event: SpeechRecognitionEventData) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result && result[0]) {
          if (result.isFinal) {
            final += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }
      }
      if (interim) setInterimText(interim);
      if (final) {
        setInterimText('');
        onTranscript?.(final, true);
        const cmd = detectCommand(final);
        if (cmd) {
          onCommand?.(cmd.command, cmd.args);
        }
      } else if (interim) {
        onTranscript?.(interim, false);
      }
    };

    rec.onerror = (event: SpeechRecognitionErrorData) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }
      setState('error');
    };

    rec.onend = () => {
      setInterimText('');
      if (shouldRestartRef.current) {
        try {
          rec.start();
        } catch {
          setState('idle');
        }
      } else {
        setState('idle');
      }
    };

    return rec;
  }, [lang, onTranscript, onCommand, detectCommand]);

  const start = useCallback(() => {
    if (!recognitionRef.current) {
      recognitionRef.current = initRecognition();
    }
    if (!recognitionRef.current) return;
    shouldRestartRef.current = false;
    try {
      recognitionRef.current.start();
    } catch {
      // already started
    }
  }, [initRecognition]);

  const stop = useCallback(() => {
    shouldRestartRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // noop
      }
    }
    setState('idle');
    setInterimText('');
  }, []);

  const toggle = useCallback(() => {
    if (state === 'listening') {
      stop();
    } else {
      start();
    }
  }, [state, start, stop]);

  useEffect(() => {
    return () => {
      shouldRestartRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // noop
        }
      }
    };
  }, []);

  return {
    state,
    interimText,
    isSupported,
    start,
    stop,
    toggle,
    commands: VOICE_COMMANDS,
  };
}