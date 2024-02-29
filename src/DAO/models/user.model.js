import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    firstName: {type:String},
    lastName:{type: String},
    role: { type: String, default: 'usuario' } // Por defecto, todos los usuarios tendrán el rol 'usuario'
})

export const userModel = mongoose.model('users', userSchema)
