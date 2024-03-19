import { urlencoded } from 'express'
import express from 'express'
import __dirname from './utils.js'
import handlebars from 'express-handlebars'
import mongoose from 'mongoose'
import MongoStore from "connect-mongo"
import router from './Routes/Router.js'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as GitHubStrategy } from 'passport-github2'
import UsersDAO from './DAO/DB/userManager.js'


const app = express()
const httpServer = app.listen(8080, () => console.log('Server running on port 8080'))

mongoose.connect("mongodb://localhost:27017/ecommerce")

mongoose.connection.on("error", err => {
    console.error("Error al conectarse a Mongo", + err)
})

app.use(express.urlencoded({ extended: true }))

app.use(cookieParser())

app.use(session({
    store: MongoStore.create({
        mongoUrl: "mongodb://localhost:27017/ecommerce",
        ttl: 15,
    }),
    secret: "codigosecreto",
    resave: false,
    saveUninitialized: true
}))

app.use(express.static(__dirname + '/public'))
app.use(express.json())

app.use('/', router)

app.use((req, res, next) => {
    const { user } = req.session
    const path = req.path
    if (!user && path !== '/login' && path !== '/singup') {
        return res.redirect('/login')
    }
    next()
})

app.engine('handlebars', handlebars.engine())
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars')

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
},
    async (email, password, done) => {
        try {
            const user = await UsersDAO.getUserByCreds(email, password);
            if (!user) {
                return done(null, false, { message: 'Usuario o contraseña incorrectos.' })
            }
            return done(null, user)
        } catch (error) {
            return done(error)
        }
    }))

passport.serializeUser((user, done) => {
    done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await UsersDAO.getUserByID(id)
        done(null, user)
    } catch (error) {
        done(error)
    }
})

app.use(passport.initialize())
app.use(passport.session())