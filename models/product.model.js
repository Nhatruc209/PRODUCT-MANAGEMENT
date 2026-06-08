const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        title: String,
        description: String,
        price: {
            type: Number,
            default: 0
        },
        discountPercentage: {
            type: Number,
            default: 0
        },
        stock: {
            type: Number,
            default: 0
        },
        thumbnail: String,
        categoryId: String,
        slug: String,
        status: {
            type: String,
            default: "active"
        },
        position: {
            type: Number,
            default: 0
        },
        deleted: {
            type: Boolean,
            default: false
        },
        deletedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model('Product', productSchema, "product");

module.exports = Product;
