const {Schema, model} = require('mongoose')

const gameSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    }
}, { versionKey: false });

module.exports = model('Game', gameSchema, 'Games')