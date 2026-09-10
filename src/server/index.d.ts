export interface HealthResponse {
    status: string;
    service: string;
    cudaDevice: string;
    timestamp: string;
}

export interface ReasonRequest {
    prompt?: string;
}

export interface ReasonResponse {
    success: boolean;
    engine: string;
    response: string;
    timestamp: string;
}