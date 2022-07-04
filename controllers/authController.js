import { ObjectId } from 'mongodb';
import { db } from '../databases/mongoClientDb.js';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

export async function registerUser(req, res) {
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
}

export async function connectUser(req, res) {
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
}