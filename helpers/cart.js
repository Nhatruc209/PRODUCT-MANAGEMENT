const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

const priceAfterDiscount = (product) => {
    return Math.round(product.price * (100 - product.discountPercentage) / 100);
};

module.exports.ensureCart = async (req, res) => {
    let cartId = req.cookies.cartId;
    let cart = null;

    if (cartId) {
        cart = await Cart.findOne({
            _id: cartId
        });
    }

    if (!cart) {
        cart = new Cart({
            products: []
        });
        await cart.save();
        res.cookie("cartId", cart._id.toString(), {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true
        });
    }

    return cart;
};

module.exports.buildCartSummary = async (cart) => {
    const productIds = cart.products.map(item => item.productId);
    const products = await Product.find({
        _id: {
            $in: productIds
        },
        deleted: false,
        status: "active"
    });

    const items = cart.products
        .map(item => {
            const product = products.find(productItem => productItem._id.toString() === item.productId);

            if (!product) {
                return null;
            }

            const priceNew = priceAfterDiscount(product);
            const quantity = item.quantity || 1;

            return {
                productId: product._id.toString(),
                title: product.title,
                thumbnail: product.thumbnail,
                price: product.price,
                discountPercentage: product.discountPercentage,
                priceNew: priceNew,
                quantity: quantity,
                total: priceNew * quantity
            };
        })
        .filter(Boolean);

    const subTotal = items.reduce((sum, item) => sum + item.total, 0);
    const shippingFee = subTotal > 0 && subTotal < 500000 ? 30000 : 0;

    return {
        products: items,
        subTotal: subTotal,
        shippingFee: shippingFee,
        total: subTotal + shippingFee
    };
};
