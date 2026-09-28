import { google } from 'googleapis';
import { Credentials } from 'google-auth-library';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import * as xlsx from 'xlsx';
import * as docx from 'docx';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export interface GoogleWorkspaceTokens extends Credentials {
  access_token?: string | null;
  refresh_token?: string | null;
}

export interface ParsedExcelRow {
  [key: string]: string | number | boolean | null | undefined;
}

export class GoogleWorkspaceService {
  /**
   * Initializes and returns an OAuth2 client configured with user credentials.
   */
  private getOAuth2Client(tokens: GoogleWorkspaceTokens) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error(
        'Google Workspace Service Error: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not configured in environment variables.'
      );
    }

    const client = new google.auth.OAuth2(clientId, clientSecret);
    client.setCredentials(tokens);
    return client;
  }

  // ---------------------------------------------------------------------------
  // GMAIL INTEGRATION
  // ---------------------------------------------------------------------------
  async listGmailMessages(tokens: GoogleWorkspaceTokens, maxResults = 10) {
    const auth = this.getOAuth2Client(tokens);
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.messages.list({ userId: 'me', maxResults });
    return res.data.messages || [];
  }

  // ---------------------------------------------------------------------------
  // GOOGLE DRIVE INTEGRATION
  // ---------------------------------------------------------------------------
  async listDriveFiles(tokens: GoogleWorkspaceTokens) {
    const auth = this.getOAuth2Client(tokens);
    const drive = google.drive({ version: 'v3', auth });
    const res = await drive.files.list({
      pageSize: 20,
      fields: 'files(id, name, mimeType, webViewLink, createdTime)',
    });
    return res.data.files || [];
  }

  // ---------------------------------------------------------------------------
  // GOOGLE CONTACTS INTEGRATION
  // ---------------------------------------------------------------------------
  async listContacts(tokens: GoogleWorkspaceTokens) {
    const auth = this.getOAuth2Client(tokens);
    const people = google.people({ version: 'v1', auth });
    const res = await people.people.connections.list({
      resourceName: 'people/me',
      pageSize: 50,
      personFields: 'names,emailAddresses,phoneNumbers',
    });
    return res.data.connections || [];
  }

  // ---------------------------------------------------------------------------
  // DOCUMENT IMPORT & PARSING (PDF, EXCEL, WORD)
  // ---------------------------------------------------------------------------
  async parsePdfBuffer(buffer: Buffer): Promise<string> {
    const data = await pdfParse(buffer);
    return data.text;
  }

  parseExcelBuffer(buffer: Buffer): ParsedExcelRow[] {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return [];
    
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) return [];

    return xlsx.utils.sheet_to_json<ParsedExcelRow>(worksheet);
  }

  // ---------------------------------------------------------------------------
  // EXPORT BUILDERS (PDF, EXCEL, WORD)
  // ---------------------------------------------------------------------------
  exportToExcel(data: Record<string, unknown>[], sheetName = 'RyanAI Export'): Buffer {
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
    return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async exportToWord(title: string, content: string): Promise<Buffer> {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun({ text: title, bold: true, size: 32 })],
            }),
            new Paragraph({
              children: [new TextRun({ text: content, size: 24 })],
            }),
          ],
        },
      ],
    });

    return await Packer.toBuffer(doc);
  }
}