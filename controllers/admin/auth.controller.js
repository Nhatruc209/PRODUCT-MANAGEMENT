const bcrypt = require("bcrypt");
const Account = require("../../models/account.model");

module.exports.login = async (req, res) => {
    res.render("admin/pages/auth/login", {
        pageTitle: "Đăng nhập quản trị",
        cssFile: "/admin/css/auth.css"
    });
};

module.exports.loginPost = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password || "";

    const account = await Account.findOne({
        email: email
    });

    if (!account) {
        req.flash("error", "Email không tồn tại.");
        res.redirect("/admin/auth/login");
        return;
    }

    if (account.deleted || account.status !== "active") {
        req.flash("error", "Tài khoản admin không hoạt động.");
        res.redirect("/admin/auth/login");
        return;
    }

    const isPasswordValid = await bcrypt.compare(password, account.password || "");

    if (!isPasswordValid) {
        req.flash("error", "Mật khẩu không đúng.");
        res.redirect("/admin/auth/login");
        return;
    }

    req.session.accountId = account._id.toString();
    req.session.role = account.role;
    req.session.fullName = account.fullName;

    req.flash("success", "Đăng nhập thành công.");
    res.redirect("/admin/dashboard");
};

module.exports.logout = (req, res, next) => {
    req.session.destroy((error) => {
        if (error) {
            next(error);
            return;
        }

        res.clearCookie("connect.sid");
        res.redirect("/admin/auth/login");
    });
};
