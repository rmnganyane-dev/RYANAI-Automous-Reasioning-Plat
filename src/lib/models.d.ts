import type { ModelId, ModelMeta } from './types';
export declare const DEFAULT_MODEL_ID: ModelId;
export declare const MODELS: Record<ModelId, ModelMeta>;
export declare const MODEL_LIST: ModelMeta[];
export declare function isModelId(id: string): id is ModelId;
export declare function modelMeta(id?: string | ModelId): ModelMeta;
