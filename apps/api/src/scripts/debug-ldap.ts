
import ldap from 'ldapjs';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

async function debugLdap() {
    console.log('\n--- LDAP Configuration Debugger ---');
    console.log('Use Secure:', process.env.LDAP_URL);
    console.log('CA Cert Path:', process.env.LDAP_CA_CERT_PATH);

    // 1. Verify Certificate File
    let caCert: Buffer | undefined;
    if (process.env.LDAP_CA_CERT_PATH) {
        const certPath = path.resolve(process.cwd(), process.env.LDAP_CA_CERT_PATH);
        console.log('Resolved Cert Path:', certPath);
        if (fs.existsSync(certPath)) {
            console.log('✅ Certificate file found.');
            try {
                caCert = fs.readFileSync(certPath);
                console.log('✅ Certificate content loaded (' + caCert.length + ' bytes).');
            } catch (e: any) {
                console.error('❌ Failed to read certificate:', e.message);
            }
        } else {
            console.error('❌ Certificate file NOT found at this path!');
            console.log('   Current Working Directory:', process.cwd());
        }
    } else {
        console.warn('⚠️ No LDAP_CA_CERT_PATH defined in .env');
    }

    // 2. Test Connection (LDAPS)
    const url = process.env.LDAP_URL || 'ldaps://iam.allware.cl:636';
    const tlsOptions = {
        rejectUnauthorized: false,
        ca: caCert ? [caCert] : undefined
    };

    console.log('\n--- Testing Connection ---');
    console.log('URL:', url);
    console.log('TLS Options:', {
        rejectUnauthorized: tlsOptions.rejectUnauthorized,
        hasCA: !!tlsOptions.ca
    });

    const client = ldap.createClient({
        url,
        tlsOptions,
        connectTimeout: 5000
    });

    client.on('error', (err) => {
        console.error('❌ Client Error Event:', err.message);
        if (err.message.includes('self signed certificate')) {
            console.error('   -> The server is using a self-signed certificate and we either didn\'t load the CA correctly OR the CA in the file does not match the server\'s issuer.');
        }
        process.exit(1);
    });

    client.on('connectTimeout', (err) => {
        console.error('❌ Connect Timeout:', err);
        process.exit(1);
    });

    try {
        await new Promise<void>((resolve, reject) => {
            client.on('connect', () => {
                console.log('✅ Connection established successfully over LDAPS!');
                client.unbind();
                resolve();
            });

            // Just a dummy bind to force connection handshake if needed, 
            // though 'connect' event usually fires on socket connect.
            // Some ldapjs versions lazy-connect.
            // Let's try to verify connectivity by binding as anonymous or invalid
            // merely to test the TLS handshake.
        });
    } catch (e: any) {
        console.error('❌ Connection failed:', e);
    }
}

debugLdap().catch(console.error);
