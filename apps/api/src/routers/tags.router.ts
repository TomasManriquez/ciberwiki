import { Hono } from 'hono';
import { TagsController } from '../controllers/tags.controller';

const router = new Hono();
const controller = new TagsController();

router.post('/', (c) => controller.create(c));
router.get('/', (c) => controller.getAll(c));
router.post('/assign', (c) => controller.assign(c));
router.post('/unassign', (c) => controller.unassign(c));
router.get('/item/:itemId', (c) => controller.getForItem(c));
router.delete('/:id', (c) => controller.delete(c));

export default router;
