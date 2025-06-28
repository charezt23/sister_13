import { Kafka } from 'kafkajs';
const kafka = new Kafka({
    clientId: 'web-producer',
    brokers: ['localhost:9092'],
});
const producer = kafka.producer();
await producer.connect();
export const sendMahasiswa = async (value) => {
    await producer.send({
        topic: 'web-messages',
        messages: [{ value: JSON.stringify(value) }],
    });
};
export const sendMatakuliah = async (value) => {
    await producer.send({
        topic: 'web-matakuliah',
        messages: [{ value: JSON.stringify(value) }],
    });
};