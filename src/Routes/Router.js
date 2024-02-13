import express from 'express'
import { ProductManager, CartManager } from '../DAO/DB/ProductManager.js'
import mongoose from 'mongoose'
import { productModel } from '../DAO/models/product.model.js'
import { cartModel } from '../DAO/models/cart.model.js'

const router = express.Router()

const productManager = new ProductManager()
const cartManager = new CartManager()

mongoose.connection.on("error", err => {
    console.error("Error al conectarse a Mongo", + err)
})

router.get("/ping", (req, res) => {
    res.send("pong")
})

router.post("/products", (req, res) => {
    try {
        const {
            title,
            description,
            price,
            image,
            code,
            stock,
            category,
            thumbnails,
        } = req.body

        const newProduct = productManager.addProduct({
            title,
            description,
            price,
            image,
            code,
            stock,
            category,
            thumbnails,
        })

        res.status(201).send(newProduct)
    } catch (error) {
        res.status(400).send(`Error: ${error.message}`)
    }

})

router.put("/products/:id", (req, res) => {
    const productId = req.params.id
    const updatedFields = req.body

    try {
        const updatedProduct = productManager.updateProduct(productId, updatedFields)
        res.send(updatedProduct)
    } catch (error) {
        res.status(404).send(`Error 404: ${error.message}`)
    }
})

router.delete("/products/:id", (req, res) => {
    const productId = req.params.id

    try {
        productManager.deleteProduct(productId)
        res.send(`Product with ID ${productId} deleted successfully.`)
    } catch (error) {
        res.status(404).send(error.message)
    }
})

router.get("/products", (req, res) => {
    let products = productManager.getProducts()

    const limit = req.query.limit

    if (limit) {
        products = products.slice(0, parseInt(limit, 10))
    }

    res.send(products)
})

router.get("/products/:id", (req, res) => {
    const productId = req.params.id

    const product = productManager.getProductById(productId)

    if (product) {
        res.send(product)
    } else {
        res.status(404).send("Error 404: Product not found")
    }
})

router.get("/carts", (req, res) => {
    let carts = cartManager.getAllCarts()

    const limit = req.query.limit

    if (limit) {
        products = carts.slice(0, parseInt(limit, 10))
    }

    res.send(carts)
})

router.post("/carts", (req, res) => {
    try {
        const newCartId = cartManager.createCart()
        res.status(201).send({ id: newCartId, items: [], total: 0 })
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`)
    }
})

router.get("/carts/:cid", (req, res) => {
    const cartId = req.params.cid

    const cart = cartManager.getCart(cartId)

    if (cart) {
        res.send(cart)
    } else {
        res.status(404).send(`Error 404: Cart with ID ${cartId} not found.`)
    }
})

router.post("/carts/:cid/products/:pid", (req, res) => {
    const cartId = req.params.cid
    const productId = req.params.pid
    const quantity = req.body.quantity || 1

    try {
        cartManager.addToCart(cartId, productId, quantity)
        res.send("Product added to cart successfully.")
    } catch (error) {
        res.status(400).send(`Error: ${error.message}`)
    }
})

export default router