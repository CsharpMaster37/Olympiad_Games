const { Schema, model } = require('mongoose')

const squareSchema = new Schema({
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    topics: [{
        topic: {
            type: String,
            required: true
        },
        questions: [{
            level: {
                type: Number,
                required: true
            },
            question: {
                type: String,
                required: true
            },
            answer: {
                type: Schema.Types.Mixed,
                required: true
            }
        }]
    }]
}, { versionKey: false });

module.exports = model('Square', squareSchema, 'Square')