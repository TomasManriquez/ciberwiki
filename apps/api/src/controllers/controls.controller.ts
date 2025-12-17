import { Context } from 'hono';
import { ControlsService } from '../services/controls.service';

export class ControlsController {
    private service: ControlsService;

    constructor() {
        this.service = new ControlsService();
    }

    async create(c: Context) {
        try {
            const body = await c.req.json();
            console.log('Creating control with data:', body);

            const control = await this.service.createControl(body);
            return c.json(control, 201);
        } catch (error) {
            console.error('Error creating control:', error);
            return c.json({
                error: 'Failed to create control',
                details: error instanceof Error ? error.message : String(error)
            }, 500);
        }
    }

    async getAll(c: Context) {
        try {
            const controls = await this.service.getAllControls();
            return c.json(controls);
        } catch (error) {
            console.error('Error fetching controls:', error);
            return c.json({ error: 'Failed to fetch controls' }, 500);
        }
    }

    async getByStandard(c: Context) {
        try {
            const standardId = c.req.param('standardId');
            const controls = await this.service.getControlsByStandard(standardId);
            return c.json(controls);
        } catch (error) {
            console.error('Error fetching controls by standard:', error);
            return c.json({ error: 'Failed to fetch controls' }, 500);
        }
    }

    async getById(c: Context) {
        try {
            const id = c.req.param('id');
            const control = await this.service.getControl(id);

            if (!control) {
                return c.json({ error: 'Control not found' }, 404);
            }

            return c.json(control);
        } catch (error) {
            console.error('Error fetching control:', error);
            return c.json({ error: 'Failed to fetch control' }, 500);
        }
    }

    async update(c: Context) {
        try {
            const id = c.req.param('id');
            const body = await c.req.json();
            const control = await this.service.updateControl(id, body);

            if (!control) {
                return c.json({ error: 'Control not found' }, 404);
            }

            return c.json(control);
        } catch (error) {
            console.error('Error updating control:', error);
            return c.json({ error: 'Failed to update control' }, 500);
        }
    }

    async delete(c: Context) {
        try {
            const id = c.req.param('id');
            await this.service.deleteControl(id);
            return c.json({ message: 'Control deleted successfully' });
        } catch (error) {
            console.error('Error deleting control:', error);
            return c.json({ error: 'Failed to delete control' }, 500);
        }
    }
}
