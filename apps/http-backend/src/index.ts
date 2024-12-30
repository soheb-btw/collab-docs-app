import prisma from "@repo/db/client";
import express from "express";
import cors from "cors";
import "dotenv/config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { auth } from "./middleware/auth";

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

app.post('/login', auth, async (req, res) => {
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


app.post('/sheet', auth, async (req, res) => {
    const { title } = req.body;

    const user = req.user as any;

    //random slug creation
    const slug = title.toLowerCase().replace(/\s/g, '-').replace(/[^\w-]+/g, '');

    const newSheet = await prisma.sheet.create({
        data: {
            title,
            slug,
            userId: user.id,
            content: '',
            lastUpdateId: Date.now(),
        },
    });
    res.json({ message: 'sheet created successfully', newSheet });
});