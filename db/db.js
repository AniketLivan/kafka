const mongoose = require('mongoose'); 
let config = {db:'mongodb://127.0.0.1:27018/kafka?replicaSet=rs0'}
var options = {

  db: {
      native_parser: true
  },

  // This block gets run for a non replica set connection string (eg. localhost with a single DB)
  server: {
      poolSize: 5,
      reconnectTries: Number.MAX_VALUE,
      ssl: false,
      sslValidate: false,
      socketOptions: {
          keepAlive: 1000,
          connectTimeoutMS: 30000
      }
  },

  // This block gets run when the connection string indicates a replica set (comma seperated connections)
  replicaSet: {
      auto_reconnect: false,
      poolSize: 10,
      connectWithNoPrimary: true,
      ssl: true,
      sslValidate: false,
      socketOptions: {
          keepAlive: 1000,
          connectTimeoutMS: 30000
      }
  }
};


mongoose.connect(config.db)
const conn = mongoose.connection;

// mongoose.connect('mongodb://127.0.0.1:27018/message?replicaSet=kafka', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

conn.on('error', () => console.error.bind(console, 'connection error'));

conn.once('open', () => console.info('Connection to Database is successful'));

module.exports = conn;