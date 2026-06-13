const nodemailer = require("nodemailer");

const getEmailConfig = () => {
    const config = {
        host: process.env.EMAIL_HOST || "smtp-relay.brevo.com",
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === "true",
        user: (process.env.EMAIL_USER || "").trim(),
        pass: (process.env.EMAIL_PASS || "").replace(/\s/g, ""),
        from: (process.env.EMAIL_FROM || "").trim()
    };

    const placeholderValues = [
        "your_brevo_smtp_login",
        "your_brevo_smtp_key",
        "your_verified_sender_email"
    ];

    if (!config.user || !config.pass || !config.from || placeholderValues.includes(config.user) || placeholderValues.includes(config.pass) || placeholderValues.includes(config.from)) {
        const error = new Error("EMAIL_NOT_CONFIGURED");
        error.code = "EMAIL_NOT_CONFIGURED";
        throw error;
    }

    return config;
};

const sendOtpMail = async (toEmail, otp) => {
    if (!toEmail || !otp) {
        throw new Error("Missing toEmail or otp");
    }

    const config = getEmailConfig();
    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
            user: config.user,
            pass: config.pass
        }
    });

    return transporter.sendMail({
        from: config.from,
        to: toEmail,
        subject: "Mã xác nhận đặt lại mật khẩu Sera",
        text: `Mã xác nhận đặt lại mật khẩu Sera của bạn là ${otp}. Mã này hết hạn sau 5 phút.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #2f2926;">
                <h2 style="color: #c36d7d;">Mã xác nhận đặt lại mật khẩu Sera</h2>
                <p>Xin chào,</p>
                <p>Mã xác nhận đặt lại mật khẩu của bạn là:</p>
                <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #c36d7d; margin: 20px 0;">${otp}</p>
                <p>Mã này hết hạn sau <strong>5 phút</strong>.</p>
                <p style="font-size: 13px; color: #7d746f;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
            </div>
        `
    });
};

module.exports = sendOtpMail;
