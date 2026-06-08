const Order = require("../../models/order.model");
const cartHelper = require("../../helpers/cart");

// [GET] /checkout
module.exports.index = async (req, res) => {
    const cartDocument = await cartHelper.ensureCart(req, res);
    const order = await cartHelper.buildCartSummary(cartDocument);

    res.render("client/pages/checkout/index", {
        pageTitle: "Thanh toán",
        cssFile: "/client/css/checkout.css",
        order: order,
        successMessage: ""
    });
};

// [POST] /checkout/order
module.exports.order = async (req, res) => {
    const cartDocument = await cartHelper.ensureCart(req, res);
    const orderSummary = await cartHelper.buildCartSummary(cartDocument);

    if (orderSummary.products.length === 0) {
        req.flash("error", "Giỏ hàng đang trống.");
        res.redirect("/cart");
        return;
    }

    const order = new Order({
        cartId: cartDocument._id.toString(),
        userInfo: {
            fullName: req.body.fullName,
            phone: req.body.phone,
            address: req.body.address,
            note: req.body.note
        },
        products: orderSummary.products.map(item => ({
            productId: item.productId,
            title: item.title,
            price: item.price,
            discountPercentage: item.discountPercentage,
            thumbnail: item.thumbnail,
            quantity: item.quantity
        })),
        totalPrice: orderSummary.total,
        status: "pending"
    });

    await order.save();
    cartDocument.products = [];
    await cartDocument.save();

    res.render("client/pages/checkout/index", {
        pageTitle: "Thanh toán",
        cssFile: "/client/css/checkout.css",
        order: {
            products: [],
            subTotal: 0,
            shippingFee: 0,
            total: 0
        },
        successMessage: `Đặt hàng thành công. Mã đơn hàng: ${order._id}`
    });
};
