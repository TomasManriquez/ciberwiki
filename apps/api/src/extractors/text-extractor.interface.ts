/**
 * Text Extractor Interface
 * Strategy Pattern for extensible text extraction from different file types
 */
export interface ITextExtractor {
    /**
     * Check if this extractor supports the given MIME type
     */
    supports(mimeType: string): boolean;

    /**
     * Extract text content from a file
     * @param fileId - Google Drive file ID
     * @returns Extracted text or null if extraction failed
     */
    extract(fileId: string): Promise<string | null>;
}
