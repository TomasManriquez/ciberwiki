import { db } from '../db';
import { standards } from '../db/schema';
import { eq } from 'drizzle-orm';

export class StandardsRepository {
    constructor(private database = db) { }

    async create(data: { id: string; name: string; version?: string; description?: string }) {
        const [result] = await this.database.insert(standards).values(data).returning();
        return result;
    }

    async findById(id: string) {
        const result = await this.database.select().from(standards).where(eq(standards.id, id)).limit(1);
        return result[0] || null;
    }

    async findAll() {
        return await this.database.select().from(standards);
    }

    async update(id: string, data: { name?: string; version?: string; description?: string }) {
        const [result] = await this.database.update(standards).set(data).where(eq(standards.id, id)).returning();
        return result;
    }

    async delete(id: string) {
        await this.database.delete(standards).where(eq(standards.id, id));
    }
}
