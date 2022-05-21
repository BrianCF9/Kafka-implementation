const { Kafka } = require("kafkajs")

// user {
//     user,
//     pass,
//     logs[],
//     blocked,
// }
const kafka = new Kafka({
    clientID: 'my-app',
    brokers: ['kafka:9092']
});


const produce = async (user, pass) => {
    const producer = kafka.producer()
    await producer.connect()
    try {

        await producer.send({
            topic: 'login',
            messages: [
                {
                    value: JSON.stringify({
                        user: user,
                        pass: pass,
                        fecha: new Date(Date.now()),
                    })
                },
            ],
        })

    } catch (err) {
        console.error("could not write message " + err)
    }


}

const manageUser = (user) => {
    console.log(user);

    produce(user).catch((err) => {
        console.error("error in producer: ", err)
    })
    return "Enviando intento a Kafka"
}

module.exports = { manageUser, produce };