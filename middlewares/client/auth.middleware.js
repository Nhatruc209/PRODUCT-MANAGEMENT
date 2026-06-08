const User = require("../../models/user.model");

module.exports.infoUser = async (req, res, next) => {
    const tokenUser = req.cookies.tokenUser;

    if (tokenUser) {
        const user = await User.findOne({
            tokenUser: tokenUser,
            status: "active",
            deleted: false
        }).select("-password");

        res.locals.user = user || null;
    }

    next();
};
