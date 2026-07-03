require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { google } = require('googleapis');

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);
oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const drive = google.drive({ version: 'v3', auth: oAuth2Client });

async function listAllFiles() {
  let files = [];
  let pageToken = null;

  do {
    const res = await drive.files.list({
      pageSize: 1000,
      pageToken,
      fields: 'nextPageToken, files(id, name, mimeType, createdTime, size, webViewLink)',
      q: process.env.GOOGLE_DRIVE_FOLDER_ID
        ? `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed = false`
        : 'trashed = false',
    });

    files = files.concat(res.data.files);
    pageToken = res.data.nextPageToken;
  } while (pageToken);

  console.log(`Total files: ${files.length}\n`);
  files.forEach((f, i) => {
    console.log(`${i + 1}. ${f.name}`);
    console.log(`   id: ${f.id}`);
    console.log(`   type: ${f.mimeType}`);
    console.log(`   size: ${f.size ? (f.size / 1024).toFixed(1) + ' KB' : 'n/a'}`);
    console.log(`   created: ${f.createdTime}`);
    console.log(`   link: ${f.webViewLink}\n`);
  });

  return files;
}

listAllFiles()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Failed to list files:', err);
    process.exit(1);
  });