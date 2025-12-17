import { Context } from 'hono';
import { EvidenceService, EvidenceCategory, ContentType } from '../services/evidence.service';

export class EvidenceController {
    private service: EvidenceService;

    constructor() {
        this.service = new EvidenceService();
    }

    async create(c: Context) {
        try {
            const body = await c.req.parseBody();
            console.log('Creating evidence with data:', Object.keys(body));

            const file = body['file'] as File | undefined;
            const userId = c.get('userId') as string | undefined;

            const category = body['category'] as EvidenceCategory;
            const contentType = body['contentType'] as ContentType;

            if (!category || !contentType) {
                return c.json({ error: 'category and contentType are required' }, 400);
            }

            if (!body['name']) {
                return c.json({ error: 'name is required' }, 400);
            }

            const evidence = await this.service.createEvidence({
                name: body['name'] as string,
                description: body['description'] as string | undefined,
                category,
                contentType,
                file: contentType === 'FILE' ? file : undefined,
                textContent: contentType === 'TEXT' ? (body['textContent'] as string) : undefined,
                uploadedBy: userId || undefined, // null if not authenticated (FK to users.id)
                controlId: body['controlId'] as string | undefined,
                contextNote: body['contextNote'] as string | undefined,
            });
            return c.json(evidence, 201);
        } catch (error) {
            console.error('Error creating evidence:', error);
            return c.json({
                error: 'Failed to create evidence',
                details: error instanceof Error ? error.message : String(error)
            }, 500);
        }
    }

    async getAll(c: Context) {
        try {
            const evidence = await this.service.getAllEvidence();
            return c.json(evidence);
        } catch (error) {
            console.error('Error fetching evidence:', error);
            return c.json({ error: 'Failed to fetch evidence' }, 500);
        }
    }

    async getByControl(c: Context) {
        try {
            const controlId = c.req.param('controlId');
            const evidence = await this.service.getEvidenceByControl(controlId);
            return c.json(evidence);
        } catch (error) {
            console.error('Error fetching evidence by control:', error);
            return c.json({ error: 'Failed to fetch evidence' }, 500);
        }
    }

    async getById(c: Context) {
        try {
            const id = c.req.param('id');
            const evidence = await this.service.getEvidence(id);

            if (!evidence) {
                return c.json({ error: 'Evidence not found' }, 404);
            }

            return c.json(evidence);
        } catch (error) {
            console.error('Error fetching evidence:', error);
            return c.json({ error: 'Failed to fetch evidence' }, 500);
        }
    }

    async update(c: Context) {
        try {
            const id = c.req.param('id');
            const body = await c.req.json();
            const evidence = await this.service.updateEvidence(id, body);

            if (!evidence) {
                return c.json({ error: 'Evidence not found' }, 404);
            }

            return c.json(evidence);
        } catch (error) {
            console.error('Error updating evidence:', error);
            return c.json({ error: 'Failed to update evidence' }, 500);
        }
    }

    async delete(c: Context) {
        try {
            const id = c.req.param('id');
            await this.service.deleteEvidence(id);
            return c.json({ message: 'Evidence deleted successfully' });
        } catch (error) {
            console.error('Error deleting evidence:', error);
            return c.json({ error: 'Failed to delete evidence' }, 500);
        }
    }

    // N:M Link Endpoints
    async linkToControl(c: Context) {
        try {
            const body = await c.req.json();
            const { evidenceId, controlId, contextNote } = body;

            if (!evidenceId || !controlId) {
                return c.json({ error: 'evidenceId and controlId are required' }, 400);
            }

            const link = await this.service.linkToControl(evidenceId, controlId, contextNote);
            return c.json(link, 201);
        } catch (error) {
            console.error('Error linking evidence to control:', error);
            return c.json({ error: 'Failed to link evidence' }, 500);
        }
    }

    async unlinkFromControl(c: Context) {
        try {
            const body = await c.req.json();
            const { evidenceId, controlId } = body;

            if (!evidenceId || !controlId) {
                return c.json({ error: 'evidenceId and controlId are required' }, 400);
            }

            await this.service.unlinkFromControl(evidenceId, controlId);
            return c.json({ message: 'Unlinked successfully' });
        } catch (error) {
            console.error('Error unlinking evidence from control:', error);
            return c.json({ error: 'Failed to unlink evidence' }, 500);
        }
    }
}