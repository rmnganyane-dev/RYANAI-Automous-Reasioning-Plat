export interface TelemetryData {
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  activeThreads: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}

export type OutgoingMessage =
  | { type: 'TELEMETRY'; payload: TelemetryData }
  | { type: 'LOG'; payload: LogEntry }
  | { type: 'SWEEP_COMPLETE'; payload: { anomalies: number } };

export type IncomingMessage =
  | { type: 'COMMAND'; command: string }
  | { type: 'SWEEP_START' }
  | { type: 'TOGGLE_SENTINEL'; active: boolean };