const http = require('http')
const fs = require('fs')        //file system
const { error } = require('console')
const port = process.env.PORT || 3001
const server = http.createServer((req, res) => {
    if(req.url === '/') {
        fs.readFile('index.html', (error, data) => {
            if (error){
                console.log (error)
               }
               else {
                res.write(data)
                res.end()
               }
        })
    }
    else if(req.url === '/hanoi') {
        fs.readFile('hanoi.html', (error, data) => {
           if (error){
            console.log (error)
           }
           else {
            res.write(data)
            res.end()
           }
        })
    }
    else if(req.url === '/hcm') {
        fs.readFile('hcm.html', (error, data) => {
            if (error){
                console.log (error)
               }
               else {
                res.write(data)
                res.end()
               }
        })
    }
    else if(req.url === '/danang') {
        fs.readFile('danang.html', (error, data) => {
            if (error){
                console.log (error)
               }
               else {
                res.write(data)
                res.end()
               }
        })
    }
    else if(req.url === '/cantho') {
        fs.readFile('cantho.html', (error, data) => {
            if (error){
                console.log (error)
               }
               else {
                res.write(data)
                res.end()
               }
        })
    }
    else {
        res.write('<h1>404 - Page not found!!</h1>')
        res.end
    }
})
server.listen(port, () => {
    console.log('Server is running at http://localhost:' + port)
})