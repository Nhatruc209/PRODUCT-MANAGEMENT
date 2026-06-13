const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../../models/user.model");
const sendOtpMail = require("../../helpers/sendOtpMail.helper");

const generateOtp = () => crypto.randomInt(100000, 1000000).toString();
const normalizeEmail = (email) => (email || "").trim().toLowerCase();
const getSafeRedirectUrl = (url) => {
    if (!url || typeof url !== "string") {
        return "/";
    }

    return url.startsWith("/") && !url.startsWith("//") ? url : "/";
};

const renderForgotPasswordEmail = (res, data = {}) => {
    res.render("client/pages/user/forgot-password", {
        pageTitle: "Quên mật khẩu",
        cssFile: "/client/css/auth.css",
        email: data.email || "",
        error: data.error,
        success: data.success
    });
};

const renderForgotPasswordVerify = (res, data = {}) => {
    res.render("client/pages/user/forgot-password-verify", {
        pageTitle: "Xác nhận OTP",
        cssFile: "/client/css/auth.css",
        forgotEmail: data.forgotEmail,
        error: data.error,
        success: data.success
    });
};

const renderForgotPasswordReset = (res, data = {}) => {
    res.render("client/pages/user/forgot-password-reset", {
        pageTitle: "Đặt mật khẩu mới",
        cssFile: "/client/css/auth.css",
        error: data.error,
        success: data.success
    });
};

const logSmtpEnv = () => {
    console.log("SMTP env loaded:", {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE,
        user: process.env.EMAIL_USER,
        from: process.env.EMAIL_FROM,
        hasPass: !!process.env.EMAIL_PASS
    });
};

// [GET] /user/login
module.exports.login = (req, res) => {
    res.render("client/pages/user/login", {
        pageTitle: "Đăng nhập",
        cssFile: "/client/css/auth.css",
        redirectUrl: getSafeRedirectUrl(req.query.redirectUrl)
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
        const redirectUrl = getSafeRedirectUrl(req.body.redirectUrl);
        res.redirect(`/user/login?redirectUrl=${encodeURIComponent(redirectUrl)}`);
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
    res.redirect(getSafeRedirectUrl(req.body.redirectUrl));
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

// [GET] /user/change-password
module.exports.changePassword = (req, res) => {
    res.render("client/pages/user/change-password", {
        pageTitle: "Đổi mật khẩu",
        cssFile: "/client/css/auth.css"
    });
};

// [POST] /user/change-password
module.exports.changePasswordPost = async (req, res) => {
    const { currentPassword, password, confirmPassword } = req.body;
    const currentUser = res.locals.user;

    if (!currentUser) {
        res.redirect("/user/login");
        return;
    }

    if (!currentPassword || !password || !confirmPassword) {
        req.flash("error", "Vui lòng nhập đầy đủ thông tin.");
        res.redirect("/user/change-password");
        return;
    }

    if (password.length < 6) {
        req.flash("error", "Mật khẩu mới phải có ít nhất 6 ký tự.");
        res.redirect("/user/change-password");
        return;
    }

    if (password !== confirmPassword) {
        req.flash("error", "Mật khẩu xác nhận không khớp.");
        res.redirect("/user/change-password");
        return;
    }

    const user = await User.findOne({
        _id: currentUser._id,
        deleted: false,
        status: "active"
    });

    if (!user) {
        req.flash("error", "Tài khoản không tồn tại hoặc đã bị khóa.");
        res.redirect("/user/login");
        return;
    }

    if (!bcrypt.compareSync(currentPassword, user.password || "")) {
        req.flash("error", "Mật khẩu hiện tại không đúng.");
        res.redirect("/user/change-password");
        return;
    }

    user.password = bcrypt.hashSync(password, 10);
    await user.save();

    req.flash("success", "Cập nhật mật khẩu thành công.");
    res.redirect("/user/change-password");
};

// [GET] /user/forgot-password
module.exports.forgotPassword = (req, res) => {
    renderForgotPasswordEmail(res);
};

// [POST] /user/forgot-password/send-otp
module.exports.forgotPasswordSendOtp = async (req, res) => {
    const email = normalizeEmail(req.body.email);

    console.log("Forgot password email:", email);
    logSmtpEnv();

    if (!email) {
        renderForgotPasswordEmail(res, {
            error: "Vui lòng nhập email."
        });
        return;
    }

    const user = await User.findOne({
        email: email,
        deleted: false,
        status: "active"
    });

    console.log("Found user:", !!user);

    if (!user) {
        renderForgotPasswordEmail(res, {
            email,
            error: "Email này chưa được đăng ký trong hệ thống."
        });
        return;
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    try {
        user.resetPasswordOtp = otp;
        user.resetPasswordExpires = otpExpires;
        user.resetPasswordVerified = false;
        await user.save();

        await sendOtpMail(email, otp);

        req.session.forgotEmail = email;
        res.redirect("/user/forgot-password/verify");
    } catch (error) {
        console.log("Send OTP mail failed:", {
            message: error.message,
            code: error.code,
            response: error.response
        });
        renderForgotPasswordEmail(res, {
            email,
            error: "Không thể gửi email xác nhận. Vui lòng thử lại sau."
        });
    }
};

// [GET] /user/forgot-password/verify
module.exports.forgotPasswordVerify = (req, res) => {
    const forgotEmail = req.session.forgotEmail;

    if (!forgotEmail) {
        res.redirect("/user/forgot-password");
        return;
    }

    renderForgotPasswordVerify(res, {
        forgotEmail
    });
};

// [POST] /user/forgot-password/verify
module.exports.forgotPasswordVerifyPost = async (req, res) => {
    const otp = (req.body.otp || "").trim();
    const forgotEmail = req.session.forgotEmail;

    if (!forgotEmail) {
        res.redirect("/user/forgot-password");
        return;
    }

    if (!/^\d{6}$/.test(otp)) {
        renderForgotPasswordVerify(res, {
            forgotEmail,
            error: "Mã xác nhận không đúng."
        });
        return;
    }

    const user = await User.findOne({
        email: forgotEmail,
        deleted: false,
        status: "active"
    });

    if (!user) {
        res.redirect("/user/forgot-password");
        return;
    }

    if (user.resetPasswordOtp !== otp) {
        renderForgotPasswordVerify(res, {
            forgotEmail,
            error: "Mã xác nhận không đúng."
        });
        return;
    }

    if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
        renderForgotPasswordVerify(res, {
            forgotEmail,
            error: "Mã xác nhận đã hết hạn, vui lòng gửi lại mã."
        });
        return;
    }

    user.resetPasswordVerified = true;
    await user.save();

    res.redirect("/user/forgot-password/reset");
};

// [POST] /user/forgot-password/resend-otp
module.exports.forgotPasswordResendOtp = async (req, res) => {
    const forgotEmail = req.session.forgotEmail;

    if (!forgotEmail) {
        res.redirect("/user/forgot-password");
        return;
    }

    const user = await User.findOne({
        email: forgotEmail,
        deleted: false,
        status: "active"
    });

    if (!user) {
        res.redirect("/user/forgot-password");
        return;
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    try {
        user.resetPasswordOtp = otp;
        user.resetPasswordExpires = otpExpires;
        user.resetPasswordVerified = false;
        await user.save();

        await sendOtpMail(forgotEmail, otp);

        renderForgotPasswordVerify(res, {
            forgotEmail,
            success: "Mã xác nhận mới đã được gửi lại."
        });
    } catch (error) {
        console.log("Send OTP mail failed:", {
            message: error.message,
            code: error.code,
            response: error.response
        });
        renderForgotPasswordVerify(res, {
            forgotEmail,
            error: "Không thể gửi lại mã xác nhận. Vui lòng thử lại sau."
        });
    }
};

// [GET] /user/forgot-password/reset
module.exports.forgotPasswordReset = async (req, res) => {
    const forgotEmail = req.session.forgotEmail;

    if (!forgotEmail) {
        res.redirect("/user/forgot-password");
        return;
    }

    const user = await User.findOne({
        email: forgotEmail,
        deleted: false,
        status: "active"
    });

    if (!user || user.resetPasswordVerified !== true) {
        res.redirect("/user/forgot-password/verify");
        return;
    }

    renderForgotPasswordReset(res);
};

// [POST] /user/forgot-password/reset
module.exports.forgotPasswordResetPost = async (req, res) => {
    const { password, confirmPassword } = req.body;
    const forgotEmail = req.session.forgotEmail;

    if (!forgotEmail) {
        res.redirect("/user/forgot-password");
        return;
    }

    if (!password || password.length < 6) {
        renderForgotPasswordReset(res, {
            error: "Mật khẩu phải có ít nhất 6 ký tự."
        });
        return;
    }

    if (password !== confirmPassword) {
        renderForgotPasswordReset(res, {
            error: "Mật khẩu xác nhận không khớp."
        });
        return;
    }

    const user = await User.findOne({
        email: forgotEmail,
        deleted: false,
        status: "active"
    });

    if (!user || user.resetPasswordVerified !== true) {
        res.redirect("/user/forgot-password");
        return;
    }

    await User.updateOne(
        { _id: user._id },
        {
            $set: {
                password: bcrypt.hashSync(password, 10),
                resetPasswordVerified: false
            },
            $unset: {
                resetPasswordOtp: "",
                resetPasswordExpires: ""
            }
        }
    );

    delete req.session.forgotEmail;

    req.flash("success", "Đổi mật khẩu thành công, vui lòng đăng nhập lại.");
    res.redirect("/user/login");
};
