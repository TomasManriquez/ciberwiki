import { Hono } from 'hono';
import { ControlsController } from '../controllers/controls.controller';

const router = new Hono();
const controller = new ControlsController();

router.post('/', (c) => controller.create(c));
router.get('/', (c) => controller.getAll(c));
router.get('/standard/:standardId', (c) => controller.getByStandard(c));
router.get('/:id', (c) => controller.getById(c));
router.put('/:id', (c) => controller.update(c));
router.delete('/:id', (c) => controller.delete(c));

export default router;
