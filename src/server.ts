import 'dotenv/config';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const port = 3000;
const app = express();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

app.get('/movies', async (req, res) => {
    const movies = await prisma.movie.findMany();
    res.json(movies);
});

async function start() {
    try {
        await prisma.$connect();
        app.listen(port, () => {
            console.log(`Servidor em execução na porta ${port}`);
        });
    } catch (e) {
        console.error('Erro ao conectar ao banco:', e);
        process.exit(1);
    }
}

start();

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
