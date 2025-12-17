import { Context } from 'hono';
import { StandardsService } from '../services/standards.service';

export class StandardsController {
    private service: StandardsService;

    constructor() {
        this.service = new StandardsService();
    }

    async create(c: Context) {
        const body = await c.req.json();
        const standard = await this.service.createStandard(body);
        return c.json(standard, 201);
    }

    async getAll(c: Context) {
        const standards = await this.service.getAllStandards();
        return c.json(standards);
    }

    async getById(c: Context) {
        const id = c.req.param('id');
        const standard = await this.service.getStandard(id);

        if (!standard) {
            return c.json({ error: 'Standard not found' }, 404);
        }

        return c.json(standard);
    }

    async update(c: Context) {
        const id = c.req.param('id');
        const body = await c.req.json();
        const standard = await this.service.updateStandard(id, body);

        if (!standard) {
            return c.json({ error: 'Standard not found' }, 404);
        }

        return c.json(standard);
    }

    async delete(c: Context) {
        const id = c.req.param('id');
        await this.service.deleteStandard(id);
        return c.json({ message: 'Standard deleted successfully' });
    }
}
