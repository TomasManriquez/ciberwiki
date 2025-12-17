import ldap, { Client, SearchOptions } from 'ldapjs';
import { ldapConfig, buildUserDN, getLdapUrl } from '../config/ldap.config';

export interface LdapUserProfile {
    uid: string;
    email: string;
    name: string;
    dn: string;
}

export class LdapService {
    private createClient(): Client {
        const url = getLdapUrl();

        const clientOptions: ldap.ClientOptions = {
            url,
            connectTimeout: ldapConfig.connectTimeout,
            tlsOptions: ldapConfig.tlsOptions,
        };

        return ldap.createClient(clientOptions);
    }

    /**
     * Authenticate user against FreeIPA LDAP
     * Uses simple bind with user's credentials
     */
    async authenticateUser(username: string, password: string): Promise<LdapUserProfile | null> {
        return await this.tryAuthenticate(username, password);
    }

    private async tryAuthenticate(username: string, password: string): Promise<LdapUserProfile | null> {
        const client = this.createClient();
        const userDN = buildUserDN(username);

        return new Promise((resolve, reject) => {
            // Bind with user credentials (simple bind authentication)
            client.bind(userDN, password, async (bindErr) => {
                if (bindErr) {
                    client.unbind();

                    // Invalid credentials
                    if (bindErr.name === 'InvalidCredentialsError') {
                        resolve(null);
                        return;
                    }

                    // No such user
                    if (bindErr.name === 'NoSuchObjectError') {
                        resolve(null);
                        return;
                    }

                    reject(bindErr);
                    return;
                }

                // Authentication successful, fetch user profile
                try {
                    const profile = await this.fetchUserProfile(client, userDN, username);
                    client.unbind();
                    resolve(profile);
                } catch (searchErr) {
                    client.unbind();
                    reject(searchErr);
                }
            });
        });
    }

    private async fetchUserProfile(client: Client, userDN: string, username: string): Promise<LdapUserProfile> {
        return new Promise((resolve, reject) => {
            const searchOptions: SearchOptions = {
                scope: 'base',
                attributes: ['uid', 'mail', 'cn', 'displayName', 'givenName', 'sn'],
            };

            client.search(userDN, searchOptions, (searchErr, res) => {
                if (searchErr) {
                    reject(searchErr);
                    return;
                }

                let userProfile: LdapUserProfile | null = null;

                res.on('searchEntry', (entry) => {
                    const attrs = entry.pojo.attributes;

                    const getAttribute = (name: string): string => {
                        const attr = attrs.find(a => a.type.toLowerCase() === name.toLowerCase());
                        return attr?.values?.[0] || '';
                    };

                    // Build full name from available attributes
                    let name = getAttribute('displayName') || getAttribute('cn');
                    if (!name) {
                        const givenName = getAttribute('givenName');
                        const sn = getAttribute('sn');
                        name = [givenName, sn].filter(Boolean).join(' ') || username;
                    }

                    userProfile = {
                        uid: getAttribute('uid') || username,
                        email: getAttribute('mail') || `${username}@allware.cl`,
                        name: name,
                        dn: userDN,
                    };
                });

                res.on('error', (err) => {
                    reject(err);
                });

                res.on('end', () => {
                    if (userProfile) {
                        resolve(userProfile);
                    } else {
                        // Return basic profile if search returned no attributes
                        resolve({
                            uid: username,
                            email: `${username}@allware.cl`,
                            name: username,
                            dn: userDN,
                        });
                    }
                });
            });
        });
    }

    /**
     * Test LDAP connection without authentication
     */
    async testConnection(): Promise<{ success: boolean; message: string }> {
        const client = this.createClient();

        return new Promise((resolve) => {
            client.on('connect', () => {
                client.unbind();
                resolve({ success: true, message: 'LDAP connection successful' });
            });

            client.on('error', (err) => {
                resolve({ success: false, message: `LDAP connection failed: ${err.message}` });
            });

            // Timeout handling
            setTimeout(() => {
                client.unbind();
                resolve({ success: false, message: 'LDAP connection timeout' });
            }, ldapConfig.connectTimeout);
        });
    }
}
