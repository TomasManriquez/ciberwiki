import { Hono } from 'hono';
import { WikiController } from '../controllers/wiki.controller';

const router = new Hono();
const controller = new WikiController();

router.post('/', (c) => controller.create(c));
router.get('/', (c) => controller.getAll(c));
router.get('/:slug', (c) => controller.getBySlug(c));
router.put('/:id', (c) => controller.update(c));
router.delete('/:id', (c) => controller.delete(c));

export default router;
