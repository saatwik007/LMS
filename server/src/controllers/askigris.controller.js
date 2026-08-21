const { spawn } = require('child_process');
const path = require('path');

const runPython = (data) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.resolve(__dirname, '../../RAG/server.py');
        const pythonExecutable = process.env.PYTHON_EXECUTABLE || 'python';

        const pythonProcess = spawn(pythonExecutable, [scriptPath], {
            cwd: path.dirname(scriptPath),
            windowsHide: true,
        });

        let output = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        pythonProcess.on('error', (error) => {
            reject(new Error(`Failed to start Python: ${error.message}`));
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`Python script exited with code ${code}: ${errorOutput}`));
            }
            try {
                resolve(JSON.parse(output));
            } catch (error) {
                reject(new Error(`Failed to parse Python output: ${error.message}`));
            }
        });

        pythonProcess.stdin.write(JSON.stringify(data));
        pythonProcess.stdin.end();
    });
};

const askIgris = (data) => runPython({ action: 'ask', ...data });

const rememberIgris = ({ prompt, file }) => runPython({
    action: 'remember',
    prompt,
    file: {
        filename: file.originalname,
        contentType: file.mimetype,
        data: file.buffer.toString('base64'),
    },
});

module.exports = { askIgris, rememberIgris };