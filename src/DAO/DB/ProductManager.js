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

            await product.remove()
        }
    }
}

class CartManager {
    async createCart() {
        const newCart = new cartModel({ items: [], total: 0 })
        await newCar.save()
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

        const itemIndex = cart.items.findIndex(item => item.productId.equals(productId))

        if (itemIndex !== -1) {
            cart.items[itemIndex].quantity += quantity
        } else {
            cart.items.push({ productId, quantity })
        }
        cart.total = cart.items.reduce((total, item) => {
            const product = productModel.findById(item.productId)
            return total + product.price * item.quantity
        }, 0)

        await cart.save()

        return cart
    }

    async removeFromCart(cartId, productId) {
        const cart = await cartModel.findById(cartId);
        if (!cart) {
            throw new Error(`Cart with id ${cartId} not found.`)
        }

        const itemIndex = cart.items.findIndex(item => item.productId.equals(productId));

        if (itemIndex !== -1) {

            cart.items.splice(itemIndex, 1)

            cart.total = cart.items.reduce((total, item) => {
                const product = productModel.findById(item.productId)
                return total + product.price * item.quantity
            }, 0);

            await cart.save()
        }
    }

}

export { ProductManager, CartManager }

// //pruebas con productmanager unitarias
// import mongoose from 'mongoose'

// mongoose.connect("mongodb://localhost:27017/ecommerce")
// mongoose.connection.on("error", err => {
//     console.error("Error al conectarse a Mongo", + err)
// })

// //conectando a Mongo

// const productManager = new ProductManager()
// const cartManager = new CartManager()

// // Función de prueba para la creación de un nuevo producto
// async function testCreateProduct() {
//     try {
//         const newProduct = await productManager.addProduct({
//             title: 'Example Product',
//             description: 'This is an example product',
//             price: 10.99,
//             image: 'example.jpg',
//             code: 'EX-002',
//             stock: 100,
//             category: 'Example Category',
//             thumbnails: ['thumb1.jpg', 'thumb2.jpg'],
//         });

//         // Verifica que el producto se haya creado correctamente
//         console.log('New product created:', newProduct);
//     } catch (error) {
//         console.error('Error creating product:', error);
//     }
// }

// // Función de prueba para la obtención de todos los productos
// async function testGetAllProducts() {
//     try {
//         const allProducts = await productManager.getProducts();

//         // Verifica que se hayan obtenido todos los productos
//         console.log('All products:', allProducts);
//     } catch (error) {
//         console.error('Error getting all products:', error);
//     }
// }

// // Función de prueba para la actualización de un producto existente
// async function testUpdateProduct() {
//     const productIdToUpdate = '65caf6c3bf85f9ee353ba0f1'; // Reemplaza con el ID de un producto existente
//     try {
//         const updatedProduct = await productManager.updateProduct(productIdToUpdate, { price: 29.99 });

//         // Verifica que el producto se haya actualizado correctamente
//         console.log('Updated product:', updatedProduct);
//     } catch (error) {
//         console.error('Error updating product:', error);
//     }
// }

// // Función de prueba para el borrado de un producto existente
// async function testDeleteProduct() {
//     const productIdToDelete = '65caf9144522d7de51c1306e'; // Reemplaza con el ID de un producto existente
//     try {
//         await productManager.deleteProduct(productIdToDelete);

//         // Verifica que el producto se haya eliminado correctamente (puedes comprobar si aún existe en la base de datos)
//         console.log('Product deleted successfully.');
//     } catch (error) {
//         console.error('Error deleting product:', error);
//     }
// }

// // Función de prueba para la creación de un nuevo carrito
// async function testCreateCart() {
//     try {
//         const newCartId = await cartManager.createCart();

//         // Verifica que el carrito se haya creado correctamente
//         console.log('New cart created with ID:', newCartId);
//     } catch (error) {
//         console.error('Error creating cart:', error);
//     }
// }

// // Puedes agregar más funciones de prueba para otros métodos si lo deseas

// // Ejecuta las pruebas
// // testCreateProduct();
// // testGetAllProducts();
// // testUpdateProduct();
// // testDeleteProduct();
// testCreateCart();