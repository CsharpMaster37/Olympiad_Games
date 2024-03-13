const express = require('express')
const app = express()
const mongoose = require('mongoose')
const authRouter = require('./authRouter')
const PORT = 3000

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use("", authRouter)

const path = require('path')

const createPath = (page) => path.resolve('Frontend', `${page}.ejs`)

const start = async () => {
    try{
        await mongoose.connect('mongodb+srv://admin:admin@olympiadcluster.xubd4ua.mongodb.net/OlympiadDB?retryWrites=true&w=majority&appName=OlympiadCluster')
        app.listen(PORT, () => console.log(`listening port ${PORT}`))
    }
    catch(e){
        console.log(e)
    }
}

start()

const staticPaths = [
    'Frontend',
    'Frontend/Common_Elements',
    'Frontend/Square_game',
    'Frontend/Carousel_game',
    'Frontend/Register',
    'Frontend/Login',
    'Frontend/Main'
];

// Используем один обработчик для всех статических файлов
staticPaths.forEach(path => {
    app.use(express.static(path));
});


app.get('/', (req, res) => {
    res.render(createPath('Main/index'))
})

app.get('/square', (req, res) => {
    res.render(createPath('Square_game/game_index'))
})

app.get('/carousel', (req, res) => {
    res.render(createPath('Carousel_game/index_MathematicalCarousel'))
})

app.get('/signup', (req, res) => {
    res.render(createPath('Register/registration'))
})

app.get('/signin', (req, res) => {
    res.render(createPath('Login/login'))
})
