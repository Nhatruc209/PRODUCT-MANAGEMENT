const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        title: String,
        description: String,
        thumbnail: String,
        status: {
            type: String,
            default: "active"
        },
        position: {
            type: Number,
            default: 0
        },
        slug: String,
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

const Category = mongoose.model("Category", categorySchema, "categories");

module.exports = Category;
