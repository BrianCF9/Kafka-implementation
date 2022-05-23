const { blocked, register } = require("./blocked");
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
    clientID: 'my-app',
    brokers: ['kafka:9092']
});


const attempts_ = (intentos, fecha) => {
    var now_5 = new Date();
    var fechita = new Date(fecha)
    now_5.setTime(fechita.getTime() - (60 * 1000));
    try {
        const res = intentos.filter(date => new Date(date).getTime() > now_5);
        // console.log(res)
        if (res.length >= 5) {
            return true;
        }
    }
    catch {
        return false
    }
    return false;

}

const consume = async () => {
    const consumer = kafka.consumer({ groupId: 'test-group' });


    await consumer.connect()

    try {
        await consumer.subscribe({ topic: 'login', fromBeginning: true })

        await consumer.run({
            eachMessage: ({ message }) => {
                console.log("Login Recibido Exitosamente...")
                const data = JSON.parse(message.value.toString());

                const res = manageUser(data);
                console.log(res, message.value.toString());

            },
        })
    }
    catch (error) {
        console.error("could not read the message")
    }

}

const manageUser = (user) => {

    // console.log(blocked);
    // console.log(register);
    if (blocked.includes(JSON.stringify(user.user.user))) {
        return "Actualmente tu cuenta se encuentra bloqueada, contacta a soporte para poder brindarte ayuda";
    }
    else {

        if (!(JSON.stringify(user.user.user) in register)) {
            var array = []
            array.push(user.fecha);
            register[JSON.stringify(user.user.user)] = array;
            return "Bienvenido a Fruitter, Primer Login Exitoso"
        }
        else {
            register[JSON.stringify(user.user.user)].push(user.fecha);

            if (attempts_(register[JSON.stringify(user.user.user)], user.fecha)) {
                // register[JSON.stringify(user.user.user)].push(user.fecha);
                blocked.push(JSON.stringify(user.user.user));
                return "Has superado el máximo de intentos de inicio de sesión, tu cuenta será bloqueada";
            }
            else {

                return "Lamentamos decir esto, pero tus credenciales no corresponden, inténtalo nuevamente"
            }
        }


    }

};


module.exports = { manageUser, consume };