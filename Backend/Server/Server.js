const express = require('express')
const app = express()
const PORT = 3000
const User = require('../Database/db')

const path = require('path')

const createPath = (page) => path.resolve('Frontend', `${page}.ejs`)

app.listen(PORT, (error) => {
    error ? console.log(error) : console.log(`listening port ${PORT}`)
})

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

app.use(express.urlencoded({ extended: false }))

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

app.post('/signup', (req, res) => {
    const { username, password, repeatpassword } = req.body
    const user = new User({ username, password })
    user
        .save()
        .then((result) => res.send(result))
        .catch((error) => console.log(error))
})