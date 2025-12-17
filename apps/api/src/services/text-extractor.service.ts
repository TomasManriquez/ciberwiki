import { ITextExtractor } from '../extractors/text-extractor.interface';
import { GoogleDocsExtractor } from '../extractors/google-docs.extractor';

/**
 * Text Extractor Service
 * Manages multiple extractors using Strategy Pattern
 * Currently only Google Docs is implemented, but PDF/OCR can be added later
 */
export class TextExtractorService {
    private extractors: ITextExtractor[] = [];

    constructor() {
        // Register default extractors
        this.registerExtractor(new GoogleDocsExtractor());
    }

    /**
     * Register a new extractor (allows future extension)
     */
    registerExtractor(extractor: ITextExtractor): void {
        this.extractors.push(extractor);
    }

    /**
     * Extract text from a file using the appropriate extractor
     * @param fileId - Google Drive file ID
     * @param mimeType - File MIME type
     * @returns Extracted text or null if no extractor supports this type
     */
    async extractText(fileId: string, mimeType: string): Promise<string | null> {
        const extractor = this.extractors.find(e => e.supports(mimeType));

        if (!extractor) {
            console.log(`TextExtractorService: No extractor found for MIME type: ${mimeType}`);
            return null;
        }

        return await extractor.extract(fileId);
    }

    /**
     * Check if any extractor supports the given MIME type
     */
    canExtract(mimeType: string): boolean {
        return this.extractors.some(e => e.supports(mimeType));
    }

    /**
     * Get list of supported MIME types
     */
    getSupportedTypes(): string[] {
        // For now, we know Google Docs is the only supported type
        return ['application/vnd.google-apps.document'];
    }
}
