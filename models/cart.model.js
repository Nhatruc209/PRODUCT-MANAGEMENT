const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
    {
        userId: String,
        products: [
            {
                productId: String,
                quantity: {
                    type: Number,
                    default: 1
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

const Cart = mongoose.model("Cart", cartSchema, "carts");

module.exports = Cart;
