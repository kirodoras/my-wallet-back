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
            balance: 0,
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
    const { type, value, description } = transaction;

    try {
        const ios = await db.collection("ios").findOne({ idUser: email });

        if (!ios) {
            res.sendStatus(404);
            return;
        }

        const { balance } = ios;
        let newBalance = 0;
        if (type === 'input') {
            newBalance = Number((balance + value).toFixed(2));
        } else {
            newBalance = Number((balance - value).toFixed(2));
        }

        const day = dayjs().format('DD/MM');

        await db.collection("ios").updateOne(
            {
                idUser: email
            },
            {
                $push: {
                    transactions: {
                        $each: [{
                            type,
                            value,
                            description,
                            day
                        }],
                        $position: 0
                    }
                },
                $set: { balance: newBalance }
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

app.get("/ios", async (req, res) => {
    const { email } = req.body;

    try {
        const ios = await db.collection("ios").findOne({ idUser: email });

        if (!ios) {
            res.sendStatus(404);
            return;
        }

        res.status(200).send(ios);
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