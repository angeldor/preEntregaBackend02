import { urlencoded } from 'express'
import express from 'express'
import __dirname from './utils.js'
import handlebars from 'express-handlebars'
import mongoose from 'mongoose'
import router from './Routes/Router.js'
import { Server } from 'socket.io'

const app = express()
const httpServer = app.listen(8080, ()=> console.log('Server running on port 8080'))


const io = new Server(httpServer)

mongoose.connect("mongodb://localhost:27017/")

mongoose.connection.on("error", err => {
    console.error("Error al conectarse a Mongo", + err)
})

app.engine('handlebars', handlebars.engine())
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars')
app.use(express.static(__dirname + '/public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/', router)

let messages = []
io.on('connection', socket => {
    console.log('Nuevo cliente conectado')

    socket.on('message', data => {
        messages.push(data)
        io.emit('messageLogs', messages)
    })

    socket.on('login', data => {
        socket.emit('messageLogs', messages)
        console.log(data)
        socket.broadcast.emit('register', data)
    })


})