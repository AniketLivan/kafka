const { Kafka } = require("kafkajs")
const conn = require('./db/db');
const Message = require('./model/message')
const Message2 = require('./model/message-table')

const clientId = "my-app"
const brokers = ["localhost:9092"]
const topic = "test-1"

const kafka = new Kafka({ clientId, brokers })
const consumer = kafka.consumer({ groupId: clientId })
const producer = kafka.producer()
const topic2 = "test-2"

const consume = async () => {
	await consumer.connect()
	await consumer.subscribe({ topic })
    const session = await conn.startSession();
	await consumer.run({
		eachMessage: async ({ message }) => {
			console.log(`received message: ${message.key} ${message.value} ${message.offset}`)
            let processedSuccessfully = true;
            do {
                try{
                    session.startTransaction();
                    const msg1 = await Message.create([
                        { 
                            id: message.key,
                            value: message.value
                        }
                    ], { session });
                    const msg2 = await Message2.create([
                        {
                            id: message.key,
                            value: message.value
                        }
                    ], {session});
                    await session.commitTransaction();
                    await producer.send({
                        topic2,
                        messages: [
                            {
                                key: message.key,
                                value: message.value
                            },
                        ],
                    })
                    await sleep(2000);
                }catch(error){
                    console.log(error)
                    await session.abortTransaction();
                    processedSuccessfully = false

                }}while(processedSuccessfully==false)


		},
	})
}

const sleep = (ms) => {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, ms);
    });  
}

module.exports = consume
// consume().catch((err) => {
// 	console.error("error in consumer: ", err)
// })