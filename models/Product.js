const mongoose = require('mongoose');

// CREATE USER SCHEMA
const userSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: [String],
    color: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    etc: {
        type: String,
        required: false
    }
});

const User = module.exports = mongoose.model('Product', userSchema);