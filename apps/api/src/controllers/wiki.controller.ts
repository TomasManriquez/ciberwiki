import { Context } from 'hono';
import { WikiService } from '../services/wiki.service';

export class WikiController {
    private service: WikiService;

    constructor() {
        this.service = new WikiService();
    }

    async create(c: Context) {
        const body = await c.req.json();
        const user = c.get('user');

        if (!user) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        try {
            const page = await this.service.createPage({
                ...body,
                userId: user.id,
            });
            return c.json(page, 201);
        } catch (e) {
            return c.json({ error: 'Failed to create page' }, 500);
        }
    }

    async getBySlug(c: Context) {
        const slug = c.req.param('slug');
        const page = await this.service.getPageBySlug(slug);

        if (!page) {
            return c.json({ error: 'Page not found' }, 404);
        }

        return c.json(page);
    }

    async getAll(c: Context) {
        const pages = await this.service.getAllPages();
        return c.json(pages);
    }

    async update(c: Context) {
        const id = c.req.param('id');
        const body = await c.req.json();
        const user = c.get('user');

        if (!user) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        try {
            const page = await this.service.updatePage(id, {
                ...body,
                userId: user.id,
            });
            return c.json(page);
        } catch (e) {
            return c.json({ error: 'Failed to update page' }, 500);
        }
    }

    async delete(c: Context) {
        const id = c.req.param('id');
        await this.service.deletePage(id);
        return c.json({ message: 'Page deleted' });
    }
}
