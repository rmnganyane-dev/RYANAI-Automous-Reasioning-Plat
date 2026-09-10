import { useState, useRef, useCallback, useEffect } from 'react';
var VOICE_COMMANDS = {
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
export function useVoiceRecognition(_a) {
    var _b = _a === void 0 ? {} : _a, onTranscript = _b.onTranscript, onCommand = _b.onCommand, _c = _b.lang, lang = _c === void 0 ? 'en-US' : _c;
    var _d = useState('idle'), state = _d[0], setState = _d[1];
    var _e = useState(''), interimText = _e[0], setInterimText = _e[1];
    var recognitionRef = useRef(null);
    var shouldRestartRef = useRef(false);
    var isSupported = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    var detectCommand = useCallback(function (text) {
        var lower = text.toLowerCase().trim();
        for (var _i = 0, _a = Object.entries(VOICE_COMMANDS); _i < _a.length; _i++) {
            var _b = _a[_i], cmd = _b[0], def = _b[1];
            for (var _c = 0, _d = def.keywords; _c < _d.length; _c++) {
                var kw = _d[_c];
                if (lower.startsWith(kw)) {
                    var args = lower.slice(kw.length).trim();
                    return { command: cmd, args: args };
                }
            }
        }
        return null;
    }, []);
    var initRecognition = useCallback(function () {
        if (!isSupported) {
            setState('unsupported');
            return null;
        }
        var Ctor = (window.SpeechRecognition || window.webkitSpeechRecognition);
        var rec = new Ctor();
        rec.lang = lang;
        rec.continuous = false;
        rec.interimResults = true;
        rec.maxAlternatives = 1;
        rec.onstart = function () { return setState('listening'); };
        rec.onresult = function (event) {
            var interim = '';
            var final = '';
            for (var i = event.resultIndex; i < event.results.length; i++) {
                var result = event.results[i];
                if (result.isFinal) {
                    final += result[0].transcript;
                }
                else {
                    interim += result[0].transcript;
                }
            }
            if (interim)
                setInterimText(interim);
            if (final) {
                setInterimText('');
                onTranscript === null || onTranscript === void 0 ? void 0 : onTranscript(final, true);
                var cmd = detectCommand(final);
                if (cmd) {
                    onCommand === null || onCommand === void 0 ? void 0 : onCommand(cmd.command, cmd.args);
                }
            }
            else if (interim) {
                onTranscript === null || onTranscript === void 0 ? void 0 : onTranscript(interim, false);
            }
        };
        rec.onerror = function (event) {
            if (event.error === 'no-speech' || event.error === 'aborted') {
                return;
            }
            setState('error');
        };
        rec.onend = function () {
            setInterimText('');
            if (shouldRestartRef.current) {
                try {
                    rec.start();
                }
                catch (_a) {
                    setState('idle');
                }
            }
            else {
                setState('idle');
            }
        };
        return rec;
    }, [isSupported, lang, onTranscript, onCommand, detectCommand]);
    var start = useCallback(function () {
        if (!recognitionRef.current) {
            recognitionRef.current = initRecognition();
        }
        if (!recognitionRef.current)
            return;
        shouldRestartRef.current = false;
        try {
            recognitionRef.current.start();
        }
        catch (_a) {
            // already started
        }
    }, [initRecognition]);
    var stop = useCallback(function () {
        shouldRestartRef.current = false;
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            }
            catch (_a) {
                // noop
            }
        }
        setState('idle');
        setInterimText('');
    }, []);
    var toggle = useCallback(function () {
        if (state === 'listening') {
            stop();
        }
        else {
            start();
        }
    }, [state, start, stop]);
    useEffect(function () {
        return function () {
            shouldRestartRef.current = false;
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                }
                catch (_a) {
                    // noop
                }
            }
        };
    }, []);
    return {
        state: state,
        interimText: interimText,
        isSupported: !!isSupported,
        start: start,
        stop: stop,
        toggle: toggle,
        commands: VOICE_COMMANDS,
    };
}
export { VOICE_COMMANDS };
