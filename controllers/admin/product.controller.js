const Product = require("../../models/product.model");
const Category = require("../../models/category.model");
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const ensureDefaultCategories = require("../../helpers/defaultCategories");

const validateProduct = (body) => {
    const errors = [];
    const statusList = ["active", "inactive"];

    if (!body.title || body.title.trim() === "") {
        errors.push("Vui lòng nhập tiêu đề sản phẩm!");
    }

    const price = Number(body.price);
    if (body.price === "" || body.price === undefined || Number.isNaN(price) || price < 0) {
        errors.push("Giá sản phẩm phải là số lớn hơn hoặc bằng 0!");
    }

    if (body.discountPercentage !== "" && body.discountPercentage !== undefined) {
        const discountPercentage = Number(body.discountPercentage);

        if (Number.isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
            errors.push("Phần trăm giảm giá phải từ 0 đến 100!");
        }
    }

    const stock = Number(body.stock);
    if (body.stock !== "" && body.stock !== undefined && (Number.isNaN(stock) || stock < 0)) {
        errors.push("Số lượng tồn kho phải lớn hơn hoặc bằng 0!");
    }

    if (!statusList.includes(body.status)) {
        errors.push("Trạng thái sản phẩm không hợp lệ!");
    }

    const position = Number(body.position);
    if (body.position !== "" && body.position !== undefined && (Number.isNaN(position) || position < 1)) {
        errors.push("Vị trí sản phẩm phải lớn hơn hoặc bằng 1!");
    }

    return errors;
};

const normalizeProductPositions = async () => {
    const products = await Product.find({
        deleted: false
    }).sort({
        position: "asc",
        createdAt: "asc"
    });

    for (let i = 0; i < products.length; i++) {
        await Product.updateOne(
            {
                _id: products[i]._id
            },
            {
                position: i + 1
            }
        );
    }
};

const moveProductPosition = async (product, newPosition) => {
    const countProducts = await Product.countDocuments({
        deleted: false
    });
    const oldPosition = product.position || countProducts;
    const position = Math.max(1, Math.min(newPosition, countProducts));

    if (position < oldPosition) {
        await Product.updateMany(
            {
                _id: {
                    $ne: product._id
                },
                deleted: false,
                position: {
                    $gte: position,
                    $lt: oldPosition
                }
            },
            {
                $inc: {
                    position: 1
                }
            }
        );
    }

    if (position > oldPosition) {
        await Product.updateMany(
            {
                _id: {
                    $ne: product._id
                },
                deleted: false,
                position: {
                    $gt: oldPosition,
                    $lte: position
                }
            },
            {
                $inc: {
                    position: -1
                }
            }
        );
    }

    return position;
};

// [GET] /admin/products
module.exports.index = async (req, res) => {
    await ensureDefaultCategories();

    const filterStatus = filterStatusHelper(req.query);
    const objectSearch = searchHelper(req.query);

    const find = {
        deleted: false
    };

    if (req.query.status) {
        find.status = req.query.status;
    }

    if (objectSearch.regex) {
        find.title = objectSearch.regex;
    }

    const countProducts = await Product.countDocuments(find);
    const objectPagination = paginationHelper(
        {
            currentPage: 1,
            limitItems: 4
        },
        req.query,
        countProducts
    );

    const products = await Product.find(find)
        .sort({ position: "desc" })
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip);
    const categories = await Category.find({
        deleted: false
    });
    const categoryMap = {};
    categories.forEach(category => {
        categoryMap[category._id.toString()] = category.title;
    });

    res.render("admin/pages/products/index", {
        pageTitle: "Danh sách sản phẩm",
        cssFile: "/admin/css/products.css",
        products: products,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination,
        categoryMap: categoryMap
    });
};

// [GET] /admin/products/create
module.exports.create = async (req, res) => {
    await ensureDefaultCategories();

    const categories = await Category.find({
        deleted: false
    }).sort({
        position: "asc"
    });

    res.render("admin/pages/products/create", {
        pageTitle: "Thêm sản phẩm",
        cssFile: "/admin/css/products.css",
        categories: categories
    });
};

// [POST] /admin/products/create
module.exports.createPost = async (req, res) => {
    try {
        const errors = validateProduct(req.body);

        if (errors.length > 0) {
            errors.forEach(error => req.flash("error", error));
            res.redirect("/admin/products/create");
            return;
        }

        const maxPositionProduct = await Product.findOne({
            deleted: false
        }).sort({
            position: "desc"
        }).select("position");

        const maxPosition = maxPositionProduct ? maxPositionProduct.position : 0;
        let newPosition;

        if (req.body.position === "" || req.body.position === undefined) {
            newPosition = maxPosition + 1;
        } else {
            newPosition = Math.max(1, Math.min(parseInt(req.body.position), maxPosition + 1));

            if (newPosition <= maxPosition) {
                await Product.updateMany(
                    {
                        deleted: false,
                        position: {
                            $gte: newPosition
                        }
                    },
                    {
                        $inc: {
                            position: 1
                        }
                    }
                );
            }
        }

        req.body.position = newPosition;

        req.body.price = parseFloat(req.body.price) || 0;
        req.body.discountPercentage = parseFloat(req.body.discountPercentage) || 0;
        req.body.stock = parseInt(req.body.stock) || 0;
        req.body.thumbnail = req.file ? `/uploads/products/${req.file.filename}` : "";
        req.body.deleted = false;

        const product = new Product(req.body);
        await product.save();

        req.flash("success", "Tạo sản phẩm thành công!");
        res.redirect("/admin/products");
    } catch (error) {
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect("/admin/products/create");
    }
};

// [GET] /admin/products/edit/:id
module.exports.edit = async (req, res) => {
    await ensureDefaultCategories();

    let product;

    try {
        product = await Product.findOne({
            _id: req.params.id,
            deleted: false
        });
    } catch (error) {
        product = null;
    }

    if (!product) {
        req.flash("error", "Không tìm thấy sản phẩm!");
        res.redirect("/admin/products");
        return;
    }

    res.render("admin/pages/products/edit", {
        pageTitle: "Sửa sản phẩm",
        cssFile: "/admin/css/products.css",
        product: product,
        categories: await Category.find({
            deleted: false
        }).sort({
            position: "asc"
        })
    });
};

// [PATCH] /admin/products/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        const errors = validateProduct(req.body);

        if (errors.length > 0) {
            errors.forEach(error => req.flash("error", error));
            res.redirect(`/admin/products/edit/${req.params.id}`);
            return;
        }

        const product = await Product.findOne({
            _id: req.params.id,
            deleted: false
        });

        if (!product) {
            req.flash("error", "Có lỗi xảy ra!");
            res.redirect("/admin/products");
            return;
        }

        req.body.price = parseFloat(req.body.price) || 0;
        req.body.discountPercentage = parseFloat(req.body.discountPercentage) || 0;
        req.body.stock = parseInt(req.body.stock) || 0;
        req.body.position = await moveProductPosition(product, parseInt(req.body.position) || 1);

        if (req.file) {
            req.body.thumbnail = `/uploads/products/${req.file.filename}`;
        } else {
            delete req.body.thumbnail;
        }

        await Product.updateOne(
            {
                _id: req.params.id,
                deleted: false
            },
            req.body
        );

        req.flash("success", "Cập nhật sản phẩm thành công!");
        res.redirect("/admin/products");
    } catch (error) {
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect("/admin/products");
    }
};

// [GET] /admin/products/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            deleted: false
        });

        if (!product) {
            req.flash("error", "Không tìm thấy sản phẩm!");
            res.redirect("/admin/products");
            return;
        }

        product.priceNew = (product.price * (100 - product.discountPercentage) / 100).toFixed(0);

        res.render("admin/pages/products/detail", {
            pageTitle: "Chi tiết sản phẩm",
            cssFile: "/admin/css/products.css",
            product: product
        });
    } catch (error) {
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect("/admin/products");
    }
};

// [PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    try {
        await Product.updateOne(
            {
                _id: req.params.id,
                deleted: false
            },
            {
                status: req.params.status
            }
        );

        req.flash("success", "Thay đổi trạng thái thành công!");
        res.redirect(req.get("Referrer") || "/admin/products");
    } catch (error) {
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(req.get("Referrer") || "/admin/products");
    }
};

// [PATCH] /admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
    try {
        const type = req.body.type;
        const ids = req.body.ids ? req.body.ids.split(",") : [];

        if (ids.length === 0) {
            req.flash("error", "Vui lòng chọn ít nhất một sản phẩm!");
            res.redirect(req.get("Referrer") || "/admin/products");
            return;
        }

        switch (type) {
            case "active":
            case "inactive":
                await Product.updateMany(
                    {
                        _id: {
                            $in: ids
                        },
                        deleted: false
                    },
                    {
                        status: type
                    }
                );
                req.flash("success", "Thay đổi trạng thái thành công!");
                break;

            case "delete-all":
                await Product.updateMany(
                    {
                        _id: {
                            $in: ids
                        },
                        deleted: false
                    },
                    {
                        deleted: true,
                        deletedAt: new Date()
                    }
                );
                await normalizeProductPositions();
                req.flash("success", "Xóa nhiều sản phẩm thành công!");
                break;

            case "change-position":
                for (const item of ids) {
                    const [id, position] = item.split("-");
                    const product = await Product.findOne({
                        _id: id,
                        deleted: false
                    });

                    if (product) {
                        const newPosition = await moveProductPosition(product, parseInt(position) || 1);

                        await Product.updateOne(
                            {
                                _id: id,
                                deleted: false
                            },
                            {
                                position: newPosition
                            }
                        );
                    }
                }
                await normalizeProductPositions();
                req.flash("success", "Thay đổi vị trí thành công!");
                break;

            default:
                req.flash("error", "Có lỗi xảy ra!");
                break;
        }

        res.redirect(req.get("Referrer") || "/admin/products");
    } catch (error) {
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(req.get("Referrer") || "/admin/products");
    }
};

// [DELETE] /admin/products/delete/:id
module.exports.deleteItem = async (req, res) => {
    try {
        await Product.updateOne(
            {
                _id: req.params.id
            },
            {
                deleted: true,
                deletedAt: new Date()
            }
        );

        await normalizeProductPositions();
        req.flash("success", "Xóa sản phẩm thành công!");
        res.redirect("/admin/products");
    } catch (error) {
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect("/admin/products");
    }
};
