import { ITextExtractor } from './text-extractor.interface';
import { DriveService } from '../services/drive.service';

/**
 * Google Docs Text Extractor
 * Extracts plain text from Google Docs via Drive API export
 */
export class GoogleDocsExtractor implements ITextExtractor {
    private driveService: DriveService;

    constructor() {
        this.driveService = new DriveService();
    }

    supports(mimeType: string): boolean {
        return mimeType === 'application/vnd.google-apps.document';
    }

    async extract(fileId: string): Promise<string | null> {
        try {
            return await this.driveService.extractFileContent(
                fileId,
                'application/vnd.google-apps.document'
            );
        } catch (error) {
            console.error('GoogleDocsExtractor: Failed to extract text:', error);
            return null;
        }
    }
}
