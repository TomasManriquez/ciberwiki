import { EvidenceRepository } from '../repositories/evidence.repository';
import { DriveService } from './drive.service';
import { v4 as uuidv4 } from 'uuid';

export type EvidenceCategory = 'DOCUMENT' | 'CONFIGURATION' | 'PROCESS';
export type ContentType = 'FILE' | 'TEXT';

export class EvidenceService {
    private repository: EvidenceRepository;
    private driveService: DriveService;

    constructor(database?: any) {
        this.repository = new EvidenceRepository(database);
        this.driveService = new DriveService();
    }

    async createEvidence(data: {
        name: string;
        description?: string;
        category: EvidenceCategory;
        contentType: ContentType;
        file?: File;
        textContent?: string;
        uploadedBy?: string;
        // Optional: link to control immediately
        controlId?: string;
        contextNote?: string;
    }) {
        const id = uuidv4();
        let fileUrl: string | undefined;
        let driveFileId: string | undefined;

        // If FILE type, upload to Drive (optional - skip if not configured)
        if (data.contentType === 'FILE' && data.file) {
            try {
                const driveFile = await this.driveService.uploadFile(
                    data.file,
                    data.name,
                    data.file.type || 'application/octet-stream'
                );
                fileUrl = driveFile.webViewLink || undefined;
                driveFileId = driveFile.id || undefined;
            } catch (error) {
                console.warn('⚠️ Google Drive upload failed, continuing without file URL:', error);
                // Continue creating evidence without file URL
                // In production, you might want to store the file locally or use alternative storage
            }
        }

        const evidence = await this.repository.create({
            id,
            name: data.name,
            description: data.description,
            category: data.category,
            contentType: data.contentType,
            fileUrl,
            driveFileId,
            textContent: data.contentType === 'TEXT' ? data.textContent : undefined,
            uploadedBy: data.uploadedBy,
        });

        // If controlId provided, link immediately
        if (data.controlId) {
            await this.linkToControl(id, data.controlId, data.contextNote);
        }

        return evidence;
    }

    async getEvidence(id: string) {
        const evidence = await this.repository.findById(id);
        if (!evidence) return null;

        const linkedControls = await this.repository.getLinkedControls(id);
        return { ...evidence, linkedControls };
    }

    async getEvidenceByControl(controlId: string) {
        return await this.repository.findByControlId(controlId);
    }

    async getAllEvidence() {
        return await this.repository.findAll();
    }

    async updateEvidence(id: string, data: {
        name?: string;
        description?: string;
        category?: EvidenceCategory;
        textContent?: string;
    }) {
        return await this.repository.update(id, data);
    }

    async deleteEvidence(id: string) {
        const evidence = await this.repository.findById(id);

        // Delete from Drive if exists
        if (evidence?.driveFileId) {
            try {
                await this.driveService.deleteFile(evidence.driveFileId);
            } catch (e) {
                console.error('Failed to delete Drive file:', e);
            }
        }

        await this.repository.delete(id);
    }

    // N:M Link Management
    async linkToControl(evidenceId: string, controlId: string, contextNote?: string) {
        return await this.repository.linkToControl(evidenceId, controlId, contextNote);
    }

    async unlinkFromControl(evidenceId: string, controlId: string) {
        return await this.repository.unlinkFromControl(evidenceId, controlId);
    }
}
