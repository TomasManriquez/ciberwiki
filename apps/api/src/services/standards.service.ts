import { db } from '../db';
import { standards, controls, pages, evidence } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export class StandardsService {
    private database: typeof db;

    constructor(database?: typeof db) {
        this.database = database || db;
    }

    // Standards CRUD
    async createStandard(data: { name: string; description?: string; version?: string }) {
        const id = uuidv4();
        const [standard] = await this.database.insert(standards).values({ id, ...data }).returning();
        return standard;
    }

    async getAllStandards() {
        return await this.database.select().from(standards).orderBy(desc(standards.createdAt));
    }

    async getStandard(id: string) {
        const [standard] = await this.database.select().from(standards).where(eq(standards.id, id));
        if (!standard) return null;

        const standardControls = await this.database.select().from(controls).where(eq(controls.standardId, id));
        return { ...standard, controls: standardControls };
    }

    async getStandardById(id: string) {
        return this.getStandard(id);
    }

    async updateStandard(id: string, data: { name?: string; description?: string; version?: string }) {
        const [standard] = await this.database.update(standards)
            .set(data)
            .where(eq(standards.id, id))
            .returning();
        return standard;
    }

    async deleteStandard(id: string) {
        await this.database.delete(standards).where(eq(standards.id, id));
    }

    // Controls
    async createControl(data: {
        standardId: string;
        code: string;
        title: string;
        description?: string;
        assignedTo?: string;
    }) {
        const id = uuidv4();
        const [control] = await this.database.insert(controls).values({ id, ...data }).returning();
        return control;
    }

    async getControlById(id: string) {
        const [control] = await this.database.select().from(controls).where(eq(controls.id, id));
        if (!control) return null;

        const linkedEvidence = await this.database.select().from(evidence).where(eq(evidence.controlId, id));
        const linkedPages = await this.database.select().from(pages).where(eq(pages.relatedControlId, id));

        return {
            ...control,
            evidence: linkedEvidence,
            pages: linkedPages
        };
    }

    // Linking
    async linkPageToControl(pageId: string, controlId: string) {
        await this.database.update(pages)
            .set({ relatedControlId: controlId })
            .where(eq(pages.id, pageId));
    }
}
