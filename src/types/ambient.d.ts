// File path: ./src/types/ambient.d.ts

/**
 * Ambient module declarations for untyped third-party libraries (resolves TS2307).
 */

declare module 'pdf-parse/lib/pdf-parse.js' {
  interface PdfData {
    numpages: number;
    numrender: number;
    info: Record<string, any>;
    metadata: any;
    text: string;
    version: string;
  }

  function pdfParse(dataBuffer: Buffer, options?: Record<string, any>): Promise<PdfData>;
  export = pdfParse;
}

declare module 'pdf-parse' {
  import pdfParse = require('pdf-parse/lib/pdf-parse.js');
  export = pdfParse;
}