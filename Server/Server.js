const express = require('express')
const app = express()
const PORT = 3000
const User = require('../Database/db')

const path = require('path')

const createPath = (page) => path.resolve(__dirname, '../', `${page}.ejs`)

app.listen(PORT, (error) => {
    error ? console.log(error) : console.log(`listening port ${PORT}`)
})

app.use(express.static('../Mathematical_Carousel_Game/Frontend'))
app.use(express.static('../Mathematical_Square_Game/Frontend'))
app.use(express.static('../Registration_Page/Frontend'))
app.use(express.static('../Login_Page/Frontend'))
app.use(express.static('../'))

app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.render(createPath('Main_Page/Frontend/html/index'))
})

app.get('/square', (req, res) => {
    res.render(createPath('Mathematical_Square_Game/Frontend/html/game_index'))
})

app.get('/carousel', (req, res) => {
    res.render(createPath('Mathematical_Carousel_Game/Frontend/html/index_MathematicalCarousel'))
})

app.get('/signup', (req, res) => {
    res.render(createPath('Registration_Page/Frontend/html/registration'))
})

app.get('/signin', (req, res) => {
    res.render(createPath('Login_Page/Frontend/html/login'))
})

app.post('/signup', (req, res) => {
    const { username, password, repeatpassword } = req.body
    const user = new User({ username, password })
    user
        .save()
        .then((result) => res.send(result))
        .catch((error) => console.log(error))
})