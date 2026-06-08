const Product = require("../../models/product.model");
const cartHelper = require("../../helpers/cart");

// [GET] /cart
module.exports.index = async (req, res) => {
    const cartDocument = await cartHelper.ensureCart(req, res);
    const cart = await cartHelper.buildCartSummary(cartDocument);

    res.render("client/pages/cart/index", {
        pageTitle: "Giỏ hàng",
        cssFile: "/client/css/cart.css",
        cart: cart
    });
};

// [POST] /cart/add/:productId
module.exports.add = async (req, res) => {
    const product = await Product.findOne({
        _id: req.params.productId,
        status: "active",
        deleted: false
    });

    if (!product) {
        req.flash("error", "Không tìm thấy sản phẩm.");
        res.redirect("/products");
        return;
    }

    const cart = await cartHelper.ensureCart(req, res);
    const quantity = Math.max(parseInt(req.body.quantity) || 1, 1);
    const exists = cart.products.find(item => item.productId === req.params.productId);

    if (exists) {
        exists.quantity += quantity;
    } else {
        cart.products.push({
            productId: req.params.productId,
            quantity: quantity
        });
    }

    await cart.save();
    req.flash("success", "Đã thêm sản phẩm vào giỏ hàng.");
    res.redirect(req.get("Referrer") || "/cart");
};

// [PATCH] /cart/update/:productId
module.exports.update = async (req, res) => {
    const cart = await cartHelper.ensureCart(req, res);
    const quantity = Math.max(parseInt(req.body.quantity) || 1, 1);

    cart.products = cart.products.map(item => {
        if (item.productId === req.params.productId) {
            item.quantity = quantity;
        }

        return item;
    });

    await cart.save();
    req.flash("success", "Đã cập nhật giỏ hàng.");
    res.redirect("/cart");
};

// [DELETE] /cart/delete/:productId
module.exports.delete = async (req, res) => {
    const cart = await cartHelper.ensureCart(req, res);
    cart.products = cart.products.filter(item => item.productId !== req.params.productId);
    await cart.save();

    req.flash("success", "Đã xóa sản phẩm khỏi giỏ hàng.");
    res.redirect("/cart");
};
