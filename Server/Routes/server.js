const express = require("express")
const { Kafka } = require("kafkajs")
const { Router } = require("express");
const { blocked } = require("./controllers/blocked");
const { consume } = require("./controllers/usersController")
const app = express();
const router = Router()



app.use(router.get('/', (req, res) => {
    res.send('Hola mundo');
    consume().catch((err) => {
        console.error("error in consumer: ", err)
    });
}))

app.use(router.get('/blocked', (req, res) => {
    const respuesta = {
        users_blocked: blocked,
    }
    res.send(respuesta);
}))

app.listen(3001, () => {
    console.log(`API-Blocked run in: http://localhost:3001.`)
});
