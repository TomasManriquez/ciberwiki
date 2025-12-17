import { db } from '../db';
import { evidence, controlEvidence } from '../db/schema';
import { eq } from 'drizzle-orm';

export class EvidenceRepository {
    constructor(private database = db) { }

    async create(data: {
        id: string;
        name: string;
        description?: string;
        category: string; // DOCUMENT | CONFIGURATION | PROCESS
        contentType: string; // FILE | TEXT
        fileUrl?: string;
        driveFileId?: string;
        textContent?: string;
        uploadedBy?: string;
    }) {
        const [result] = await this.database.insert(evidence).values(data).returning();
        return result;
    }

    async findById(id: string) {
        const result = await this.database.select().from(evidence).where(eq(evidence.id, id)).limit(1);
        return result[0] || null;
    }

    async findByControlId(controlId: string) {
        // N:M: Join through controlEvidence
        const results = await this.database
            .select({
                evidence: evidence,
                contextNote: controlEvidence.contextNote,
            })
            .from(controlEvidence)
            .innerJoin(evidence, eq(controlEvidence.evidenceId, evidence.id))
            .where(eq(controlEvidence.controlId, controlId));

        return results.map(r => ({
            ...r.evidence,
            contextNote: r.contextNote,
        }));
    }

    async findAll() {
        return await this.database.select().from(evidence);
    }

    async update(id: string, data: {
        name?: string;
        description?: string;
        category?: string;
        fileUrl?: string;
        textContent?: string;
    }) {
        const [result] = await this.database.update(evidence).set(data).where(eq(evidence.id, id)).returning();
        return result;
    }

    async delete(id: string) {
        // First delete all control-evidence links
        await this.database.delete(controlEvidence).where(eq(controlEvidence.evidenceId, id));
        // Then delete the evidence
        await this.database.delete(evidence).where(eq(evidence.id, id));
    }

    // N:M Link Methods
    async linkToControl(evidenceId: string, controlId: string, contextNote?: string) {
        const id = crypto.randomUUID();
        const [result] = await this.database.insert(controlEvidence).values({
            id,
            evidenceId,
            controlId,
            contextNote,
        }).returning();
        return result;
    }

    async unlinkFromControl(evidenceId: string, controlId: string) {
        await this.database.delete(controlEvidence)
            .where(eq(controlEvidence.evidenceId, evidenceId))
            .where(eq(controlEvidence.controlId, controlId));
    }

    async getLinkedControls(evidenceId: string) {
        return await this.database
            .select()
            .from(controlEvidence)
            .where(eq(controlEvidence.evidenceId, evidenceId));
    }
}
