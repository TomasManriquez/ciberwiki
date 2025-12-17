import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ============== USERS ==============
export const users = sqliteTable('users', {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    username: text('username').unique(), // LDAP username (uid)
    name: text('name'),
    avatar: text('avatar'),
    authProvider: text('auth_provider').default('google'), // 'google' | 'ldap'
    role: text('role').default('user'), // 'admin' | 'user' | 'audience'
    status: text('status').default('active'), // 'active' | 'inactive'
    password: text('password'), // Optional for OAuth/LDAP users
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// ============== STANDARDS ==============
export const standards = sqliteTable('standards', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    version: text('version'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// ============== CONTROLS ==============
export const controls = sqliteTable('controls', {
    id: text('id').primaryKey(),
    standardId: text('standard_id').references(() => standards.id).notNull(),
    code: text('code').notNull(), // e.g. "1.1"
    title: text('title').notNull(),
    description: text('description'),
    status: text('status').default('pending'), // pending, in-progress, completed
    assignedTo: text('assigned_to').references(() => users.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// ============== EVIDENCE ==============
// Categories: DOCUMENT (policies, manuals), CONFIGURATION (firewall, screenshots), PROCESS (checklists, procedures)
export const evidenceCategory = ['DOCUMENT', 'CONFIGURATION', 'PROCESS'] as const;
export const contentTypeEnum = ['FILE', 'TEXT'] as const;

export const evidence = sqliteTable('evidence', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    category: text('category').notNull(), // DOCUMENT | CONFIGURATION | PROCESS
    contentType: text('content_type').notNull(), // FILE | TEXT
    fileUrl: text('file_url'), // Google Drive URL (editable)
    driveFileId: text('drive_file_id'), // Google Drive File ID
    textContent: text('text_content'), // For TEXT type or extracted content
    uploadedBy: text('uploaded_by').references(() => users.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// ============== CONTROL-EVIDENCE (N:M Pivot) ==============
export const controlEvidence = sqliteTable('control_evidence', {
    id: text('id').primaryKey(),
    controlId: text('control_id').references(() => controls.id).notNull(),
    evidenceId: text('evidence_id').references(() => evidence.id).notNull(),
    contextNote: text('context_note'), // Why this evidence applies to this control
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// ============== TAGS ==============
export const tags = sqliteTable('tags', {
    id: text('id').primaryKey(),
    name: text('name').notNull().unique(),
    color: text('color').default('#3B82F6'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const itemsTags = sqliteTable('items_tags', {
    id: text('id').primaryKey(),
    itemId: text('item_id').notNull(),
    tagId: text('tag_id').references(() => tags.id).notNull(),
    itemType: text('item_type').notNull(), // 'page', 'evidence', 'control'
});

// ============== WIKI PAGES ==============
export const pages = sqliteTable('pages', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    content: text('content').notNull(),
    parentId: text('parent_id'),
    relatedControlId: text('related_control_id').references(() => controls.id),
    googleDocId: text('google_doc_id'),
    lastEditedBy: text('last_edited_by').references(() => users.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// ============== AUDIT LOGS ==============
export const auditLogs = sqliteTable('audit_logs', {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => users.id),
    action: text('action').notNull(), // 'LOGIN', 'CREATE_STANDARD', 'DELETE_USER', etc.
    details: text('details'), // JSON string with details
    ipAddress: text('ip_address'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// ============== SETTINGS ==============
export const settings = sqliteTable('settings', {
    id: text('id').primaryKey(),
    key: text('key').notNull().unique(),
    value: text('value').notNull(), // JSON string value
    description: text('description'),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});
