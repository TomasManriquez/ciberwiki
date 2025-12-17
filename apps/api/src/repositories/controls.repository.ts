import { db } from '../db';
import { controls } from '../db/schema';
import { eq } from 'drizzle-orm';

export class ControlsRepository {
    constructor(private database = db) { }

    async create(data: {
        id: string;
        standardId: string;
        code: string;
        title: string;
        description?: string;
        status?: string;
        assignedTo?: string;
    }) {
        const [result] = await this.database.insert(controls).values(data).returning();
        return result;
    }

    async findById(id: string) {
        const result = await this.database.select().from(controls).where(eq(controls.id, id)).limit(1);
        return result[0] || null;
    }

    async findByStandardId(standardId: string) {
        return await this.database.select().from(controls).where(eq(controls.standardId, standardId));
    }

    async findAll() {
        return await this.database.select().from(controls);
    }

    async update(id: string, data: {
        code?: string;
        title?: string;
        description?: string;
        status?: string;
        assignedTo?: string;
    }) {
        const [result] = await this.database.update(controls).set(data).where(eq(controls.id, id)).returning();
        return result;
    }

    async delete(id: string) {
        await this.database.delete(controls).where(eq(controls.id, id));
    }
}
