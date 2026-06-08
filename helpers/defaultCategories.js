const Category = require("../models/category.model");

const defaultCategories = [
    {
        title: "Áo",
        description: "Các sản phẩm áo.",
        position: 1
    },
    {
        title: "Quần",
        description: "Các sản phẩm quần.",
        position: 2
    },
    {
        title: "Váy",
        description: "Các sản phẩm váy.",
        position: 3
    },
    {
        title: "Set quần áo",
        description: "Các bộ quần áo phối sẵn.",
        position: 4
    }
];

module.exports = async () => {
    for (const item of defaultCategories) {
        const category = await Category.findOne({
            title: item.title,
            deleted: false
        });

        if (!category) {
            await new Category({
                ...item,
                status: "active",
                deleted: false
            }).save();
        }
    }
};
