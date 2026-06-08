const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        userId: String,
        cartId: String,
        userInfo: {
            fullName: String,
            phone: String,
            address: String,
            note: String
        },
        products: [
            {
                productId: String,
                title: String,
                price: Number,
                discountPercentage: Number,
                thumbnail: String,
                quantity: Number
            }
        ],
        totalPrice: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

const Order = mongoose.model("Order", orderSchema, "orders");

module.exports = Order;
