const systemConfig = require("../../config/system");
const authMiddleware = require("../../middlewares/admin/auth.middleware");

const authRoutes = require("./auth.route");
const dashboardRoutes = require("./dashboard.route");
const productRoutes = require("./product.route");
const categoryRoutes = require("./category.route");
const orderRoutes = require("./order.route");

module.exports = (app) => {
    const PATH_ADMIN = systemConfig.prefixAdmin;

    app.use(PATH_ADMIN + "/auth", authRoutes);

    app.use(PATH_ADMIN, authMiddleware.requireAuth);
    app.get(PATH_ADMIN, (req, res) => res.redirect(PATH_ADMIN + "/dashboard"));
    app.use(PATH_ADMIN + "/dashboard", dashboardRoutes);
    app.use(PATH_ADMIN + "/products", productRoutes);
    app.use(PATH_ADMIN + "/categories", categoryRoutes);
    app.use(PATH_ADMIN + "/orders", orderRoutes);
};
