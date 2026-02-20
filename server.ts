import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { nanoid } from 'nanoid';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.resolve();
const PORT = 3000;
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Database setup
const db = new Database('quickshare.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    room_id TEXT,
    filename TEXT,
    original_name TEXT,
    mimetype TEXT,
    size INTEGER,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(room_id) REFERENCES rooms(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT,
    sender TEXT,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(room_id) REFERENCES rooms(id)
  );
`);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

app.use(express.json());

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const fileId = nanoid();
    cb(null, fileId + path.extname(file.originalname));
  },
});
const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// API Routes
app.post('/api/rooms', (req, res) => {
  const roomId = nanoid(10);
  db.prepare('INSERT INTO rooms (id) VALUES (?)').run(roomId);
  res.json({ roomId });
});

app.get('/api/rooms/:id', (req, res) => {
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json(room);
});

app.get('/api/rooms/:id/files', (req, res) => {
  const files = db.prepare('SELECT * FROM files WHERE room_id = ? ORDER BY uploaded_at DESC').all(req.params.id);
  res.json(files);
});

app.post('/api/rooms/:id/upload', upload.single('file'), (req, res) => {
  const roomId = req.params.id;
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const fileId = nanoid();
  db.prepare(`
    INSERT INTO files (id, room_id, filename, original_name, mimetype, size)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(fileId, roomId, file.filename, file.originalname, file.mimetype, file.size);

  const fileData = {
    id: fileId,
    room_id: roomId,
    filename: file.filename,
    original_name: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    uploaded_at: new Date().toISOString()
  };

  io.to(roomId).emit('file_uploaded', fileData);
  res.json(fileData);
});

app.get('/api/files/:fileId/download', (req, res) => {
  const file = db.prepare('SELECT * FROM files WHERE id = ?').get(req.params.fileId);
  if (!file) return res.status(404).json({ error: 'File not found' });

  const filePath = path.join(UPLOADS_DIR, file.filename);
  res.download(filePath, file.original_name);
});

app.get('/api/rooms/:id/messages', (req, res) => {
  const messages = db.prepare('SELECT * FROM messages WHERE room_id = ? ORDER BY timestamp ASC').all(req.params.id);
  res.json(messages);
});

// Socket.io logic
io.on('connection', (socket) => {
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('send_message', (data) => {
    const { room_id, sender, content } = data;
    const info = db.prepare('INSERT INTO messages (room_id, sender, content) VALUES (?, ?, ?)').run(room_id, sender, content);
    
    const message = {
      id: info.lastInsertRowid,
      room_id,
      sender,
      content,
      timestamp: new Date().toISOString()
    };
    
    io.to(room_id).emit('receive_message', message);
  });

  socket.on('typing', (data) => {
    socket.to(data.room_id).emit('user_typing', data);
  });
});

// Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
