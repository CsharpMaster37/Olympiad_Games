const express = require('express')
const app = express()
const PORT = 3000

const path = require('path')

const createPath = (page) => path.resolve(__dirname, '../', `${page}.html`)

app.listen(PORT, (error) => {
    error ? console.log(error) : console.log(`listening port ${PORT}`)
})

app.use(express.static('../Mathematical_Carousel_Game/Frontend'))
app.use(express.static('../Mathematical_Square_Game/Frontend'))
app.use(express.static('../'))

app.get('/', (req, res) => {
    res.sendFile(createPath('Main_Page/Frontend/html/index'))
})

app.get('/square', (req, res) => {
    res.sendFile(createPath('Mathematical_Square_Game/Frontend/html/game_index'))
})

app.get('/carousel', (req, res) => {
    res.sendFile(createPath('Mathematical_Carousel_Game/Frontend/html/index_MathematicalCarousel'))
})




/* app.use((req, res) => {
    res
        .status(404)
}) */