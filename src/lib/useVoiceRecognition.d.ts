type VoiceState = 'idle' | 'listening' | 'error' | 'unsupported';

interface UseVoiceOptions {
    onTranscript?: (text: string, isFinal: boolean) => void;
    onCommand?: (command: string, args: string) => void;
    lang?: string;
}

declare const VOICE_COMMANDS: Record<string, {
    keywords: string[];
    description: string;
}>;

export declare function useVoiceRecognition({ onTranscript, onCommand, lang }?: UseVoiceOptions): {
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

export { VOICE_COMMANDS };