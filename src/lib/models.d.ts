import type { ModelId, ModelMeta } from './types';

export declare const MODELS: Record<ModelId, ModelMeta>;
export declare const MODEL_LIST: ModelMeta[];
export declare function modelMeta(id?: ModelId): ModelMeta;