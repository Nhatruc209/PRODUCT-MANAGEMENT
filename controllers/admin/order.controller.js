const Order = require("../../models/order.model");

const statusList = [
    { value: "pending", label: "Chờ xác nhận" },
    { value: "confirmed", label: "Đã xác nhận" },
    { value: "shipping", label: "Đang giao" },
    { value: "completed", label: "Hoàn thành" },
    { value: "cancelled", label: "Đã hủy" }
];

module.exports.index = async (req, res) => {
    const find = {};

    if (req.query.status) {
        find.status = req.query.status;
    }

    const orders = await Order.find(find).sort({
        createdAt: "desc"
    });

    res.render("admin/pages/orders/index", {
        pageTitle: "Đơn hàng",
        cssFile: "/admin/css/orders.css",
        orders: orders,
        statusList: statusList,
        status: req.query.status || ""
    });
};

module.exports.detail = async (req, res) => {
    const order = await Order.findOne({
        _id: req.params.id
    });

    if (!order) {
        req.flash("error", "Không tìm thấy đơn hàng.");
        res.redirect("/admin/orders");
        return;
    }

    res.render("admin/pages/orders/detail", {
        pageTitle: "Chi tiết đơn hàng",
        cssFile: "/admin/css/orders.css",
        order: order,
        statusList: statusList
    });
};

module.exports.changeStatus = async (req, res) => {
    const statuses = statusList.map(item => item.value);

    if (!statuses.includes(req.params.status)) {
        req.flash("error", "Trạng thái không hợp lệ.");
        res.redirect(req.get("Referrer") || "/admin/orders");
        return;
    }

    await Order.updateOne({
        _id: req.params.id
    }, {
        status: req.params.status
    });

    req.flash("success", "Đã cập nhật trạng thái đơn hàng.");
    res.redirect(req.get("Referrer") || "/admin/orders");
};
