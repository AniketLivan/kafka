const mongoose = require('mongoose');

const message2Schema = new mongoose.Schema({
    key: { type: String, default: null },
    value: { type: String, default: null },
    completed: { type: String, default: null },
});

module.exports = mongoose.model("message-2", message2Schema)
