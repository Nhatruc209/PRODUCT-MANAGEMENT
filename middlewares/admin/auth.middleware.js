const Account = require("../../models/account.model");

module.exports.requireAuth = async (req, res, next) => {
    if (!req.session.accountId) {
        res.redirect("/admin/auth/login");
        return;
    }

    const account = await Account.findOne({
        _id: req.session.accountId,
        status: "active",
        deleted: false
    }).select("-password");

    if (!account) {
        req.session.destroy(() => {});
        res.redirect("/admin/auth/login");
        return;
    }

    res.locals.admin = {
        _id: account._id,
        fullName: account.fullName,
        email: account.email,
        role: account.role
    };

    next();
};
