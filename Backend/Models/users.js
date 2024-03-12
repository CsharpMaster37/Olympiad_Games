const {Schema, model} = require('mongoose')

const userSchema = new Schema({
    username:{
        type: String,
        require: true,
        unique: true,
    },
    password:{
        type: String,
        require:true,
    },
    roles: [{type: String, ref: 'Role'}]
}, {versionKey: false})

module.exports = model('User', userSchema, 'Users')