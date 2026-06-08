const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
    {
        fullName: String,
        email: String,
        password: String,
        role: {
            type: String,
            default: "admin"
        },
        status: {
            type: String,
            default: "active"
        },
        deleted: {
            type: Boolean,
            default: false
        },
        deletedAt: Date
    },
    {
        timestamps: true
    }
);

const Account = mongoose.model("Account", accountSchema, "accounts");

module.exports = Account;
