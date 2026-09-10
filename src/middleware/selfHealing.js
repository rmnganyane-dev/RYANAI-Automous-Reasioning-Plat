export function generateDiagnosticReport(context) {
    return {
        diagnosticId: Math.random().toString(36).substring(7),
        module: context.module,
        message: context.error.message,
        stack: context.error.stack,
        timestamp: context.timestamp,
        status: "PENDING_HEALING_AGENT",
    };
}
