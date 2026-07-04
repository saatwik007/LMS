const { google } = require('googleapis');
const { Readable } = require('stream');

const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
);

oAuth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const drive = google.drive({ version: 'v3', auth: oAuth2Client });

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID; // your "production-posts" folder ID

async function uploadBufferToDrive(buffer, fileName, mimeType = 'image/webp') {
    const fileMetadata = {
        name: fileName,
        ...(FOLDER_ID && { parents: [FOLDER_ID] }),
    };

    const media = {
        mimeType,
        body: Readable.from(buffer)
    };

    const file = await drive.files.create({
        resource: fileMetadata,
        media,
        fields: 'id',
    });

    const fileId = file.data.id;

    await drive.permissions.create({
        fileId,
        requestBody: { role: 'reader', type: 'anyone' },
    });

    const publicUrl = `https://drive.google.com/uc?id=${fileId}`;

    return { fileId, publicUrl };
};

async function deleteFileFromDrive(fileId) {
    if (!fileId) return;

    try {
        await drive.files.delete({ fileId });
    } catch (err) {
        // If it's already gone, don't blow up the whole delete flow over it
        if (err.code === 404) {
            console.warn(`Drive file ${fileId} already deleted or not found`);
        } else {
            throw err;
        }
    }
};

async function streamFileFromDrive(fileId, res) {
    try {
        const file = await drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'stream' }
        );

        res.setHeader('Content-Type', file.headers['content-type'] || 'image/webp');
        file.data.pipe(res);

        file.data.on('error', (err) => {
            console.error('Stream error:', err);
            res.status(500).json({ message: 'Failed to stream file' });
        });
    } catch (err) {
        console.error('Stream from Drive error:', err);
        throw err;
    }
}

module.exports = { uploadBufferToDrive, deleteFileFromDrive, streamFileFromDrive };