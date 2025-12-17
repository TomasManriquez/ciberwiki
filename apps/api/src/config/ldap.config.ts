import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// LDAP Configuration for FreeIPA
// Server: iam.allware.cl
// Supports LDAPS (636) and LDAP (389)

const caCertPath = process.env.LDAP_CA_CERT_PATH;
let caCert: Buffer | undefined;

if (caCertPath) {
    try {
        const resolvedPath = resolve(process.cwd(), caCertPath);
        if (existsSync(resolvedPath)) {
            caCert = readFileSync(resolvedPath);
            console.log('✅ Loaded LDAP CA Certificate from:', resolvedPath);
        } else {
            console.warn('⚠️ LDAP CA Certificate not found at:', resolvedPath);
        }
    } catch (error) {
        console.error('❌ Error reading LDAP CA Certificate:', error);
    }
}

export const ldapConfig = {
    // LDAP Server URL - Use LDAPS for secure connections
    url: process.env.LDAP_URL || 'ldaps://iam.allware.cl:636',

    // Base DN for FreeIPA
    baseDN: process.env.LDAP_BASE_DN || 'dc=allware,dc=cl',

    // User search base - where users are stored in FreeIPA
    userSearchBase: process.env.LDAP_USER_SEARCH_BASE || 'cn=users,cn=accounts,dc=allware,dc=cl',

    // Attribute used for username (uid for FreeIPA)
    usernameAttribute: process.env.LDAP_USERNAME_ATTR || 'uid',

    // Optional: Service account for searching users (if anonymous bind is not allowed)
    bindDN: process.env.LDAP_BIND_DN || '',
    bindPassword: process.env.LDAP_BIND_PASSWORD || '',

    // Path to CA certificate for LDAPS (optional, for self-signed certs)
    caCertPath: process.env.LDAP_CA_CERT_PATH || '',

    // Connection timeout in milliseconds
    connectTimeout: parseInt(process.env.LDAP_CONNECT_TIMEOUT || '5000'),

    // TLS options
    tlsOptions: {
        // Default to TRUE (secure) unless explicitly set to 'false'
        rejectUnauthorized: process.env.LDAP_TLS_REJECT_UNAUTHORIZED !== 'false',
        ca: caCert,
    },
};

// Build user DN from username
export function buildUserDN(username: string): string {
    return `uid=${username},${ldapConfig.userSearchBase}`;
}

// Get LDAP URL
export function getLdapUrl(): string {
    return ldapConfig.url;
}
