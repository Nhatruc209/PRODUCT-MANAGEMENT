const Product = require("../../models/product.model");
const Category = require("../../models/category.model");
const Order = require("../../models/order.model");

module.exports.dashboard = async (req, res) => {
    const [totalProducts, totalCategories, totalOrders, pendingOrders] = await Promise.all([
        Product.countDocuments({ deleted: false }),
        Category.countDocuments({ deleted: false }),
        Order.countDocuments({}),
        Order.countDocuments({ status: "pending" })
    ]);

    res.render("admin/pages/dashboard/index", {
        pageTitle: "Tổng quan",
        cssFile: "/admin/css/dashboard.css",
        stats: {
            totalProducts,
            totalCategories,
            totalOrders,
            pendingOrders
        }
    });
};
