const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
require("dotenv").config();

const database = require("../config/database");
const Account = require("../models/account.model");

const seedAdmin = async () => {
    await database.connect();

    const email = "admin@gmail.com";
    const exists = await Account.findOne({
        email: email
    });

    if (exists) {
        console.log("Admin account already exists.");
        return;
    }

    const password = await bcrypt.hash("123456", 10);

    await new Account({
        fullName: "Admin",
        email: email,
        password: password,
        role: "admin",
        status: "active"
    }).save();

    console.log("Admin account created successfully.");
};

seedAdmin()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
