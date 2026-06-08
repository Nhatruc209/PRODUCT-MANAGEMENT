const mongoose = require("mongoose");

const adminAccountSchema = new mongoose.Schema(
    {
        fullName: String,
        email: String,
        password: String,
        token: String,
        status: {
            type: String,
            default: "active"
        },
        deleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const AdminAccount = mongoose.model("AdminAccount", adminAccountSchema, "admin_accounts");

module.exports = AdminAccount;
