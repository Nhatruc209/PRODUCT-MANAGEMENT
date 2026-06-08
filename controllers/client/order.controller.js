const Order = require("../../models/order.model");

const statusSteps = [
    { value: "pending", label: "Chờ xác nhận" },
    { value: "confirmed", label: "Đã xác nhận" },
    { value: "shipping", label: "Đang giao" },
    { value: "completed", label: "Hoàn thành" },
    { value: "cancelled", label: "Đã hủy" }
];

// [GET] /orders
module.exports.index = async (req, res) => {
    res.render("client/pages/orders/index", {
        pageTitle: "Kiểm tra đơn hàng",
        cssFile: "/client/css/orders.css",
        orders: [],
        keyword: "",
        statusSteps: statusSteps
    });
};

// [GET] /orders/check
module.exports.check = async (req, res) => {
    const keyword = req.query.keyword || "";
    const find = {};

    if (keyword) {
        find.$or = [
            { "userInfo.phone": keyword },
            { _id: keyword.match(/^[0-9a-fA-F]{24}$/) ? keyword : null }
        ];
    }

    const orders = keyword ? await Order.find(find).sort({ createdAt: "desc" }) : [];

    res.render("client/pages/orders/index", {
        pageTitle: "Kiểm tra đơn hàng",
        cssFile: "/client/css/orders.css",
        orders: orders,
        keyword: keyword,
        statusSteps: statusSteps
    });
};
