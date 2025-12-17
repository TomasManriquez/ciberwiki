import { Hono } from 'hono';
import { EvidenceController } from '../controllers/evidence.controller';

const router = new Hono();
const controller = new EvidenceController();

// CRUD
router.post('/', (c) => controller.create(c));
router.get('/', (c) => controller.getAll(c));
router.get('/control/:controlId', (c) => controller.getByControl(c));
router.get('/:id', (c) => controller.getById(c));
router.put('/:id', (c) => controller.update(c));
router.delete('/:id', (c) => controller.delete(c));

// N:M Link Management
router.post('/link', (c) => controller.linkToControl(c));
router.post('/unlink', (c) => controller.unlinkFromControl(c));

export default router;
