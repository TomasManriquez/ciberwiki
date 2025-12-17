import { AuthRepository } from '../repositories/auth.repository';
import { LdapService, LdapUserProfile } from './ldap.service';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
    private repository: AuthRepository;
    private ldapService: LdapService;

    constructor() {
        this.repository = new AuthRepository();
        this.ldapService = new LdapService();
    }

    /**
     * Validate/create user from Google OAuth profile
     */
    async validateUser(profile: { email: string; name: string; picture?: string }) {
        let user = await this.repository.findUserByEmail(profile.email);

        if (!user) {
            // Create new user from Google OAuth
            const id = uuidv4();
            await this.repository.createUser({
                id,
                email: profile.email,
                name: profile.name,
                avatar: profile.picture,
                authProvider: 'google',
            });
            user = await this.repository.findUserByEmail(profile.email);
        }

        return user!;
    }

    /**
     * Authenticate user with LDAP/FreeIPA credentials
     * Auto-provisions user in local database on first login
     */
    async loginWithLDAP(username: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
        try {
            // Authenticate against LDAP
            const ldapProfile = await this.ldapService.authenticateUser(username, password);

            if (!ldapProfile) {
                return { success: false, error: 'Credenciales inválidas' };
            }

            // Check if user exists in local database
            let user = await this.repository.findUserByUsername(username);

            if (!user) {
                // Also check by email in case user exists from Google OAuth
                user = await this.repository.findUserByEmail(ldapProfile.email);
            }

            if (!user) {
                // Auto-provision new LDAP user
                const id = uuidv4();
                await this.repository.createUser({
                    id,
                    email: ldapProfile.email,
                    name: ldapProfile.name,
                    username: ldapProfile.uid,
                    authProvider: 'ldap',
                });
                user = await this.repository.findUserByUsername(username);
            }

            return { success: true, user: user! };
        } catch (error: any) {
            console.error('LDAP Authentication Error:', error);
            return { success: false, error: 'Error de conexión con el servidor LDAP' };
        }
    }

    /**
     * Test LDAP connection
     */
    async testLDAPConnection() {
        return await this.ldapService.testConnection();
    }
}
