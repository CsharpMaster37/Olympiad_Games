const { Schema, model } = require('mongoose')

const userSchema = new Schema({
    username: {
        type: String,
        require: true,
        unique: true,
    },
    password: {
        type: String,
        require: true,
    },
    role: {
        type: String,
        ref: 'Role',
    },
    gameProgress: {
        square: {
            values: {
                type: [Number],
                default: [],
            },
            score: {
                type: Number,
                default: 0,
            }
        },
        carousel: {
            values: {
                type: [Number],
                default: [],
            },
            score: {
                type: Number,
                default: 0,
            }
        }
    }
}, { versionKey: false })

module.exports = model('User', userSchema, 'Users')