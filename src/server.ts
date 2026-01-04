import 'dotenv/config';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const port = 3000;
const app = express();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

app.use(express.json());

app.get('/movies', async (_, res) => {
    const movies = await prisma.movie.findMany({
        orderBy: {
            title: 'asc',
        },
        include: {
            genres: true,
            languages: true,
        },
    });
    res.json(movies);
});

app.post('/movies', async (req, res) => {
    const { title, genre_id, language_id, oscar_count, release_date } =
        req.body;
    try {
        
        //Verificar no banco se já existe um filme com o nome que está sendo enviado
        //case insesitive - se a busca for feita por john wick ou John wick ou JOHN WICK, o registro vai ser retornado na consulta
        //case sensitive - se buscar por john wick e no banco estiver John wick, não vai ser retornado na consulta

        const movieWithSameTitle = await prisma.movie.findFirst({
            where: {
                title: { equals: title, mode: 'insensitive' },
            },
        });

        if (movieWithSameTitle) {
            return res
                .status(409)
                .send({ message: 'Já existe um filme cadastrado com esse título' });
        }

        await prisma.movie.create({
            data: {
                title,
                genre_id,
                language_id,
                oscar_count,
                //o mês começa em 0 e vai até 11
                release_date: new Date(release_date),
            },
        });
    } catch (error) {
        return res.status(500).send({ message: 'Falha ao cadastrar um filme' });
    }
    res.status(201).send();
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
