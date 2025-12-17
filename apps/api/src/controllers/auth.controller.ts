import { Context } from 'hono';
import { AuthService } from '../services/auth.service';
import { setCookie, deleteCookie, getCookie } from 'hono/cookie';
import { sign, verify } from 'hono/jwt';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/api/auth/google/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4321';

// Validation schemas
const ldapLoginSchema = z.object({
    username: z.string().min(1, 'El nombre de usuario es requerido'),
    password: z.string().min(1, 'La contraseña es requerida'),
});

export class AuthController {
    private service: AuthService;

    constructor() {
        this.service = new AuthService();
    }

    // Google OAuth login redirect
    async login(c: Context) {
        if (!GOOGLE_CLIENT_ID) {
            return c.json({ error: 'Google Client ID not configured' }, 500);
        }

        const params = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            response_type: 'code',
            scope: 'openid email profile',
            access_type: 'offline',
            prompt: 'consent',
        });

        return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
    }

    // Google OAuth callback
    async callback(c: Context) {
        const code = c.req.query('code');
        if (!code) {
            return c.json({ error: 'No code provided' }, 400);
        }

        try {
            // Exchange code for token
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    code,
                    client_id: GOOGLE_CLIENT_ID!,
                    client_secret: GOOGLE_CLIENT_SECRET!,
                    redirect_uri: REDIRECT_URI,
                    grant_type: 'authorization_code',
                }),
            });

            const tokens = await tokenResponse.json();
            if (!tokens.access_token) {
                return c.json({ error: 'Failed to get access token' }, 400);
            }

            // Get User Profile
            const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${tokens.access_token}` },
            });
            const profile = await profileResponse.json();

            // Validate/Create User
            const user = await this.service.validateUser(profile);

            // Create Session Token
            const sessionToken = await sign({
                id: user.id,
                email: user.email,
                name: user.name,
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
            }, JWT_SECRET);

            // Set Cookie
            setCookie(c, 'auth_token', sessionToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7,
            });

            // Redirect to Frontend
            return c.redirect(`${FRONTEND_URL}/dashboard`);

        } catch (error) {
            console.error('Auth Error:', error);
            return c.json({ error: 'Authentication failed' }, 500);
        }
    }

    // LDAP/FreeIPA login
    async loginLDAP(c: Context) {
        try {
            const body = await c.req.json();

            // Validate input
            const validationResult = ldapLoginSchema.safeParse(body);
            if (!validationResult.success) {
                return c.json({
                    error: validationResult.error.errors[0].message
                }, 400);
            }

            const { username, password } = validationResult.data;

            // Authenticate with LDAP
            const result = await this.service.loginWithLDAP(username, password);

            if (!result.success) {
                return c.json({ error: result.error }, 401);
            }

            const user = result.user;

            // Create Session Token
            const sessionToken = await sign({
                id: user.id,
                email: user.email,
                name: user.name,
                username: user.username,
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
            }, JWT_SECRET);

            // Set Cookie
            // Set Cookie
            setCookie(c, 'auth_token', sessionToken, {
                httpOnly: false, // Allow client side access for debugging if needed, though robust apps use true. Let's keep true but relax others.
                secure: false, // Force false for localhost testing
                sameSite: 'Lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7,
            });

            return c.json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    username: user.username,
                }
            });

        } catch (error) {
            console.error('LDAP Login Error:', error);
            return c.json({ error: 'Error de autenticación' }, 500);
        }
    }

    // Test LDAP connection
    async testLDAP(c: Context) {
        const result = await this.service.testLDAPConnection();
        return c.json(result);
    }

    async logout(c: Context) {
        deleteCookie(c, 'auth_token');
        return c.redirect(`${FRONTEND_URL}/`);
    }

    async me(c: Context) {
        const token = getCookie(c, 'auth_token');
        if (!token) {
            return c.json({ user: null }, 401);
        }

        try {
            const payload = await verify(token, JWT_SECRET);
            return c.json({ user: payload });
        } catch (e) {
            return c.json({ user: null }, 401);
        }
    }
}
