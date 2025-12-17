import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export class AuthRepository {
    constructor(private database = db) { }

    async findUserByEmail(email: string) {
        const result = await this.database.select().from(users).where(eq(users.email, email)).limit(1);
        return result[0] || null;
    }

    async findUserByUsername(username: string) {
        const result = await this.database.select().from(users).where(eq(users.username, username)).limit(1);
        return result[0] || null;
    }

    async createUser(data: {
        id: string;
        email: string;
        name: string;
        username?: string;
        avatar?: string;
        authProvider?: 'google' | 'ldap';
    }) {
        await this.database.insert(users).values({
            ...data,
            authProvider: data.authProvider || 'google',
        }).run();
        return data;
    }

    async updateUser(id: string, data: { name?: string; avatar?: string }) {
        await this.database.update(users).set(data).where(eq(users.id, id)).run();
        return true;
    }
}
