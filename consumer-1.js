const { Kafka, KafkaJSBrokerNotFound } = require("kafkajs")
const conn = require('./db/db');
const Message = require('./model/message')
const Message2 = require('./model/message-table')

const clientId = "my-app"
const brokers = ["localhost:9092"]
const topic = "test-1"
const kafka = new Kafka({ clientId, brokers })
const consumer = kafka.consumer({ groupId: clientId })

const client_producer_id = "my-app-2"
const kafka_producer = new Kafka({client_producer_id, brokers})
const producer = kafka_producer.producer()


const consume = async () => {
	await consumer.connect()
	await consumer.subscribe({ topics: [topic] })
    await producer.connect()
    const session = await conn.startSession();

    let msg = ""
	await consumer.run({
        autoCommit: false,
		eachMessage: async ({ message }) => {
			console.log(`received message: ${message.key} ${message.value} ${message.offset}`)
            let processedSuccessfully = true;
            do {
                try{                                 
                    session.startTransaction();                    
                    const user = await Message.create([
                        { 
                            key: message.key,
                            value: message.value
                        }
                    ], { session });
                    if(msg=="" ){
                        msg = message.key
                    }
                    if(message.offset%5==0 && msg != message.key){
                        msg = message.key
                        throw KafkaJSBrokerNotFound;
                    } 
                    
                    
                    await Message2.create([
                        {
                            key: message.key,
                            value: message.value
                        }
                    ], { session });
                
                    await producer.send({
                        topic: "test-2",
                        messages: [
                            {
                                key: message.key,
                                value: `{val:${message.value},completed: ${true}}`,
                            },
                        ],
                    })
                    await session.commitTransaction();
                    consumer.commitOffsets([
                        { topic: 'test-1', partition: 0, offset: message.offset }])
                    console.log("successful commit")
                    processedSuccessfully = true
                    await sleep(2000);
                }catch(error){
                    console.log(error)
                    await session.abortTransaction();
                    processedSuccessfully = false
                }
            }while(!processedSuccessfully)


		},
	})
}

const sleep = (ms) => {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, ms);
    });  
}

// module.exports = consume
consume().catch((err) => {
	console.error("error in consumer: ", err)
})

//mongod --replSet rs0 --dbpath=C:\data\db --port 27018 --bind_ip localhost
//mongo --port 27018