import { cartModel } from "../models/cart.model.js"
import { productModel } from "../models/product.model.js"



class ProductManager {
    async addProduct({
        title,
        description,
        price,
        image,
        code,
        stock,
        status = true,
        category,
        thumbnails = [],
    }) {
        // Validar campos obligatorios
        if (!title || !description || !price || !image || !code || !stock) {
            throw new Error("All fields are required.")
        }

        // Validar que el código no esté repetido
        const existingProduct = await productModel.findOne({ code })
        if (existingProduct) {
            throw new Error(`Product with code ${code} already exists.`)
        }

        // Agregar producto con id autoincrementable
        const newProduct = new productModel({
            id: ++this.lastProductId,
            title,
            description,
            price,
            image,
            code,
            stock,
            status,
            category,
            thumbnails,
        })

        await newProduct.save()
        return newProduct
    }

    async getProducts() {
        return productModel.find()
    }

    async getProductById(id) {
        return productModel.findById(id)
    }

    async updateProduct(productId, updatedProduct) {
        const product = await productModel.findById(productId);
        if (!product) {
            throw new Error(`Product with id ${productId} not found.`)
        }
        Object.assign(product, updatedProduct)

        await product.save()

        return product
    }

    async deleteProduct(productId) {
        const product = await productModel.findById(productId);
        if (!product) {
            throw new Error(`Product with id ${productId} not found.`)
        }
        await product.deleteOne()
    }
}

class CartManager {
    async createCart() {
        const newCart = new cartModel({ items: [], total: 0 })
        await newCart.save()
        return newCart._id
    }

    async getCart(cartId) {
        return cartModel.findById(cartId)
    }

    async getAllCarts() {
        return cartModel.find()
    }

    async addToCart(cartId, productId, quantity = 1) {
        const cart = await cartModel.findById(cartId)
        if (!cart) {
            throw new Error(`Cart with id ${cartId} not found.`)
        }

        const product = await productModel.findById(productId)
        if (!product) {
            throw new Error(`Product with id ${productId} not found.`)
        }

        const subtotal = product.price * quantity
        cart.items.push({ productId, quantity })

        cart.total += subtotal

        await cart.save()

        return cart
    }

    async removeFromCart(cartId, productId) {
        const cart = await cartModel.findById(cartId);
        if (!cart) {
            throw new Error(`Cart with id ${cartId} not found.`)
        }

        const itemIndex = cart.items.findIndex(item => item.productId.equals(productId))

        if (itemIndex !== -1) {
            const product = await productModel.findById(productId)
            if (!product) {
                throw new Error(`Product with id ${productId} not found.`)
            }

            const { price, quantity } = product
            const subtotal = price * quantity

            cart.total -= subtotal
            cart.items.splice(itemIndex, 1)

            await cart.save()
        }
    }

}

export { ProductManager, CartManager }

