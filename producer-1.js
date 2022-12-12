const { Kafka } = require("kafkajs")
const clientId = "my-app"
const brokers = ["localhost:9092"]
const topic = "test-1"
const uuid = require("uuid")


const kafka = new Kafka({ clientId, brokers })
const producer = kafka.producer()

const produce = async () => {
	await producer.connect()

	setInterval(async () => {
		try {
			let i = uuid.v4();
			await producer.send({
				topic,
				messages: [
					{
						key: i,
						value: "this is message " + i,
					},
				],
			})
			console.log(i);
		} catch (err) {
			console.error("could not write message " + err)
		}
	}, 10000)
}

produce().catch((err) => {
	console.error("error in producer: ", err)
})
// module.exports = produce