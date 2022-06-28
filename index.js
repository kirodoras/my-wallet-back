import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import joi from 'joi';
import dayjs from 'dayjs';

dotenv.config();

const port = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use(cors());

const mongoClient = new MongoClient(process.env.MONGO_URI);

let db;
mongoClient.connect().then(() => {
    db = mongoClient.db("myWallet");
});

app.post("/user", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const user = await db.collection("users").findOne({ email: email });

        if (user) {
            res.sendStatus(409);
            return;
        }

        await db.collection("users").insertOne({
            name,
            email,
            password
        });

        await db.collection("ios").insertOne({
            idUser: email,
            transactions: []
        });

        res.sendStatus(201);
        return;
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
        return;
    }
});

app.get("/user", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db.collection("users").findOne({ email: email });

        if (!user) {
            res.sendStatus(404);
            return;
        }

        if (password !== user.password) {
            res.sendStatus(401);
            return;
        }

        res.status(202).send(user);
        return;
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
        return;
    }
});

app.post("/ios", async (req, res) => {
    const { email, transaction } = req.body;

    try {
        const ios = await db.collection("ios").findOne({ idUser: email });

        if (!ios) {
            res.sendStatus(404);
            return;
        }

        await db.collection("ios").updateOne(
            {
                idUser: email
            },
            {
                $push: { transactions: transaction }
            }
        );

        res.sendStatus(201);
        return;
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
        return;
    }
});

app.listen(port, () => {
    console.log(`Running on ${port}`);
});