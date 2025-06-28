import { Kafka } from 'kafkajs';
import mysql from 'mysql2/promise';
const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kampus',
});
const kafka = new Kafka({
    clientId: 'web-consumer',
    brokers: ['localhost:9092'],
});
const consumer = kafka.consumer({ groupId: 'web-group' });
export const startConsumer = async (onMessage) => {
    await consumer.connect();
    // Subscribe ke dua topik
    await consumer.subscribe({ topic: 'web-messages', fromBeginning: false });
    await consumer.subscribe({ topic: 'web-matakuliah', fromBeginning: false });
    await consumer.run({
        eachMessage: async ({ topic, message }) => {
            const value = message.value.toString();
            try {
                const data = JSON.parse(value);
                if (topic === 'web-messages') {
                    await db.execute(
                        `INSERT INTO mahasiswa (nim, nama, email, notelpon, prodi)
VALUES (?, ?, ?, ?, ?)`,
                        [data.nim, data.nama, data.email, data.notelpon, data.prodi]
                    );
                    console.log(` Mahasiswa disimpan: ${data.nim}`);
                    onMessage({ type: 'mahasiswa', data });
                } else if (topic === 'web-matakuliah') {
                    await db.execute(
                        `INSERT INTO matakuliah (kodematakuliah, namamatakuliah, semester, sks)
VALUES (?, ?, ?, ?)`,
                        [data.kodematakuliah, data.namamatakuliah, data.semester, data.sks]
                    );
                    console.log(` Matakuliah disimpan: ${data.kodematakuliah}`);
                    onMessage({ type: 'matakuliah', data });
                }
            } catch (err) {
                console.error('❌ Error proses consumer:', err.message);
            }
        },
    });
};