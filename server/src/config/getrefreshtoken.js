require('dotenv').config({ path: 'C:\\LMS\\server\\.env' });
const uploadBufferToDrive = require('./driveUpload');

(async () => {
  const buffer = Buffer.from('hello world test file');
  const result = await uploadBufferToDrive(buffer, 'test-upload.txt', 'text/plain');
  console.log('✅ Uploaded:', result);
})();