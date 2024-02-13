import fs from 'fs'

class ProductManager {
  constructor(filePath) {
    this.path = filePath;
    this.products = this.loadProducts();
    this.lastProductId = this.calculateLastProductId();
  }

  loadProducts() {
    try {
      const data = fs.readFileSync(this.path, "utf8");
      return JSON.parse(data);
    } catch (error) {
      // Si el archivo no existe o hay algún error, se inicializa con un arreglo vacío.
      return [];
    }
  }

  saveProducts() {
    const data = JSON.stringify(this.products, null, 2);
    fs.writeFileSync(this.path, data, "utf8");
  }

  calculateLastProductId() {
    const lastProduct = this.products[this.products.length - 1];
    return lastProduct ? lastProduct.id : 0;
  }

  addProduct({
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
      throw new Error("All fields are required.");
    }

    // Validar que el código no esté repetido
    if (this.products.some((p) => p.code === code)) {
      throw new Error(`Product with code ${code} already exists.`);
    }

    // Agregar producto con id autoincrementable
    const newProduct = {
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
    };

    this.products.push(newProduct);
    this.saveProducts(); // Guardar cambios en el archivo
    return newProduct;
  }

  getProducts() {
    return this.products;
  }

  getProductById(id) {
    return this.products.find((prod) => prod.id == id);
  }

  updateProduct(productId, updatedProduct) {
    const index = this.products.findIndex((p) => p.id === productId);
    if (index === -1) {
      throw new Error(`Product with id ${productId} not found.`);
    }

    this.products[index] = { ...this.products[index], ...updatedProduct };
    this.saveProducts(); // Guardar cambios en el archivo
    return this.products[index];
  }

  deleteProduct(productId) {
    const index = this.products.findIndex((p) => p.id === productId);
    if (index === -1) {
      throw new Error(`Product with id ${productId} not found.`);
    }

    this.products.splice(index, 1);
    this.saveProducts(); // Guardar cambios en el archivo
  }
}

class CartManager {
  constructor(filePath) {
    this.path = filePath;
    this.carts = this.loadCarts();
    this.lastCartId = this.calculateLastCartId();
  }

  loadCarts() {
    try {
      const data = fs.readFileSync(this.path, "utf8");
      return JSON.parse(data);
    } catch (error) {
      // Si el archivo no existe o hay algún error, se inicializa con un array vacío.
      return [];
    }
  }

  saveCarts() {
    const data = JSON.stringify(this.carts, null, 2);
    fs.writeFileSync(this.path, data, "utf8");
  }

  calculateLastCartId() {
    const lastCart = this.carts[this.carts.length - 1];
    return lastCart ? lastCart.id : 0;
  }

  createCart() {
    const newCartId = ++this.lastCartId;
    const newCart = { id: newCartId, items: [], total: 0 };
    this.carts.push(newCart);
    this.saveCarts(); // Guardar cambios en el archivo
    return newCartId;
  }

  getCart(cartId) {
    return this.carts.find((cart) => cart.id === cartId);
  }

  getAllCarts() {
    return this.carts;
  }

  addToCart(cartId, productId, quantity = 1) {
    const cart = this.getCart(cartId);

    if (!cart) {
      throw new Error(`Cart with id ${cartId} not found.`);
    }

    const product = productManager.getProductById(productId);

    if (!product) {
      throw new Error(`Product with id ${productId} not found.`);
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (itemIndex !== -1) {
      // El producto ya existe en el carrito, actualizar cantidad
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Agregar nuevo producto al carrito
      cart.items.push({ productId, quantity });
    }

    // Actualizar el total del carrito
    cart.total = cart.items.reduce((total, item) => {
      const product = productManager.getProductById(item.productId);
      return total + product.price * item.quantity;
    }, 0);

    this.saveCarts(); // Guardar cambios en el archivo
  }

  removeFromCart(cartId, productId) {
    const cart = this.getCart(cartId);

    if (!cart) {
      throw new Error(`Cart with id ${cartId} not found.`);
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (itemIndex !== -1) {
      // Eliminar el producto del carrito
      cart.items.splice(itemIndex, 1);

      // Actualizar el total del carrito
      cart.total = cart.items.reduce((total, item) => {
        const product = productManager.getProductById(item.productId);
        return total + product.price * item.quantity;
      }, 0);

      this.saveCarts(); // Guardar cambios en el archivo
    }
  }
}

const productManager = new ProductManager("./JSON/products.json");
const cartManager = new CartManager("./JSON/carts.json");

const manager = {
  productManager,
  cartManager,
}


export default manager