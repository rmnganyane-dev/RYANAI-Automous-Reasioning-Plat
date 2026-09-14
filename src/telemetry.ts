import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

const exporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318/v1/traces",
});

export const telemetrySdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: "ryanai-sovereign-engine",
  }),
  traceExporter: exporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

export function initializeTelemetry() {
  try {
    telemetrySdk.start();
    console.log("OpenTelemetry distributed tracing initialized for RyanAI agent workflows.");
  } catch (error) {
    console.error("Failed to initialize telemetry SDK:", error);
  }
}