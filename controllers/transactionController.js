import { db } from '../databases/mongoClientDb.js';
import dayjs from 'dayjs';

export async function insertTransaction(req, res) {
    const { type, value, description } = req.body;
    const token = res.locals.token;

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
}

export async function getTransactions(req, res) {
    const token = res.locals.token;

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
}