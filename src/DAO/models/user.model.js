// user.model.js

import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'usuario' } // Por defecto, todos los usuarios tendrán el rol 'usuario'
})

export const userModel = mongoose.model('User', userSchema)
