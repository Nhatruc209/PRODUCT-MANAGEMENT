const Category = require("../../models/category.model");
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const ensureDefaultCategories = require("../../helpers/defaultCategories");

const validate = (body) => {
    const errors = [];

    if (!body.title || body.title.trim() === "") {
        errors.push("Vui lòng nhập tên danh mục.");
    }

    if (!["active", "inactive"].includes(body.status)) {
        errors.push("Trạng thái không hợp lệ.");
    }

    return errors;
};

const normalizePositions = async () => {
    const categories = await Category.find({
        deleted: false
    }).sort({
        position: "asc",
        createdAt: "asc"
    });

    for (let i = 0; i < categories.length; i++) {
        await Category.updateOne({
            _id: categories[i]._id
        }, {
            position: i + 1
        });
    }
};

module.exports.index = async (req, res) => {
    await ensureDefaultCategories();

    const filterStatus = filterStatusHelper(req.query);
    const objectSearch = searchHelper(req.query);
    const find = {
        deleted: false
    };

    if (req.query.status) find.status = req.query.status;
    if (objectSearch.regex) find.title = objectSearch.regex;

    const categories = await Category.find(find).sort({
        position: "asc"
    });

    res.render("admin/pages/categories/index", {
        pageTitle: "Danh mục",
        cssFile: "/admin/css/categories.css",
        categories: categories,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword
    });
};

module.exports.create = (req, res) => {
    res.render("admin/pages/categories/create", {
        pageTitle: "Thêm danh mục",
        cssFile: "/admin/css/categories.css"
    });
};

module.exports.createPost = async (req, res) => {
    const errors = validate(req.body);

    if (errors.length > 0) {
        errors.forEach(error => req.flash("error", error));
        res.redirect("/admin/categories/create");
        return;
    }

    const count = await Category.countDocuments({
        deleted: false
    });

    const category = new Category({
        title: req.body.title,
        description: req.body.description,
        thumbnail: req.body.thumbnail,
        status: req.body.status,
        position: parseInt(req.body.position) || count + 1,
        deleted: false
    });

    await category.save();
    await normalizePositions();
    req.flash("success", "Tạo danh mục thành công.");
    res.redirect("/admin/categories");
};

module.exports.edit = async (req, res) => {
    const category = await Category.findOne({
        _id: req.params.id,
        deleted: false
    });

    if (!category) {
        req.flash("error", "Không tìm thấy danh mục.");
        res.redirect("/admin/categories");
        return;
    }

    res.render("admin/pages/categories/edit", {
        pageTitle: "Sửa danh mục",
        cssFile: "/admin/css/categories.css",
        category: category
    });
};

module.exports.editPatch = async (req, res) => {
    const errors = validate(req.body);

    if (errors.length > 0) {
        errors.forEach(error => req.flash("error", error));
        res.redirect(`/admin/categories/edit/${req.params.id}`);
        return;
    }

    await Category.updateOne({
        _id: req.params.id,
        deleted: false
    }, {
        title: req.body.title,
        description: req.body.description,
        thumbnail: req.body.thumbnail,
        status: req.body.status,
        position: parseInt(req.body.position) || 1
    });
    await normalizePositions();

    req.flash("success", "Cập nhật danh mục thành công.");
    res.redirect("/admin/categories");
};

module.exports.changeStatus = async (req, res) => {
    if (!["active", "inactive"].includes(req.params.status)) {
        req.flash("error", "Trạng thái không hợp lệ.");
        res.redirect("/admin/categories");
        return;
    }

    await Category.updateOne({
        _id: req.params.id,
        deleted: false
    }, {
        status: req.params.status
    });

    req.flash("success", "Cập nhật trạng thái thành công.");
    res.redirect(req.get("Referrer") || "/admin/categories");
};

module.exports.deleteItem = async (req, res) => {
    await Category.updateOne({
        _id: req.params.id,
        deleted: false
    }, {
        deleted: true,
        deletedAt: new Date()
    });

    await normalizePositions();
    req.flash("success", "Xóa danh mục thành công.");
    res.redirect("/admin/categories");
};
