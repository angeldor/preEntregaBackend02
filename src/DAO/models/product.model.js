import mongoose from 'mongoose'

const productCollection = 'products'

const productSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    image: String,
    code: {
        type: String,
        unique: true
    },
    stock: Number,
    status: { type: Boolean, default: true },
    category: String,
    thumbnails: [String]
})

export const productModel = mongoose.model(productCollection, productSchema)