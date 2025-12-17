import { google } from 'googleapis';
import { Readable } from 'stream';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

export class DriveService {
    private drive;

    constructor() {
        const oauth2Client = new google.auth.OAuth2(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            GOOGLE_REDIRECT_URI
        );

        if (GOOGLE_REFRESH_TOKEN) {
            oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
        }

        this.drive = google.drive({ version: 'v3', auth: oauth2Client });
    }

    async uploadFile(file: File, name: string, mimeType: string) {
        if (!DRIVE_FOLDER_ID) {
            throw new Error('GOOGLE_DRIVE_FOLDER_ID is not configured');
        }

        // Convert File/Blob to Stream
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const stream = Readable.from(buffer);

        const response = await this.drive.files.create({
            requestBody: {
                name,
                parents: [DRIVE_FOLDER_ID],
            },
            media: {
                mimeType,
                body: stream,
            },
            fields: 'id, webViewLink, webContentLink',
        });

        return response.data;
    }

    async deleteFile(fileId: string) {
        await this.drive.files.delete({
            fileId,
        });
    }

    async getFile(fileId: string) {
        const response = await this.drive.files.get({
            fileId,
            fields: 'id, name, mimeType, webViewLink, webContentLink',
        });
        return response.data;
    }

    async extractFileContent(fileId: string, mimeType: string): Promise<string | null> {
        try {
            // Only attempt extraction for Google Docs for now
            if (mimeType === 'application/vnd.google-apps.document') {
                const response = await this.drive.files.export({
                    fileId,
                    mimeType: 'text/plain',
                });
                return response.data as string;
            }
            return null;
        } catch (error) {
            console.error('Error extracting file content:', error);
            return null;
        }
    }
}
