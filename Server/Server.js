const http = require('http');
const PORT = 3000;
const fs = require('fs')
const path = require('path')
const createPath = (page) => path.resolve(__dirname, 'views', '${page}.html')

const server = http.createServer((req, res) => {
    console.log('Server request')
    
    res.setHeader('Content-Type', 'text/html')

    if(req.url = '/'){
        fs.readFile('../Mathematical_Square_Game/Frontend/html/game_index.html', (err,data) =>{
            if(err){
                console.log(err)
                res.end();
            }
            else{
                res.write(data)
                res.end();
            }
        })
    }
});

server.listen(PORT, 'localhost', (error) => {
    error ? console.log(error) : console.log('listening port ${PORT}')
})