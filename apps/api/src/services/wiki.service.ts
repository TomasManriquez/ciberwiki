import { db } from '../db';
import { pages } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export class WikiService {
    async createPage(data: {
        title: string;
        slug: string;
        content: string;
        parentId?: string;
        userId: string;
    }) {
        const id = uuidv4();
        const [page] = await db.insert(pages).values({
            id,
            title: data.title,
            slug: data.slug,
            content: data.content,
            parentId: data.parentId,
            lastEditedBy: data.userId,
        }).returning();
        return page;
    }

    async getPageBySlug(slug: string) {
        const [page] = await db.select().from(pages).where(eq(pages.slug, slug));
        return page;
    }

    async getAllPages() {
        return await db.select().from(pages).orderBy(desc(pages.updatedAt));
    }

    async updatePage(id: string, data: {
        title?: string;
        content?: string;
        parentId?: string;
        userId: string;
    }) {
        const [page] = await db.update(pages)
            .set({
                ...data,
                lastEditedBy: data.userId,
                updatedAt: new Date(),
            })
            .where(eq(pages.id, id))
            .returning();
        return page;
    }

    async deletePage(id: string) {
        await db.delete(pages).where(eq(pages.id, id));
    }
}
