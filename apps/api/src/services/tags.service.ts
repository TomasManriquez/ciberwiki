import { db } from '../db';
import { tags, itemsTags } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export class TagsService {
    async createTag(name: string, color?: string) {
        const id = uuidv4();
        const [tag] = await db.insert(tags).values({
            id,
            name,
            color: color || '#3B82F6',
        }).returning();
        return tag;
    }

    async getAllTags() {
        return await db.select().from(tags);
    }

    async getTagByName(name: string) {
        const [tag] = await db.select().from(tags).where(eq(tags.name, name));
        return tag;
    }

    async addTagToItem(itemId: string, tagId: string, itemType: 'page' | 'evidence' | 'control') {
        // Check if already exists
        const [existing] = await db.select()
            .from(itemsTags)
            .where(and(
                eq(itemsTags.itemId, itemId),
                eq(itemsTags.tagId, tagId)
            ));

        if (existing) return existing;

        const id = uuidv4();
        const [itemTag] = await db.insert(itemsTags).values({
            id,
            itemId,
            tagId,
            itemType,
        }).returning();
        return itemTag;
    }

    async removeTagFromItem(itemId: string, tagId: string) {
        await db.delete(itemsTags)
            .where(and(
                eq(itemsTags.itemId, itemId),
                eq(itemsTags.tagId, tagId)
            ));
    }

    async getTagsForItem(itemId: string) {
        const result = await db.select({
            id: tags.id,
            name: tags.name,
            color: tags.color,
        })
            .from(itemsTags)
            .innerJoin(tags, eq(itemsTags.tagId, tags.id))
            .where(eq(itemsTags.itemId, itemId));

        return result;
    }
}
