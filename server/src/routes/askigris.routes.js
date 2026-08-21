const express = require('express');
const multer = require('multer');
const { askIgris, rememberIgris } = require('../controllers/askigris.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/', protect, upload.single('file'), async (req, res) => {
    try {
        const result = req.file
            ? await rememberIgris({ prompt: req.body.question, file: req.file })
            : await askIgris({ prompt: req.body.question });
        return res.json({
            message: "Processed successfully within the monolith",
            ...result
        });
    } catch (error) {
        console.error('Error running Python script:', error);
        res.status(500).json({ error: 'Failed to run Python script' });
    }
});

module.exports = router;