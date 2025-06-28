import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { startConsumer } from './kafka/consumer.js';
import { sendMahasiswa, sendMatakuliah } from './kafka/producer.js';
const app = express();
const server = createServer(app);
const io = new Server(server);
const __dirname = dirname(fileURLToPath(import.meta.url));
// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
// Routes
app.get('/', (req, res) => res.render('menu'));
app.get('/mahasiswa', (req, res) => res.render('form-mahasiswa'));
app.get('/consumer', (req, res) => res.render('consumer'));
app.get('/matakuliah', (req, res) => res.render('matakuliah'));
// Handle POST mahasiswa
app.post('/send', async (req, res) => {
    const { nim, nama, email, notelpon, prodi } = req.body;
    const mahasiswa = { nim, nama, email, notelpon, prodi };
    await sendMahasiswa(mahasiswa);
    res.redirect('/mahasiswa');
});
// Handle POST matakuliah
app.post('/send-matakuliah', async (req, res) => {
    const { kodematakuliah, namamatakuliah, semester, sks } = req.body;
    const matkul = {
        kodematakuliah,
        namamatakuliah,
        semester: parseInt(semester),
        sks: parseInt(sks),
    };
    await sendMatakuliah(matkul);
    res.redirect('/matakuliah');
});
// WebSocket koneksi
io.on('connection', (socket) => {
    console.log(' Client connected via WebSocket:', socket.id);
});
// Jalankan Kafka consumer dan kirim ke WebSocket berdasarkan jenis data
startConsumer((payload) => {
    if (payload.type === 'mahasiswa') {
        io.emit('kafka-mahasiswa', payload.data);
    } else if (payload.type === 'matakuliah') {
        io.emit('kafka-matakuliah', payload.data);
    }
});
server.listen(3000, () => {
    console.log(' Web server berjalan di http://localhost:3000');
});