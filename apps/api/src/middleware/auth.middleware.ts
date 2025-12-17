import { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { verify } from 'hono/jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

export const authMiddleware = async (c: Context, next: Next) => {
    const token = getCookie(c, 'auth_token');

    if (!token) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
        const payload = await verify(token, JWT_SECRET);
        c.set('user', payload);
        await next();
    } catch (e) {
        return c.json({ error: 'Invalid token' }, 401);
    }
};
