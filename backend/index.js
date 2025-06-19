const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Handle file uploads
app.post('/upload', upload.array('files'), (req, res) => {
    res.json({ message: 'Files uploaded successfully', files: req.files });
});

// List all files
app.get('/files', (req, res) => {
    const uploadPath = path.join(__dirname, 'uploads');
    fs.readdir(uploadPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to scan directory' });
        }
        
        const fileData = files.map(file => {
            const filePath = path.join(uploadPath, file);
            const stats = fs.statSync(filePath);
            return {
                name: file,
                size: stats.size
            };
        });
        
        res.json(fileData);
    });
});

// Download file
app.get('/download', (req, res) => {
    const filename = req.query.file;
    const filePath = path.join(__dirname, 'uploads', filename);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
