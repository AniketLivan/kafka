const mongoose = require("mongoose");

const message1Schema = new mongoose.Schema({
    key: { type: String, default: null },
    value: { type: String, default: null },
    completed: { type: String, default: null },
}, {read:'primary'});



module.exports = mongoose.model("message", message1Schema)
