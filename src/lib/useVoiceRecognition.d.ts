export type VoiceState = 'idle' | 'listening' | 'error' | 'unsupported';

export interface UseVoiceOptions {
    onTranscript?: (text: string, isFinal: boolean) => void;
    onCommand?: (command: string, args: string) => void;
    lang?: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type SpeechRecognition = any;
type SpeechRecognitionEvent = any;
type SpeechRecognitionErrorEvent = any;

export declare const VOICE_COMMANDS: Record<string, {
    keywords: string[];
    description: string;
}>;

export declare function useVoiceRecognition(options?: UseVoiceOptions): {
    state: VoiceState;
    interimText: string;
    isSupported: boolean;
    start: () => void;
    stop: () => void;
    toggle: () => void;
    commands: Record<string, {
        keywords: string[];
        description: string;
    }>;
};