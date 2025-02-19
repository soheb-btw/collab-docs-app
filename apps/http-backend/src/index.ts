import prisma from "@repo/db/client";
import express from "express";
import cors from "cors";
import "dotenv/config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// import { auth } from "./middleware/auth";

const app = express();
app.use(cors());
app.use(express.json());



app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
        where: {
            username,
        },
    })

    if (user) {
        res.sendStatus(400);
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser = await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
        },
    });

    const token = jwt.sign(newUser, process.env.JWT_SECRET || 'secret');
    res.json({ message: 'user created successfully', token });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
        where: {
            username,
        },
    })

    if (!user) {
        res.sendStatus(400);
        return;
    }

    if (user.password !== password) {
        res.sendStatus(400);
        return;
    }

    res.sendStatus(200);
});

app.get('/sheet', async (req, res) => {
    console.log('get sheet');
    const sheets = await prisma.sheet.findMany({
        where: {
            slug: '123',
        },
    });    
    console.log(sheets);
    res.json(sheets);
});

app.post('/sheet', async (req, res) => {
    // const { title } = req.body;

    // const user = req.user as any;
// 
    //random slug creation
    // const slug = title.toLowerCase().replace(/\s/g, '-').replace(/[^\w-]+/g, '');

    const newSheet = await prisma.sheet.create({
        data: {
            title:'',
            slug: '123',
            userId: 'cm5bslfj000005034gqylswdl',
            content: '',
            lastUpdateId: Date.now(),
        },
    });
    res.json({ message: 'sheet created successfully', newSheet });
});

app.put('/sheet/:id', async (req, res) => {
    const id = '123';
    const { content } = req.body;
    // const sheet = await prisma.sheet.findFirst({
    //     where: {
    //         slug: id,
    //     },
    // });
    // if (!sheet) {
    //     res.sendStatus(404);
    //     return;
    // }
   await prisma.sheet.update({
        where: {
            slug: id,
        },
        data: {
            content
            // lastUpdateId: Date.now(),
        },
    });

    res.json({ message: 'sheet updated successfully' });
});
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
