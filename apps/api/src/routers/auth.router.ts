import { Hono } from 'hono';
import { AuthController } from '../controllers/auth.controller';

const router = new Hono();
const controller = new AuthController();

// Google OAuth routes
router.get('/google', (c) => controller.login(c));
router.get('/google/callback', (c) => controller.callback(c));

// LDAP/FreeIPA routes
router.post('/login/ldap', (c) => controller.loginLDAP(c));
router.get('/ldap/test', (c) => controller.testLDAP(c));

// Session routes
router.get('/logout', (c) => controller.logout(c));
router.get('/me', (c) => controller.me(c));

export default router;
