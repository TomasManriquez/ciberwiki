import { describe, it, expect, beforeEach } from 'vitest';
import { StandardsService } from './standards.service';
import { standards } from '../db/schema';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

// Mock DB for testing (in-memory)
const sqlite = new Database(':memory:');
const testDb = drizzle(sqlite, { schema: { standards } });

describe('StandardsService', () => {
    let service: StandardsService;

    beforeEach(async () => {
        // Create table
        sqlite.exec(`
            DROP TABLE IF EXISTS standards;
            CREATE TABLE standards (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                version TEXT,
                created_at INTEGER DEFAULT (strftime('%s', 'now'))
            );
        `);

        // Inject test DB
        service = new StandardsService(testDb as any);
    });

    describe('createStandard', () => {
        it('should create a new standard with all fields', async () => {
            const input = {
                name: 'CIS Controls',
                version: 'v8',
                description: 'Center for Internet Security Controls'
            };

            const result = await service.createStandard(input);

            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.name).toBe(input.name);
            expect(result.version).toBe(input.version);
            expect(result.description).toBe(input.description);
            expect(result.createdAt).toBeDefined();

            // Verify in DB
            const stored = await testDb.select().from(standards);
            expect(stored.length).toBe(1);
            expect(stored[0].name).toBe(input.name);
            expect(stored[0].version).toBe(input.version);
            expect(stored[0].description).toBe(input.description);
        });

        it('should create a standard with only required fields', async () => {
            const input = {
                name: 'ISO 27001'
            };

            const result = await service.createStandard(input);

            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.name).toBe(input.name);
            expect(result.description).toBeNull();
            expect(result.version).toBeNull();

            // Verify in DB
            const stored = await testDb.select().from(standards);
            expect(stored.length).toBe(1);
            expect(stored[0].name).toBe(input.name);
        });

        it('should generate a valid UUID for the standard', async () => {
            const input = {
                name: 'NIST Cybersecurity Framework',
                version: '1.1'
            };

            const result = await service.createStandard(input);

            // UUID v4 format validation
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            expect(result.id).toMatch(uuidRegex);
        });

        it('should create multiple standards independently', async () => {
            const input1 = {
                name: 'PCI DSS',
                version: '4.0',
                description: 'Payment Card Industry Data Security Standard'
            };

            const input2 = {
                name: 'HIPAA',
                description: 'Health Insurance Portability and Accountability Act'
            };

            const result1 = await service.createStandard(input1);
            const result2 = await service.createStandard(input2);

            expect(result1.id).not.toBe(result2.id);
            expect(result1.name).toBe(input1.name);
            expect(result2.name).toBe(input2.name);

            // Verify both are in DB
            const stored = await testDb.select().from(standards);
            expect(stored.length).toBe(2);
        });

        it('should persist the created standard correctly', async () => {
            const input = {
                name: 'SOC 2',
                version: 'Type II',
                description: 'Service Organization Control 2'
            };

            const created = await service.createStandard(input);

            // Retrieve the standard using getAllStandards
            const allStandards = await service.getAllStandards();

            expect(allStandards.length).toBe(1);
            expect(allStandards[0].id).toBe(created.id);
            expect(allStandards[0].name).toBe(input.name);
            expect(allStandards[0].version).toBe(input.version);
            expect(allStandards[0].description).toBe(input.description);
        });

        it('should handle special characters in standard name', async () => {
            const input = {
                name: 'ISO/IEC 27001:2013',
                description: 'Information security, cybersecurity & privacy protection'
            };

            const result = await service.createStandard(input);

            expect(result.name).toBe(input.name);
            expect(result.description).toBe(input.description);

            // Verify in DB
            const stored = await testDb.select().from(standards);
            expect(stored[0].name).toBe(input.name);
        });
    });
});
