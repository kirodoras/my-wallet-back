import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
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

app.post("/sign-up", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const user = await db.collection("users").findOne({ email: email });

        if (user) {
            res.sendStatus(409);
            return;
        }

        const passwordHash = bcrypt.hashSync(password, 10);

        const _id = ObjectId();

        await db.collection("users").insertOne({
            _id,
            name,
            email,
            passwordHash
        });

        await db.collection("ios").insertOne({
            idUser: _id,
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

app.post("/sign-in", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db.collection("users").findOne({ email: email });

        if (!user) {
            res.sendStatus(404);
            return;
        }

        if (user && bcrypt.compareSync(password, user.passwordHash)) {
            const token = uuid();

            const userSession = await db.collection("sessions").findOne({ idUser: user._id });

            if (userSession) {
                await db.collection("sessions").updateOne(
                    { _id: userSession._id },
                    { $set: { token } }
                );

            } else {
                await db.collection("sessions").insertOne({
                    idUser: user._id,
                    token
                });
            }
            res.status(202).send({
                name: user.name,
                token
            });
            return;
        } else {
            res.sendStatus(401);
            return;
        }
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
        return;
    }
});

app.post("/ios", async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
    const { type, value, description } = req.body;

    try {
        const userSession = await db.collection("sessions").findOne({ token: token });

        if (!userSession) {
            res.sendStatus(400);
            return;
        }

        const ios = await db.collection("ios").findOne({ idUser: userSession.idUser });

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
                idUser: userSession.idUser
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
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');

    try {
        const userSession = await db.collection("sessions").findOne({ token: token });

        if (!userSession) {
            res.sendStatus(400);
            return;
        }

        const ios = await db.collection("ios").findOne({ idUser: userSession.idUser });

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