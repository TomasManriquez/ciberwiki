import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { standards, controls, evidence, controlEvidence, users } from './src/db/schema';
import { v4 as uuidv4 } from 'uuid';

const sqlite = new Database('./local.db');
const db = drizzle(sqlite);

async function seed() {
    console.log('🌱 Seeding database...');

    // Create a test user
    const userId = uuidv4();
    await db.insert(users).values({
        id: userId,
        email: 'admin@allware.com',
        name: 'Admin User',
        avatar: null,
    });
    console.log('✅ Created test user');

    // Create standards
    const standard1Id = uuidv4();
    const standard2Id = uuidv4();

    await db.insert(standards).values([
        {
            id: standard1Id,
            name: 'ISO 27001:2022',
            description: 'Information Security Management System standard',
            version: 'v2022',
        },
        {
            id: standard2Id,
            name: 'CIS Controls v8',
            description: 'Center for Internet Security Critical Security Controls',
            version: 'v8.0',
        },
    ]);
    console.log('✅ Created 2 standards');

    // Create controls for ISO 27001
    const control1Id = uuidv4();
    const control2Id = uuidv4();
    const control3Id = uuidv4();

    await db.insert(controls).values([
        {
            id: control1Id,
            standardId: standard1Id,
            code: 'A.5.1',
            title: 'Policies for information security',
            description: 'Information security policy and topic-specific policies shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel and relevant interested parties, and reviewed at planned intervals and if significant changes occur.',
            status: 'in-progress',
            assignedTo: userId,
        },
        {
            id: control2Id,
            standardId: standard1Id,
            code: 'A.5.2',
            title: 'Information security roles and responsibilities',
            description: 'Information security roles and responsibilities shall be defined and allocated according to the organization needs.',
            status: 'pending',
            assignedTo: null,
        },
        {
            id: control3Id,
            standardId: standard2Id,
            code: '1.1',
            title: 'Establish and Maintain Detailed Enterprise Asset Inventory',
            description: 'Establish and maintain an accurate, detailed, and up-to-date inventory of all enterprise assets with the potential to store or process data.',
            status: 'completed',
            assignedTo: userId,
        },
    ]);
    console.log('✅ Created 3 controls');

    // Create evidence
    const evidence1Id = uuidv4();
    const evidence2Id = uuidv4();
    const evidence3Id = uuidv4();

    await db.insert(evidence).values([
        {
            id: evidence1Id,
            name: 'Information Security Policy Document',
            description: 'Corporate information security policy approved by management',
            category: 'DOCUMENT',
            contentType: 'FILE',
            fileUrl: 'https://drive.google.com/file/d/example1',
            driveFileId: 'example1',
            textContent: null,
            uploadedBy: userId,
        },
        {
            id: evidence2Id,
            name: 'Firewall Configuration',
            description: 'Current firewall rules and configuration',
            category: 'CONFIGURATION',
            contentType: 'TEXT',
            fileUrl: null,
            driveFileId: null,
            textContent: 'iptables -A INPUT -p tcp --dport 22 -j ACCEPT\niptables -A INPUT -p tcp --dport 80 -j ACCEPT\niptables -A INPUT -p tcp --dport 443 -j ACCEPT\niptables -P INPUT DROP',
            uploadedBy: userId,
        },
        {
            id: evidence3Id,
            name: 'Asset Inventory Spreadsheet',
            description: 'Complete inventory of all enterprise assets',
            category: 'PROCESS',
            contentType: 'FILE',
            fileUrl: 'https://drive.google.com/file/d/example3',
            driveFileId: 'example3',
            textContent: null,
            uploadedBy: userId,
        },
    ]);
    console.log('✅ Created 3 evidence items');

    // Link evidence to controls
    await db.insert(controlEvidence).values([
        {
            id: uuidv4(),
            controlId: control1Id,
            evidenceId: evidence1Id,
            contextNote: 'This policy document demonstrates compliance with the requirement for documented information security policies.',
        },
        {
            id: uuidv4(),
            controlId: control3Id,
            evidenceId: evidence3Id,
            contextNote: 'Asset inventory spreadsheet shows detailed tracking of all enterprise assets.',
        },
        {
            id: uuidv4(),
            controlId: control3Id,
            evidenceId: evidence2Id,
            contextNote: 'Firewall configuration shows network asset protection measures.',
        },
    ]);
    console.log('✅ Linked evidence to controls');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\nSummary:');
    console.log('- 1 user');
    console.log('- 2 standards (ISO 27001, CIS Controls)');
    console.log('- 3 controls');
    console.log('- 3 evidence items (1 DOCUMENT, 1 CONFIGURATION, 1 PROCESS)');
    console.log('- 3 control-evidence links');
}

seed()
    .catch((error) => {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    })
    .finally(() => {
        sqlite.close();
    });
