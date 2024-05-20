const request = require('supertest');
const app = require('./index');
const fs = require('fs');
const path = require('path');

describe('Express API', () => {
  it('should upload a file successfully', async () => {
    const response = await request(app)
      .post('/upload')
      .attach('file', Buffer.from('This is a test file'), { filename: 'file.txt'});
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('File uploaded successfully');
  });

  it('should download a file successfully', async () => {
    const uploadedFilePath = path.resolve(__dirname, 'uploads', 'file.txt');
    fs.writeFileSync(uploadedFilePath, 'File to be downloaded');
    const response = await request(app).get('/download/file.txt');
    expect(response.status).toBe(200);
    fs.unlinkSync(uploadedFilePath);
  });

  it('should generate a JWT token on login', async () => {
    const response = await request(app).post('/login');
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  it('should access protected route with valid token', async () => {
    const loginResponse = await request(app).post('/login');
    const token = 'Bearer ' + loginResponse.body.token;
    const response = await request(app)
      .get('/protected')
      .set('Authorization', token);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('This is a protected route');
  });

  it('should not access protected route without token', async () => {
    const response = await request(app).get('/protected');
    expect(response.status).toBe(403);
    expect(response.body.message).toBe('No token provided');
  });

  it('should handle errors globally', async () => {
    app.get('/error', (req, res) => {
      throw new Error('Test error');
    });

    const response = await request(app).get('/error');
    expect(response.status).toBe(500);
  });
});
