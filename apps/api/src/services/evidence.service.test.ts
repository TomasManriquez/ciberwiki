import { describe, it, expect, beforeEach } from 'vitest';
import { EvidenceService } from './evidence.service';
import { evidence, controlEvidence } from '../db/schema';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

// Mock DB for testing (in-memory)
const sqlite = new Database(':memory:');
const testDb = drizzle(sqlite, { schema: { evidence, controlEvidence } });

describe('EvidenceService', () => {
    let service: EvidenceService;

    beforeEach(async () => {
        // Create tables with new schema
        sqlite.exec(`
            DROP TABLE IF EXISTS control_evidence;
            DROP TABLE IF EXISTS evidence;
            
            CREATE TABLE evidence (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                category TEXT NOT NULL,
                content_type TEXT NOT NULL,
                file_url TEXT,
                drive_file_id TEXT,
                text_content TEXT,
                uploaded_by TEXT,
                created_at INTEGER DEFAULT (strftime('%s', 'now'))
            );
            
            CREATE TABLE control_evidence (
                id TEXT PRIMARY KEY,
                control_id TEXT NOT NULL,
                evidence_id TEXT NOT NULL,
                context_note TEXT,
                created_at INTEGER DEFAULT (strftime('%s', 'now'))
            );
        `);

        // Inject test DB
        service = new EvidenceService(testDb as any);
    });

    it('should create new evidence with category', async () => {
        const input = {
            name: 'Firewall Config',
            description: 'Main firewall ruleset',
            category: 'CONFIGURATION' as const,
            contentType: 'FILE' as const,
        };

        const result = await service.createEvidence(input);

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.name).toBe(input.name);
        expect(result.category).toBe('CONFIGURATION');
        expect(result.contentType).toBe('FILE');
    });

    it('should create text-based evidence', async () => {
        const input = {
            name: 'Process Description',
            category: 'PROCESS' as const,
            contentType: 'TEXT' as const,
            textContent: 'Step 1: Configure firewall\nStep 2: Test rules',
        };

        const result = await service.createEvidence(input);

        expect(result).toBeDefined();
        expect(result.category).toBe('PROCESS');
        expect(result.contentType).toBe('TEXT');
    });
});
