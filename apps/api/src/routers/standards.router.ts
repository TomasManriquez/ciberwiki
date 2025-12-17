import { Hono } from 'hono';
import { StandardsController } from '../controllers/standards.controller';

const router = new Hono();
const controller = new StandardsController();

router.post('/', (c) => controller.create(c));
router.get('/', (c) => controller.getAll(c));
router.get('/:id', (c) => controller.getById(c));
router.put('/:id', (c) => controller.update(c));
router.delete('/:id', (c) => controller.delete(c));

export default router;
