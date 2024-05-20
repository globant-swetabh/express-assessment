const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// JWT secret key
const JWT_SECRET = 'X9gLJ8zMfC2!QfB3#t6N$Gx7@a0V2Lr8';

// Middleware for global error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ code: 500, message: 'Something went wrong' });
});

// Middleware to validate JWT token
const validateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Authorization header:', authHeader); // Log the authorization header
  if (!authHeader) return res.status(403).send({ message: 'No token provided' });

  const token = authHeader.split(' ')[1]; // Extract the token part from the header
  if (!token) return res.status(403).send({ message: 'Invalid token format' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('JWT verification error:', err); // Log any errors in verification
      return res.status(500).send({ message: 'Failed to authenticate token' });
    }

    req.userId = decoded.id;
    console.log('Decoded JWT:', decoded); // Log the decoded JWT payload
    next();
  });
};

// API to upload file
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded' });
  }
  res.send({ message: 'File uploaded successfully' });
});

// API to serve static files
app.use('/static', express.static(path.join(__dirname, 'public')));

// API to download file
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send({ message: 'File not found' });
    }
    res.download(filePath);
  });
});

// API to generate JWT token
app.post('/login', (req, res) => {
  const user = { id: 1, username: 'testuser' }; // Mock user for demonstration
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Protected route example
app.get('/protected', validateToken, (req, res) => {
  res.send({ message: 'This is a protected route', userId: req.userId });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;
