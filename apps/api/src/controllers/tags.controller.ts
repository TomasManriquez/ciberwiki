import { Context } from 'hono';
import { TagsService } from '../services/tags.service';

export class TagsController {
    private service: TagsService;

    constructor() {
        this.service = new TagsService();
    }

    async create(c: Context) {
        const body = await c.req.json();
        const { name, color } = body;

        if (!name) {
            return c.json({ error: 'name is required' }, 400);
        }

        const tag = await this.service.createTag(name, color);
        return c.json(tag, 201);
    }

    async getAll(c: Context) {
        const tags = await this.service.getAllTags();
        return c.json(tags);
    }

    async assign(c: Context) {
        const body = await c.req.json();
        const { itemId, tagId, itemType } = body;

        if (!itemId || !tagId || !itemType) {
            return c.json({ error: 'itemId, tagId, and itemType are required' }, 400);
        }

        if (!['page', 'evidence', 'control'].includes(itemType)) {
            return c.json({ error: 'itemType must be page, evidence, or control' }, 400);
        }

        const link = await this.service.addTagToItem(itemId, tagId, itemType);
        return c.json(link, 201);
    }

    async unassign(c: Context) {
        const body = await c.req.json();
        const { itemId, tagId } = body;

        if (!itemId || !tagId) {
            return c.json({ error: 'itemId and tagId are required' }, 400);
        }

        await this.service.removeTagFromItem(itemId, tagId);
        return c.json({ message: 'Tag removed successfully' });
    }

    async getForItem(c: Context) {
        const itemId = c.req.param('itemId');
        const tags = await this.service.getTagsForItem(itemId);
        return c.json(tags);
    }

    async delete(c: Context) {
        const id = c.req.param('id');
        // TODO: Implement delete in TagsService
        return c.json({ message: 'Tag deleted' });
    }
}
