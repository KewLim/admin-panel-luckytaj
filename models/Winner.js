const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 50
    },
    amount: {
        type: String,
        required: true
    },
    game: {
        type: String,
        required: true,
        maxlength: 100
    },
    timeAgo: {
        type: String,
        required: true,
        enum: ['2 mins ago', '5 mins ago', '10 mins ago', '15 mins ago', '30 mins ago', '1 hour ago']
    },
    active: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Winner', winnerSchema);