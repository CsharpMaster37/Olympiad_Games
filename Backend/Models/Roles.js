const {Schema, model} = require('mongoose')

const roleSchema = new Schema({
    value:{
        type: String,
        require: true,
        unique: true,
        default: 'USER'
    },
}, {versionKey: false})

module.exports = model('Role', roleSchema, 'Roles')