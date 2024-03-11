const mongoose = require('mongoose')
const db = 'mongodb+srv://admin:admin@olympiadcluster.xubd4ua.mongodb.net/?retryWrites=true&w=majority&appName=OlympiadCluster'
const User = require('../Models/users')

mongoose
    .connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((res) => console.log('Connected to DB'))
    .catch((error) => console.log(error))

    
