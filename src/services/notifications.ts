/**
 * RyanAI Notification Engine
 * Handles Resend email dispatch and WhatsApp pipeline status alerts.
 */
import { Resend } from 'resend';
import fetch from 'node-fetch';
import { logger } from '../shared/logger.js';

interface PipelineNotificationPayload {
  version: string;
  environment: string;
  commitHash: string;
  duration: string;
  deployedBy: string;
  recipientEmail: string;
  recipientPhone: string;
}

export class NotificationService {
  private resend: Resend;
  private whatsappApiUrl: string;
  private whatsappToken: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');
    this.whatsappApiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0/me/messages';
    this.whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN || 'mock_whatsapp_token';
  }

  /**
   * Dispatches both email and WhatsApp notifications on pipeline success
   */
  async notifyPipelineSuccess(payload: PipelineNotificationPayload): Promise<{ emailSent: boolean; whatsappSent: boolean }> {
    const [emailResult, whatsappResult] = await Promise.allSettled([
      this.sendEmailAlert(payload),
      this.sendWhatsAppAlert(payload),
    ]);

    const emailSent = emailResult.status === 'fulfilled' && emailResult.value;
    const whatsappSent = whatsappResult.status === 'fulfilled' && whatsappResult.value;

    logger.info('[NOTIFICATIONS] Pipeline completion dispatch status', { emailSent, whatsappSent });
    return { emailSent, whatsappSent };
  }

  private async sendEmailAlert(payload: PipelineNotificationPayload): Promise<boolean> {
    try {
      const htmlContent = `
        <div style="font-family: monospace; background: #030712; color: #f3f4f6; padding: 24px; border-radius: 12px; border: 1px solid #1e293b;">
          <h2 style="color: #00f3ff; margin-top: 0;">🚀 RyanAI Deployment Successful</h2>
          <p>The 5-phase automated pipeline has successfully executed and deployed your build.</p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Version:</strong> ${payload.version}</li>
            <li><strong>Environment:</strong> <span style="color: #00ff66; text-transform: uppercase;">${payload.environment}</span></li>
            <li><strong>Commit:</strong> ${payload.commitHash}</li>
            <li><strong>Duration:</strong> ${payload.duration}</li>
            <li><strong>Initiator:</strong> ${payload.deployedBy}</li>
          </ul>
          <hr style="border-color: #1e293b; margin: 16px 0;" />
          <p style="font-size: 11px; color: #64748b;">Transcend eBPF Kernel Security: Verified &bull; RyanAI Command Center v4.5</p>
        </div>
      `;

      await this.resend.emails.send({
        from: 'RyanAI Sentinel <deploy@updates.ryanai.internal>',
        to: [payload.recipientEmail],
        subject: `✅ [${payload.environment.toUpperCase()}] RyanAI Deployment ${payload.version} Successful`,
        html: htmlContent,
      });

      return true;
    } catch (error) {
      logger.error('[NOTIFICATIONS] Failed to dispatch Resend email alert:', error);
      return false;
    }
  }

  private async sendWhatsAppAlert(payload: PipelineNotificationPayload): Promise<boolean> {
    try {
      const messageBody = `🚀 *RyanAI Deployment Success*\n\n` +
        `• *Version:* ${payload.version}\n` +
        `• *Environment:* ${payload.environment.toUpperCase()}\n` +
        `• *Commit:* ${payload.commitHash}\n` +
        `• *Duration:* ${payload.duration}\n` +
        `• *Status:* Verified & Shipped ✅`;

      // If in mock mode or missing token, simulate dispatch
      if (this.whatsappToken === 'mock_whatsapp_token') {
        logger.info(`[WHATSAPP MOCK DISPATCH] To: ${payload.recipientPhone} | Message: \n${messageBody}`);
        return true;
      }

      const response = await fetch(this.whatsappApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.whatsappToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: payload.recipientPhone,
          type: 'text',
          text: { body: messageBody },
        }),
      });

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      logger.error('[NOTIFICATIONS] Failed to dispatch WhatsApp notification:', error);
      return false;
    }
  }
}