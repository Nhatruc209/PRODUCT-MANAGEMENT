const Product = require("../../models/product.model");
const Category = require("../../models/category.model");
const paginationHelper = require("../../helpers/pagination");

const getPriceNew = (product) => {
    return Math.round(product.price * (100 - product.discountPercentage) / 100);
};

const getSort = (sortKey) => {
    switch (sortKey) {
        case "price-asc":
            return { price: "asc" };
        case "price-desc":
            return { price: "desc" };
        case "newest":
            return { _id: "desc" };
        case "oldest":
            return { _id: "asc" };
        case "title-asc":
            return { title: "asc" };
        case "title-desc":
            return { title: "desc" };
        default:
            return { position: "desc" };
    }
};

const buildQueryUrl = (query, page) => {
    const params = new URLSearchParams();

    if (query.keyword) params.set("keyword", query.keyword);
    if (query.categoryId) params.set("categoryId", query.categoryId);
    if (query.sortKey) params.set("sortKey", query.sortKey);

    params.set("page", page);
    return `/products?${params.toString()}`;
};

// [GET] /products
module.exports.index = async (req, res) => {
    const find = {
        status: "active",
        deleted: false
    };

    if (req.query.keyword) {
        find.title = new RegExp(req.query.keyword, "i");
    }

    if (req.query.categoryId) {
        find.categoryId = req.query.categoryId;
    }

    const countProducts = await Product.countDocuments(find);
    const pagination = paginationHelper({
        currentPage: 1,
        limitItems: 8
    }, req.query, countProducts);

    const products = await Product.find(find)
        .sort(getSort(req.query.sortKey))
        .limit(pagination.limitItems)
        .skip(pagination.skip);

    const newProducts = products.map(item => {
        item.priceNew = getPriceNew(item);
        item.isNew = item.createdAt && ((Date.now() - item.createdAt.getTime()) / (1000 * 60 * 60 * 24) <= 30);
        return item;
    });

    const categories = await Category.find({
        status: "active",
        deleted: false
    }).sort({
        position: "asc"
    });

    res.render("client/pages/products/index", {
        pageTitle: "Sản phẩm",
        cssFile: "/client/css/products.css",
        products: newProducts,
        keyword: req.query.keyword || "",
        categoryId: req.query.categoryId || "",
        sortKey: req.query.sortKey || "",
        categories: categories,
        pagination: pagination,
        buildQueryUrl: (page) => buildQueryUrl(req.query, page)
    });
};

// [GET] /products/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            status: "active",
            deleted: false
        });

        if (!product) {
            res.redirect("/products");
            return;
        }

        product.priceNew = getPriceNew(product);

        const findRelated = {
            _id: {
                $ne: product._id
            },
            status: "active",
            deleted: false
        };

        if (product.categoryId) {
            findRelated.categoryId = product.categoryId;
        }

        const relatedProducts = await Product.find(findRelated).sort({
            position: "desc"
        }).limit(4);

        const newRelatedProducts = relatedProducts.map(item => {
            item.priceNew = getPriceNew(item);
            return item;
        });

        res.render("client/pages/products/detail", {
            pageTitle: product.title,
            cssFile: "/client/css/product-detail.css",
            product: product,
            relatedProducts: newRelatedProducts
        });
    } catch (error) {
        res.redirect("/products");
    }
};
