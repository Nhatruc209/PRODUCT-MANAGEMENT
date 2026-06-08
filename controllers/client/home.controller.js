const Product = require("../../models/product.model");
const Category = require("../../models/category.model");

const getPriceNew = (product) => {
    return Math.round(product.price * (100 - product.discountPercentage) / 100);
};

const mapProducts = (products) => {
    return products.map(item => {
        item.priceNew = getPriceNew(item);
        item.isNew = item.createdAt && ((Date.now() - item.createdAt.getTime()) / (1000 * 60 * 60 * 24) <= 30);
        return item;
    });
};

// [GET] /
module.exports.index = async (req, res) => {
    const find = {
        status: "active",
        deleted: false
    };

    const productsFeatured = await Product.find(find).sort({
        position: "desc"
    }).limit(8);

    const productsNew = await Product.find(find).sort({
        _id: "desc"
    }).limit(4);

    const productsSale = await Product.find({
        ...find,
        discountPercentage: {
            $gt: 0
        }
    }).sort({
        discountPercentage: "desc"
    }).limit(4);

    const categories = await Category.find(find).sort({
        position: "asc"
    }).limit(4);

    const fallbackImages = [
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=600&q=80"
    ];

    const categoriesFeatured = categories.map((item, index) => ({
        title: item.title,
        href: `/products?categoryId=${item._id}`,
        image: item.thumbnail || fallbackImages[index % fallbackImages.length]
    }));

    res.render("client/pages/home/index", {
        pageTitle: "Trang chủ",
        cssFile: "/client/css/home.css",
        productsFeatured: mapProducts(productsFeatured),
        productsNew: mapProducts(productsNew),
        productsSale: mapProducts(productsSale),
        categoriesFeatured: categoriesFeatured
    });
};
