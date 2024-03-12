const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    username:{
        type: String,
        require: true,
    },
    password:{
        type: String,
        require:true,
    },
}, {versionKey: false})

const User = mongoose.model('User', userSchema, 'Users')
module.exports = User