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
            return res.status(409).send({
                message: 'Já existe um filme cadastrado com esse título',
            });
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

// app.put('/movies/:id', async (req, res) => {
//     //Pegar o id do registro que vai ser atualizado
//     const id = Number(req.params.id);

//     try {
//         const movie = await prisma.movie.findUnique({
//             where: { id },
//         });

//         if (!movie) {
//             return res.status(404).send({ message: 'Filme não encontrado' });
//         }

//         //Retornar o status correto informando que o filme foi atualizado
//         res.status(200).send();

//         const data = { ...req.body };
//         data.release_date = data.release_date
//             ? new Date(data.release_date)
//             : undefined;

//         //Pegar os dados  do filme que será atualizado e atualizar ele no prisma
//         await prisma.movie.update({ where: { id }, data });
//     } catch (error) {
//         return res
//             .status(500)
//             .send({ message: 'Falha ao atualizar o registro' });
//     }
// });

app.put('/movies/:id', async (req, res) => {
    const id = Number(req.params.id);

    try {
        // 1. Verifica existência
        const movie = await prisma.movie.findUnique({
            where: { id },
        });

        if (!movie) {
            return res.status(404).send({ message: 'Filme não encontrado' });
        }

        // 2. Limpeza de dados (Garante que não tentamos atualizar o ID)
        const { id: bodyId, ...updateData } = req.body; 

        if (updateData.release_date) {
            updateData.release_date = new Date(updateData.release_date);
        }

        // 3. Atualização
        const updatedMovie = await prisma.movie.update({
            where: { id },
            data: updateData,
        });

        // 4. Resposta de sucesso DENTRO do try
        return res.status(200).json(updatedMovie);

    } catch (error) {
        console.error("Erro Prisma:", error); // Importante para você ver o erro real no terminal
        return res.status(500).send({ 
            message: 'Falha ao atualizar o registro',
            error: error.message 
        });
    }
});

app.delete("/movies/:id", async (req, res) => {
   const id = Number(req.params.id);

   try{
     const movie = await prisma.movie.findUnique({
     where: { id }})

 

     if (!movie) {
        return res.status(404).send({ message: 'Filme não encontrado' });
     }

       await prisma.movie.delete({ where: { id }});
   
     }catch(error) {
       res.status(500).send({ message: 'Falha ao remover o registro' });
     }
   
 res.status(200).send();
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
