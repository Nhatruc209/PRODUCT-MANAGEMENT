// Trang cấu hình config
const mongoose = require('mongoose');

// Xem nó đã kết nối chưa
module.exports.connect = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connect to MongoDB successfully');
    }catch (error) {
        console.log('Error connecting to MongoDB:');
    }
}
module.exports.index = async(req, res) => {
    const products = await Product.find({});

    console.log("DB:", Product.db.name);
    console.log("Collection:", Product.collection.name);
    console.log(products);

    res.render("client/pages/products/index");
}