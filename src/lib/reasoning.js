var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { uid } from './storage';
import { getPrimaryBrain } from '@/config/models';
import { AUTONOMOUS_REASONING_SKILL } from '@/config/reasoningSkill';
var REASONING_TEMPLATES = {
    'gemini-3.1-pro': [
        'Analyzing input across {n} semantic dimensions...',
        'Cross-referencing with persistent memory graph...',
        'Decomposing into {n} sub-tasks for parallel evaluation...',
        'Synthesizing multimodal context window (2M tokens)...',
        'Selecting optimal response strategy from {n} candidates...',
    ],
    'claude-sonnet-4.6': [
        'Parsing intent and constructing reasoning chain...',
        'Evaluating tool requirements against available capabilities...',
        'Executing ReAct loop — observation → thought → action...',
        'Checking memory for relevant prior context...',
        'Composing structured response with tool-augmented data...',
    ],
    'gpt-5.4': [
        'Allocating adaptive compute budget for reasoning...',
        'Running chain-of-thought with {n} intermediate steps...',
        'Querying knowledge base and persistent memory layer...',
        'Validating response against safety and accuracy constraints...',
        'Streaming final synthesis with confidence scoring...',
    ],
};
var TOOL_NAMES = ['web_search', 'calculator', 'memory_recall', 'code_executor'];
var TOOL_LABELS = {
    web_search: 'Web Search',
    calculator: 'Calculator',
    memory_recall: 'Memory Recall',
    code_executor: 'Code Executor',
};
function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function shouldUseTools(text) {
    var lower = text.toLowerCase();
    return (lower.includes('search') ||
        lower.includes('find') ||
        lower.includes('what') ||
        lower.includes('latest') ||
        lower.includes('news') ||
        lower.includes('calculate') ||
        lower.includes('compute') ||
        lower.includes('remember') ||
        lower.includes('code') ||
        lower.includes('build') ||
        lower.includes('deploy') ||
        Math.random() > 0.5);
}
function generateToolResult(name) {
    switch (name) {
        case 'web_search':
            return "Found 4 relevant sources. Top result: \"Emergent AI architectures in 2026 \u2014 a survey of autonomous agent frameworks and their deployment patterns.\"";
        case 'calculator':
            return "Computed: result = 42.0 (evaluated expression successfully)";
        case 'memory_recall':
            return "Recalled 2 entries: user prefers TypeScript, working on RyanAI platform.";
        case 'code_executor':
            return "Execution completed in 128ms. Exit code 0. stdout: \"Build successful.\"";
        default:
            return 'Tool completed.';
    }
}
function generateResponse(model, userText) {
    var _a;
    var primaryBrain = getPrimaryBrain();
    var intros = {
        'gemini-3.1-pro': [
            "Based on my analysis across multiple reasoning paths, here's what I've determined:",
            "After cross-referencing available context and tool outputs:",
            "My multimodal synthesis yields the following assessment:",
        ],
        'claude-sonnet-4.6': [
            "Here's my reasoned response after working through the problem:",
            "I've completed the reasoning loop. Here's what I found:",
            "After evaluating the available tools and context:",
        ],
        'gpt-5.4': [
            "With high confidence (p=0.94), here is my response:",
            "Following adaptive compute allocation, I've reached this conclusion:",
            "My chain-of-thought analysis produces the following:",
        ],
    };
    var modelIntros = (_a = intros[model]) !== null && _a !== void 0 ? _a : intros['claude-sonnet-4.6'];
    var intro = pickRandom(modelIntros);
    var body = "**Your query:** \"".concat(userText.slice(0, 120), "\"\n\n**Assessment:** I've processed your request through the full reasoning pipeline \u2014 parsing intent, consulting tools, and synthesizing a coherent response. The local orchestration state machine executed successfully with no dead-ends detected.\n\n**Key findings:**\n- Intent classification: `information_seeking`\n- Primary brain profile: `").concat(primaryBrain.name, "`\n- Tools invoked: see trace panel\n- Memory context: 2 prior entries referenced\n- Confidence: 94%\n\n**Recommendation:** RyanAI is currently running its deterministic local reasoning fallback. Configure a provider gateway to activate live Nemotron and Qwen inference using the routing profile in `src/config/models.ts`.\n\n*RyanAI \u00B7 Autonomous Reasoning Engine \u00B7 Named after Mukhethwa Ryan Ganyane*");
    return "".concat(intro, "\n\n").concat(body);
}
export function streamReasoning(userText, model, callbacks) {
    return __awaiter(this, void 0, void 0, function () {
        var modelTemplates, skillTemplates, templates, fullResponse, title, numSteps, i, template, words, _i, words_1, word, numTools, i, toolName, step, resultStep, tokens, _a, tokens_1, token, err_1;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 19, , 20]);
                    modelTemplates = (_b = REASONING_TEMPLATES[model]) !== null && _b !== void 0 ? _b : REASONING_TEMPLATES['claude-sonnet-4.6'];
                    skillTemplates = Array.isArray(AUTONOMOUS_REASONING_SKILL) ? AUTONOMOUS_REASONING_SKILL : [];
                    templates = __spreadArray(__spreadArray([], skillTemplates, true), modelTemplates, true);
                    fullResponse = generateResponse(model, userText);
                    title = userText.trim().slice(0, 48) || 'New Thread';
                    callbacks.onTitle(title);
                    numSteps = 3 + Math.floor(Math.random() * 2);
                    i = 0;
                    _c.label = 1;
                case 1:
                    if (!(i < numSteps)) return [3 /*break*/, 8];
                    template = templates[i % templates.length].replace('{n}', String(2 + Math.floor(Math.random() * 4)));
                    words = template.split(' ');
                    _i = 0, words_1 = words;
                    _c.label = 2;
                case 2:
                    if (!(_i < words_1.length)) return [3 /*break*/, 5];
                    word = words_1[_i];
                    callbacks.onToken(word + ' ');
                    return [4 /*yield*/, sleep(30 + Math.random() * 40)];
                case 3:
                    _c.sent();
                    _c.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    callbacks.onToken('\n');
                    return [4 /*yield*/, sleep(100)];
                case 6:
                    _c.sent();
                    _c.label = 7;
                case 7:
                    i++;
                    return [3 /*break*/, 1];
                case 8:
                    if (!shouldUseTools(userText)) return [3 /*break*/, 13];
                    numTools = 1 + Math.floor(Math.random() * 2);
                    i = 0;
                    _c.label = 9;
                case 9:
                    if (!(i < numTools)) return [3 /*break*/, 13];
                    toolName = pickRandom(TOOL_NAMES);
                    step = {
                        id: uid('step'),
                        type: 'tool_start',
                        name: toolName,
                        args: { query: userText.slice(0, 60) },
                        status: 'running',
                    };
                    callbacks.onStep(step);
                    return [4 /*yield*/, sleep(400 + Math.random() * 600)];
                case 10:
                    _c.sent();
                    resultStep = __assign(__assign({}, step), { type: 'tool_result', result: generateToolResult(toolName), status: 'done' });
                    callbacks.onStep(resultStep);
                    return [4 /*yield*/, sleep(200)];
                case 11:
                    _c.sent();
                    _c.label = 12;
                case 12:
                    i++;
                    return [3 /*break*/, 9];
                case 13:
                    // Phase 3: Clear reasoning buffer, stream final response
                    callbacks.onToken('\n---\n\n');
                    return [4 /*yield*/, sleep(200)];
                case 14:
                    _c.sent();
                    tokens = fullResponse.split(/(\s+)/);
                    _a = 0, tokens_1 = tokens;
                    _c.label = 15;
                case 15:
                    if (!(_a < tokens_1.length)) return [3 /*break*/, 18];
                    token = tokens_1[_a];
                    callbacks.onToken(token);
                    return [4 /*yield*/, sleep(15 + Math.random() * 35)];
                case 16:
                    _c.sent();
                    _c.label = 17;
                case 17:
                    _a++;
                    return [3 /*break*/, 15];
                case 18:
                    callbacks.onDone();
                    return [3 /*break*/, 20];
                case 19:
                    err_1 = _c.sent();
                    callbacks.onError(err_1 instanceof Error ? err_1.message : 'An error occurred during reasoning execution.');
                    return [3 /*break*/, 20];
                case 20: return [2 /*return*/];
            }
        });
    });
}
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
export { TOOL_LABELS };
