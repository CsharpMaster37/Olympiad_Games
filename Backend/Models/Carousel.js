const { Schema, model } = require('mongoose')

const Carousel = new Schema({
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    score_first_question: {
        type: Number,
        required: true
    },
    score_failure: {
        type: Number,
        required: true
    },
    score_success: {
        type: Number,
        required: true
    },
    total_questions: {
        type: Number,
        required: true
    },
    questions: [{
        question: {
            type: String,
            required: true
        },
        answer: {
            type: Schema.Types.Mixed,
            required: true
        }
    }
    ]
}, { versionKey: false });

module.exports = model('Carousel', Carousel, 'Carousel')