import { urlencoded } from 'express'
import express from 'express'
import mongoose from 'mongoose'
import router from './Routes/Router.js'

const app = express()

mongoose.connect("mongodb://localhost:27017/")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/products', router)

app.get("/ping", (req, res) => {
    res.send("pong")
})

app.listen(8080, () => {
    console.log("Aplicacion funcionando en el puerto 8080")
})