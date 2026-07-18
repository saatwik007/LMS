const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

async function connectDrive() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(__dirname, '../config/googleCLientSecret.json'),
            scopes: ['https://www.googleapis.com/auth/drive']
        });

        const drive = google.drive({ version: 'v3', auth });

        const res = await drive.files.list({ pageSize: 10 });
        console.log('✅ Connected to Google Drive');
        // console.log('Files:', res.data.files);
        return res;
    } catch (error) {
        console.error('Error connecting to Google Drive:', error);
        throw error;
    };
};

module.exports = connectDrive;