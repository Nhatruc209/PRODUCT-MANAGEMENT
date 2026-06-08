const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../../models/user.model");

// [GET] /user/login
module.exports.login = (req, res) => {
    res.render("client/pages/user/login", {
        pageTitle: "Đăng nhập",
        cssFile: "/client/css/auth.css"
    });
};

// [POST] /user/login
module.exports.loginPost = async (req, res) => {
    const user = await User.findOne({
        email: req.body.email,
        deleted: false,
        status: "active"
    });

    if (!user || !bcrypt.compareSync(req.body.password || "", user.password || "")) {
        req.flash("error", "Email hoặc mật khẩu không đúng.");
        res.redirect("/user/login");
        return;
    }

    const tokenUser = crypto.randomBytes(32).toString("hex");
    await User.updateOne({
        _id: user._id
    }, {
        tokenUser: tokenUser
    });

    res.cookie("tokenUser", tokenUser, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true
    });
    req.flash("success", "Đăng nhập thành công.");
    res.redirect("/");
};

// [GET] /user/register
module.exports.register = (req, res) => {
    res.render("client/pages/user/register", {
        pageTitle: "Đăng ký",
        cssFile: "/client/css/auth.css"
    });
};

// [POST] /user/register
module.exports.registerPost = async (req, res) => {
    if (!req.body.fullName || !req.body.email || !req.body.password) {
        req.flash("error", "Vui lòng nhập đầy đủ thông tin bắt buộc.");
        res.redirect("/user/register");
        return;
    }

    if (req.body.password !== req.body.confirmPassword) {
        req.flash("error", "Mật khẩu xác nhận không khớp.");
        res.redirect("/user/register");
        return;
    }

    const exists = await User.findOne({
        email: req.body.email,
        deleted: false
    });

    if (exists) {
        req.flash("error", "Email đã tồn tại.");
        res.redirect("/user/register");
        return;
    }

    const tokenUser = crypto.randomBytes(32).toString("hex");
    const user = new User({
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        password: bcrypt.hashSync(req.body.password, 10),
        tokenUser: tokenUser
    });

    await user.save();
    res.cookie("tokenUser", tokenUser, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true
    });
    req.flash("success", "Đăng ký thành công.");
    res.redirect("/");
};

// [GET] /user/logout
module.exports.logout = (req, res) => {
    res.clearCookie("tokenUser");
    req.flash("success", "Đăng xuất thành công.");
    res.redirect("/");
};
