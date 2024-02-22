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

router.post("/products", async (req, res) => {
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

        const newProduct = await productManager.addProduct({
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

router.put("/products/:id", async (req, res) => {
    const productId = req.params.id
    const updatedFields = req.body

    try {
        const updatedProduct = await productManager.updateProduct(productId, updatedFields)
        res.send(updatedProduct)
    } catch (error) {
        res.status(404).send(`Error 404: ${error.message}`)
    }
})

router.delete("/products/:id", async (req, res) => {
    const productId = req.params.id

    try {
        await productManager.deleteProduct(productId)
        res.send(`Product with ID ${productId} deleted successfully.`)
    } catch (error) {
        res.status(404).send(error.message)
    }
})

router.get("/products", async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query

        const limitInt = parseInt(limit, 10)
        const pageInt = parseInt(page, 10)

        const startIndex = (pageInt - 1) * limitInt
        const endIndex = pageInt * limitInt

        let products = await productManager.getProducts()

        if (query) {
            products = products.filter(product => {
                return product.category.toLowerCase() === query.toLowerCase()
            })
        }

        if (sort === 'asc') {
            products.sort((a, b) => a.price - b.price)
        } else if (sort === 'desc') {
            products.sort((a, b) => b.price - a.price)
        }

        const limitedProducts = products.slice(startIndex, endIndex)

        let formatedProducts = products.map(product => {
            return {
                title: product.title,
                description: product.description,
                price: product.price,
                image: product.image
            }
        })
        res.render('product', { productData: formatedProducts })
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`)
    }
})

router.get("/products/:id", async (req, res) => {
    const productId = req.params.id

    try {
        const product = await productManager.getProductById(productId);

        if (product) {
            res.send(product);
        } else {
            res.status(404).send("Error 404: Product not found");
        }
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
})

router.get("/carts", async (req, res) => {
    try {
        let carts = await cartManager.getAllCarts();

        const limit = req.query.limit;

        if (limit) {
            carts = carts.slice(0, parseInt(limit, 10));
        }

        res.send(carts);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
})

router.post("/carts", async (req, res) => {
    try {
        const newCartId = await cartManager.createCart()
        res.status(201).send({ id: newCartId, items: [], total: 0 })
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`)
    }
})

router.get("/carts/:cid", async (req, res) => {
    const cartId = req.params.cid

    try {
        const cart = await cartManager.getCart(cartId);

        if (cart) {
            res.send(cart);
        } else {
            res.status(404).send(`Error 404: Cart with ID ${cartId} not found.`);
        }
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
})

router.post("/carts/:cid/products/:pid", async (req, res) => {
    const cartId = req.params.cid
    const productId = req.params.pid
    const quantity = req.body.quantity || 1

    try {
        await cartManager.addToCart(cartId, productId, quantity)
        res.send("Product added to cart successfully.")
    } catch (error) {
        res.status(400).send(`Error: ${error.message}`)
    }
})

router.get("/", (req, res) => {
    res.render('index', [])
})
export default router